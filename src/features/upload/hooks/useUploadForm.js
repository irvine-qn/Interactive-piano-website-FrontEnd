import { useCallback, useState } from 'react';

// State chung của trang /upload, gom một chỗ để các thẻ (File, Tracks, Details, Preview, Privacy) dùng chung:
// sửa thẻ này không làm mất dữ liệu thẻ khác. Logic từng thẻ thêm ở U-FE-03 → U-FE-07.
export const INITIAL_FIELDS = {
  title: '',
  composer: '',
  difficulty: null, // null = chưa chọn, dùng mức gợi ý của Backend
  tags: [],
  coverColor: null, // null = chọn khi có file (U-FE-06)
  visibility: 'PRIVATE', // bài upload mặc định chỉ mình thấy (WBS D3)
};

export const useUploadForm = () => {
  const [file, setFile] = useState(null);
  // Kết quả POST /uploads/midi/analyze (tracks, gợi ý tên, độ khó, BPM...), null = chưa phân tích
  const [analysis, setAnalysis] = useState(null);
  const [fields, setFields] = useState(INITIAL_FIELDS);

  const updateField = useCallback((name, value) => setFields((current) => ({ ...current, [name]: value })), []);

  const reset = useCallback(() => {
    setFile(null);
    setAnalysis(null);
    setFields(INITIAL_FIELDS);
  }, []);

  return {
    file,
    setFile,
    analysis,
    setAnalysis,
    fields,
    updateField,
    reset,
    // Thẻ Tracks / Details / Preview và nút Publish chỉ mở khi đã phân tích xong file
    isAnalyzed: analysis !== null,
  };
};
