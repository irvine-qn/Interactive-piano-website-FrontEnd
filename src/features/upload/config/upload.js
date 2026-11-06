// Giới hạn file upload, phải khớp Backend (src/common/middlewares/upload.middleware.js)
export const MAX_MIDI_BYTES = 1024 * 1024;
export const MIDI_EXTENSIONS = ['.mid', '.midi'];
export const MIDI_ACCEPT = MIDI_EXTENSIONS.join(',');

// Gửi file có thể lâu hơn timeout chung 10 s của apiClient khi mạng chậm
export const UPLOAD_TIMEOUT_MS = 30000;
