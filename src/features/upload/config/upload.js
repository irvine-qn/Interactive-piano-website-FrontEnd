// Giới hạn file upload, phải khớp Backend (src/common/middlewares/upload.middleware.js)
export const MAX_MIDI_BYTES = 1024 * 1024;
export const MIDI_EXTENSIONS = ['.mid', '.midi'];
export const MIDI_ACCEPT = MIDI_EXTENSIONS.join(',');

// Gửi file có thể lâu hơn timeout chung 10 s của apiClient khi mạng chậm
export const UPLOAD_TIMEOUT_MS = 30000;

// Giới hạn thông tin bài (thẻ ③), Backend kiểm tra lại cùng giới hạn ở POST /sheets (U-BE-07).
// TITLE_MAX khớp MAX_TITLE_LENGTH của tên gợi ý (BE sheetSuggestions.js).
export const TITLE_MAX = 100;
export const COMPOSER_MAX = 100;
export const MAX_TAGS = 3;
export const TAG_MAX = 30;
export const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD', 'EXPERT'];

// Màu bìa giống bài mẫu (sheets.coverColor), tên màu hiện cho trình đọc màn hình
export const COVER_COLORS = { yellow: 'Yellow', pink: 'Pink', mint: 'Mint', lavender: 'Lavender' };
// Khớp enum Visibility của Backend. Bài upload mặc định PRIVATE (WBS D3)
export const VISIBILITY_OPTIONS = [
  { value: 'PUBLIC', label: 'Public', description: 'Anyone can find it in the Sheet Library and practice it.' },
  { value: 'PRIVATE', label: 'Private', description: 'Only you can see it. You can make it public later.' },
];
