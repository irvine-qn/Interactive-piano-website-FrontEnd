import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { analyzeMidi, CANCELED } from '../api/uploadApi';
import { validateMidiFile } from '../utils/midiFile';
import { validateDetails } from '../utils/sheetDetails';
import { COVER_COLORS } from '../config/upload';

// State chung của trang /upload, gom một chỗ để các thẻ (File, Tracks, Details, Preview, Privacy) dùng chung:
// sửa thẻ này không làm mất dữ liệu thẻ khác. Logic từng thẻ thêm dần ở U-FE-03 → U-FE-07.
// title / difficulty = null: người dùng chưa sửa -> dùng gợi ý của Backend (đổi file / track thì gợi ý mới tự áp vào).
// Đã sửa thì giữ nguyên, phân tích lại không ghi đè. Giá trị thật dùng để hiển thị / gửi: `details`.
export const INITIAL_FIELDS = {
  title: null,
  composer: '',
  difficulty: null,
  tags: [],
  coverColor: null, // mỗi lần mở trang chọn ngẫu nhiên 1 màu (initFields)
  visibility: 'PRIVATE', // bài upload mặc định chỉ mình thấy (WBS D3)
};

const initFields = () => {
  const colors = Object.keys(COVER_COLORS);
  return { ...INITIAL_FIELDS, coverColor: colors[Math.floor(Math.random() * colors.length)] };
};

// Trạng thái gửi + phân tích file:
//   idle -> uploading (progress 0-99) -> analyzing (đã gửi xong, chờ BE) -> ready | error
const IDLE = { status: 'idle', progress: 0, error: null };

export const useUploadForm = () => {
  const [file, setFile] = useState(null);
  // Kết quả POST /uploads/midi/analyze (tracks, gợi ý tên, độ khó, BPM...), null = chưa phân tích
  const [analysis, setAnalysis] = useState(null);
  const [upload, setUpload] = useState(IDLE);
  // Đổi track: lựa chọn đang chờ BE tính lại (hiện ngay trên checkbox) và lỗi của lần đổi gần nhất.
  // Tách khỏi `upload` để dòng file không nhảy về "Analyzing" / "Failed" khi chỉ đổi track.
  const [pendingTracks, setPendingTracks] = useState(null);
  const [trackError, setTrackError] = useState(null);
  const [fields, setFields] = useState(initFields);
  // Lần phân tích đang chạy: chọn file khác / đổi track / rời trang thì huỷ, kết quả cũ không ghi đè kết quả mới
  const requestRef = useRef(null);

  const cancelRequest = useCallback(() => {
    requestRef.current?.abort();
    requestRef.current = null;
  }, []);

  useEffect(() => cancelRequest, [cancelRequest]);

  // Gọi analyze, huỷ lần trước. -> { result } | { error } | { stale: true } (đã bị lần gọi mới hơn thay thế)
  const requestAnalysis = useCallback(
    async (target, tracks, onProgress) => {
      cancelRequest();
      const controller = new AbortController();
      requestRef.current = controller;
      const isCurrent = () => requestRef.current === controller;
      try {
        const result = await analyzeMidi(target, {
          tracks,
          signal: controller.signal,
          onUploadProgress: (event) => {
            if (isCurrent()) onProgress?.(event);
          },
        });
        if (!isCurrent()) return { stale: true };
        requestRef.current = null;
        return { result };
      } catch (error) {
        if (error.code === CANCELED || !isCurrent()) return { stale: true };
        requestRef.current = null;
        return { error };
      }
    },
    [cancelRequest],
  );

  // Chọn / thả file mới: thay file cũ (huỷ lần phân tích cũ), kiểm tra ở FE trước khi gửi
  const selectFile = useCallback(
    async (nextFile) => {
      cancelRequest();
      setFile(nextFile);
      setAnalysis(null);
      setPendingTracks(null);
      setTrackError(null);
      const problem = validateMidiFile(nextFile);
      if (problem) {
        setUpload({ status: 'error', progress: 0, error: problem });
        return;
      }
      setUpload({ status: 'uploading', progress: 0, error: null });
      const { result, error, stale } = await requestAnalysis(nextFile, undefined, ({ loaded, total }) => {
        if (!total) return;
        const progress = Math.min(100, Math.round((loaded / total) * 100));
        setUpload({ status: progress < 100 ? 'uploading' : 'analyzing', progress, error: null });
      });
      if (stale) return;
      if (error) {
        setUpload({ status: 'error', progress: 0, error });
        return;
      }
      setAnalysis(result);
      setUpload({ status: 'ready', progress: 100, error: null });
    },
    [cancelRequest, requestAnalysis],
  );

  // Đổi track đang chọn (thẻ Tracks): BE tính lại số nốt, thời lượng, độ khó gợi ý, cảnh báo.
  // Lỗi (vd các track đã chọn không có nốt nào trong 88 phím) -> giữ lựa chọn cũ, báo lỗi trong thẻ.
  const changeTracks = useCallback(
    async (tracks) => {
      if (!file || !tracks.length) return;
      setPendingTracks(tracks);
      setTrackError(null);
      const { result, error, stale } = await requestAnalysis(file, tracks);
      if (stale) return;
      setPendingTracks(null);
      if (error) setTrackError(error);
      else setAnalysis(result);
    },
    [file, requestAnalysis],
  );

  // Bỏ file (nút ✕): thẻ Tracks / Details khoá lại, thông tin đã nhập vẫn giữ
  const removeFile = useCallback(() => {
    cancelRequest();
    setFile(null);
    setAnalysis(null);
    setPendingTracks(null);
    setTrackError(null);
    setUpload(IDLE);
  }, [cancelRequest]);

  const updateField = useCallback((name, value) => setFields((current) => ({ ...current, [name]: value })), []);

  const details = useMemo(
    () => ({
      ...fields,
      title: fields.title ?? analysis?.suggestedTitle ?? '',
      difficulty: fields.difficulty ?? analysis?.suggestedDifficulty ?? null,
    }),
    [fields, analysis],
  );
  const detailErrors = useMemo(() => validateDetails(details), [details]);

  return {
    file,
    analysis,
    upload,
    fields,
    selectFile,
    removeFile,
    changeTracks,
    // Track đang chọn: lựa chọn đang chờ BE (nếu có), không thì lựa chọn BE đã tính
    selectedTracks: pendingTracks ?? analysis?.selectedTracks ?? [],
    isUpdatingTracks: pendingTracks !== null,
    trackError,
    updateField,
    details,
    detailErrors,
    isDetailsValid: Object.keys(detailErrors).length === 0,
    // Thẻ Tracks / Details / Preview và nút Publish chỉ mở khi đã phân tích xong file
    isAnalyzed: analysis !== null,
  };
};
