import { useCallback, useEffect, useRef, useState } from 'react';
import { analyzeMidi, CANCELED } from '../api/uploadApi';
import { validateMidiFile } from '../utils/midiFile';

// State chung của trang /upload, gom một chỗ để các thẻ (File, Tracks, Details, Preview, Privacy) dùng chung:
// sửa thẻ này không làm mất dữ liệu thẻ khác. Logic từng thẻ thêm dần ở U-FE-03 → U-FE-07.
export const INITIAL_FIELDS = {
  title: '',
  composer: '',
  difficulty: null, // null = chưa chọn, dùng mức gợi ý của Backend
  tags: [],
  coverColor: null, // null = chọn khi có file (U-FE-06)
  visibility: 'PRIVATE', // bài upload mặc định chỉ mình thấy (WBS D3)
};

// Trạng thái gửi + phân tích file:
//   idle -> uploading (progress 0-99) -> analyzing (đã gửi xong, chờ BE) -> ready | error
const IDLE = { status: 'idle', progress: 0, error: null };

export const useUploadForm = () => {
  const [file, setFile] = useState(null);
  // Kết quả POST /uploads/midi/analyze (tracks, gợi ý tên, độ khó, BPM...), null = chưa phân tích
  const [analysis, setAnalysis] = useState(null);
  const [upload, setUpload] = useState(IDLE);
  const [fields, setFields] = useState(INITIAL_FIELDS);
  // Lần phân tích đang chạy: chọn file khác / đổi track / rời trang thì huỷ, kết quả cũ không ghi đè kết quả mới
  const requestRef = useRef(null);

  const cancelRequest = useCallback(() => {
    requestRef.current?.abort();
    requestRef.current = null;
  }, []);

  useEffect(() => cancelRequest, [cancelRequest]);

  // tracks (tuỳ chọn): phân tích lại theo track đang chọn (U-FE-04)
  const analyze = useCallback(
    async (target, tracks) => {
      cancelRequest();
      const controller = new AbortController();
      requestRef.current = controller;
      const isCurrent = () => requestRef.current === controller;
      setUpload({ status: 'uploading', progress: 0, error: null });

      try {
        const result = await analyzeMidi(target, {
          tracks,
          signal: controller.signal,
          onUploadProgress: ({ loaded, total }) => {
            if (!isCurrent() || !total) return;
            const progress = Math.min(100, Math.round((loaded / total) * 100));
            setUpload({ status: progress < 100 ? 'uploading' : 'analyzing', progress, error: null });
          },
        });
        if (!isCurrent()) return;
        requestRef.current = null;
        setAnalysis(result);
        setUpload({ status: 'ready', progress: 100, error: null });
      } catch (error) {
        if (error.code === CANCELED || !isCurrent()) return;
        requestRef.current = null;
        setUpload({ status: 'error', progress: 0, error });
      }
    },
    [cancelRequest],
  );

  // Chọn / thả file mới: thay file cũ (huỷ lần phân tích cũ), kiểm tra ở FE trước khi gửi
  const selectFile = useCallback(
    (nextFile) => {
      cancelRequest();
      setFile(nextFile);
      setAnalysis(null);
      const problem = validateMidiFile(nextFile);
      if (problem) {
        setUpload({ status: 'error', progress: 0, error: problem });
        return;
      }
      analyze(nextFile);
    },
    [analyze, cancelRequest],
  );

  // Bỏ file (nút ✕): thẻ Tracks / Details khoá lại, thông tin đã nhập vẫn giữ
  const removeFile = useCallback(() => {
    cancelRequest();
    setFile(null);
    setAnalysis(null);
    setUpload(IDLE);
  }, [cancelRequest]);

  const updateField = useCallback((name, value) => setFields((current) => ({ ...current, [name]: value })), []);

  return {
    file,
    analysis,
    upload,
    fields,
    selectFile,
    removeFile,
    analyze,
    updateField,
    // Thẻ Tracks / Details / Preview và nút Publish chỉ mở khi đã phân tích xong file
    isAnalyzed: analysis !== null,
  };
};
