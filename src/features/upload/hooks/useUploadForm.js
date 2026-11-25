import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { analyzeMidi, createSheet, CANCELED } from '../api/uploadApi';
import { validateMidiFile } from '../utils/midiFile';
import { cleanText, validateDetails } from '../utils/sheetDetails';
import { publishErrorTarget } from '../utils/publishError';
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
const PUBLISH_IDLE = { status: 'idle', progress: 0, error: null, target: null };

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
  // Gửi bài: idle -> uploading (progress) -> saving (BE chuyển file, lưu) -> done | error.
  // target: thẻ hiện lỗi (utils/publishError.js)
  const [publish, setPublish] = useState(PUBLISH_IDLE);
  // Lần phân tích đang chạy: chọn file khác / đổi track / rời trang thì huỷ, kết quả cũ không ghi đè kết quả mới
  const requestRef = useRef(null);
  const publishingRef = useRef(false);
  const publishRequestRef = useRef(null);

  const cancelRequest = useCallback(() => {
    requestRef.current?.abort();
    requestRef.current = null;
  }, []);

  // Rời trang: huỷ cả phân tích lẫn gửi bài đang chạy
  useEffect(
    () => () => {
      cancelRequest();
      publishRequestRef.current?.abort();
    },
    [cancelRequest],
  );

  // Đổi file / track thì lỗi gửi bài cũ của thẻ File / Tracks không còn đúng
  const clearFilePublishError = useCallback(
    () => setPublish((current) => (['file', 'tracks'].includes(current.target?.card) ? PUBLISH_IDLE : current)),
    [],
  );

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
      if (publishingRef.current) return;
      cancelRequest();
      clearFilePublishError();
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
    [cancelRequest, clearFilePublishError, requestAnalysis],
  );

  // Đổi track đang chọn (thẻ Tracks): BE tính lại số nốt, thời lượng, độ khó gợi ý, cảnh báo.
  // Lỗi (vd các track đã chọn không có nốt nào trong 88 phím) -> giữ lựa chọn cũ, báo lỗi trong thẻ.
  const changeTracks = useCallback(
    async (tracks) => {
      if (!file || !tracks.length || publishingRef.current) return;
      clearFilePublishError();
      setPendingTracks(tracks);
      setTrackError(null);
      const { result, error, stale } = await requestAnalysis(file, tracks);
      if (stale) return;
      setPendingTracks(null);
      if (error) setTrackError(error);
      else setAnalysis(result);
    },
    [file, clearFilePublishError, requestAnalysis],
  );

  // Bỏ file (nút ✕): thẻ Tracks / Details khoá lại, thông tin đã nhập vẫn giữ
  const removeFile = useCallback(() => {
    if (publishingRef.current) return;
    cancelRequest();
    clearFilePublishError();
    setFile(null);
    setAnalysis(null);
    setPendingTracks(null);
    setTrackError(null);
    setUpload(IDLE);
  }, [cancelRequest, clearFilePublishError]);

  const updateField = useCallback((name, value) => {
    if (publishingRef.current) return;
    setFields((current) => ({ ...current, [name]: value }));
    // Sửa đúng ô mà BE vừa báo lỗi thì bỏ lỗi đó
    setPublish((current) => (current.target?.field === name ? PUBLISH_IDLE : current));
  }, []);

  const details = useMemo(
    () => ({
      ...fields,
      title: fields.title ?? analysis?.suggestedTitle ?? '',
      difficulty: fields.difficulty ?? analysis?.suggestedDifficulty ?? null,
    }),
    [fields, analysis],
  );
  const detailErrors = useMemo(() => validateDetails(details), [details]);
  const isDetailsValid = Object.keys(detailErrors).length === 0;
  const isAnalyzed = analysis !== null;
  const isUpdatingTracks = pendingTracks !== null;
  const isPublishing = publish.status === 'uploading' || publish.status === 'saving';
  // Lý do chưa gửi được (title của nút Publish), null = gửi được
  const publishBlocker = !file
    ? 'Add a MIDI file first.'
    : !isAnalyzed || isUpdatingTracks
      ? 'Wait until the file is analyzed.'
      : !isDetailsValid
        ? 'Fix the sheet details first.'
        : null;

  // Gửi bài (POST /sheets) với file + thông tin + track đang chọn. -> sheet vừa tạo | null (lỗi / bị huỷ)
  // Trong lúc gửi mọi thao tác sửa bị bỏ qua (publishingRef), giao diện cũng khoá form.
  const publishSheet = useCallback(async () => {
    if (publishBlocker || publishingRef.current) return null;
    publishingRef.current = true;
    const controller = new AbortController();
    publishRequestRef.current = controller;
    setPublish({ status: 'uploading', progress: 0, error: null, target: null });
    try {
      const sheet = await createSheet(
        file,
        {
          title: cleanText(details.title),
          composer: cleanText(details.composer),
          difficulty: details.difficulty,
          tags: details.tags,
          coverColor: details.coverColor,
          visibility: details.visibility,
          tracks: analysis.selectedTracks,
        },
        {
          signal: controller.signal,
          onUploadProgress: ({ loaded, total }) => {
            if (!total) return;
            const progress = Math.min(100, Math.round((loaded / total) * 100));
            // Gửi xong file thì BE còn chuyển file và lưu bài
            setPublish({ status: progress < 100 ? 'uploading' : 'saving', progress, error: null, target: null });
          },
        },
      );
      setPublish({ status: 'done', progress: 100, error: null, target: null });
      return sheet;
    } catch (error) {
      if (error.code !== CANCELED) setPublish({ status: 'error', progress: 0, error, target: publishErrorTarget(error) });
      return null;
    } finally {
      publishingRef.current = false;
      publishRequestRef.current = null;
    }
  }, [publishBlocker, file, details, analysis]);

  // Lỗi gửi bài của một ô thẻ ③ hiện chung chỗ với lỗi kiểm tra ở FE (lỗi FE ưu tiên)
  const fieldErrors = useMemo(
    () => (publish.target?.card === 'details' ? { [publish.target.field]: publish.error.message, ...detailErrors } : detailErrors),
    [publish, detailErrors],
  );
  const publishErrorFor = (card) => (publish.target?.card === card ? publish.error : null);

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
    isUpdatingTracks,
    trackError,
    updateField,
    details,
    detailErrors: fieldErrors,
    isDetailsValid,
    // Thẻ Tracks / Details / Preview và nút Publish chỉ mở khi đã phân tích xong file
    isAnalyzed,
    // Gửi bài (U-FE-07)
    publish,
    publishSheet,
    publishBlocker,
    isPublishing,
    publishErrorFor,
  };
};
