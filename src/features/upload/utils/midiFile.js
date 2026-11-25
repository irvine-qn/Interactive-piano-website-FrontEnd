import { MAX_MIDI_BYTES, MIDI_EXTENSIONS } from '../config/upload';

// Kiểm tra file ngay ở FE trước khi gửi (khớp Backend upload.middleware.js), câu báo lỗi giống BE.
// -> null nếu hợp lệ, hoặc lỗi dạng { code, message } như lỗi chuẩn hoá từ lib/axios.
export const validateMidiFile = (file) => {
  if (!file) return { code: 'FILE_REQUIRED', message: 'Please choose a MIDI file to upload.' };
  const name = file.name.toLowerCase();
  if (!MIDI_EXTENSIONS.some((extension) => name.endsWith(extension))) {
    return { code: 'UNSUPPORTED_FILE', message: 'Only MIDI files (.mid, .midi) can be uploaded.' };
  }
  if (file.size === 0) return { code: 'UNSUPPORTED_FILE', message: 'This file is empty.' };
  if (file.size > MAX_MIDI_BYTES) return { code: 'FILE_TOO_LARGE', message: 'The MIDI file must be at most 1 MB.' };
  return null;
};
