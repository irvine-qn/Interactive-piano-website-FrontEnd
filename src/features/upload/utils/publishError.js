// Lỗi khi gửi bài (POST /sheets) hiện ở thẻ nào của trang /upload:
//   details: 422 VALIDATION_FAILED có details.field là ô của thẻ ③ -> hiện dưới ô đó
//   file:    lỗi của chính file (hỏng, quá lớn, sai loại...) -> thẻ ①
//   tracks:  lựa chọn track không dùng được -> thẻ ②
//   page:    còn lại (mất kết nối, hết phiên đăng nhập, lỗi server...) -> dưới nút Publish
const DETAIL_FIELDS = ['title', 'composer', 'difficulty', 'tags'];
const FILE_CODES = ['FILE_REQUIRED', 'UNEXPECTED_FILE', 'INVALID_UPLOAD', 'FILE_TOO_LARGE', 'UNSUPPORTED_FILE', 'INVALID_MIDI', 'MIDI_TOO_LARGE'];
const TRACK_CODES = ['INVALID_TRACKS', 'NO_NOTES'];

export const publishErrorTarget = (error) => {
  const field = error?.details?.field;
  if (error?.code === 'VALIDATION_FAILED' && DETAIL_FIELDS.includes(field)) return { card: 'details', field };
  if (FILE_CODES.includes(error?.code)) return { card: 'file' };
  if (TRACK_CODES.includes(error?.code)) return { card: 'tracks' };
  return { card: 'page' };
};
