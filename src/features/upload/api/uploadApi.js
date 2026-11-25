// Gọi API của Feature Upload sheet (Backend: docs/api.md › Uploads).
// Lỗi đã được lib/axios.js chuẩn hoá thành { status, code, message }; message của BE là tiếng Anh, hiện thẳng được.
import apiClient from '../../../lib/axios';
import { UPLOAD_TIMEOUT_MS } from '../config/upload';

const isEmpty = (value) => value === undefined || value === null || value === '';

// File + các trường chữ -> FormData. Mảng gửi thành nhiều trường cùng tên (tracks=0&tracks=2), BE nhận được.
// Không tự đặt Content-Type: axios tự đặt multipart/form-data kèm boundary.
export const buildUploadForm = (file, fields = {}) => {
  const form = new FormData();
  if (file) form.append('file', file, file.name);
  Object.entries(fields).forEach(([field, value]) => {
    if (isEmpty(value)) return;
    if (Array.isArray(value)) value.forEach((item) => form.append(field, String(item)));
    else form.append(field, String(value));
  });
  return form;
};

const compactParams = (params) => Object.fromEntries(Object.entries(params).filter(([, value]) => !isEmpty(value)));

// lib/axios.js biến request bị huỷ (AbortController) thành NETWORK_ERROR "Unable to connect to the server".
// Upload hay huỷ lần phân tích cũ khi người dùng đổi track liên tục, nên trả mã riêng CANCELED để giao diện bỏ qua,
// không báo nhầm mất kết nối. (Sửa ở file dùng chung thì phải kiểm tra lại mọi nơi gọi API nên làm ở đây.)
export const CANCELED = 'CANCELED';
const withCancel = (request, signal) =>
  request.catch((error) => {
    throw signal?.aborted ? { status: null, code: CANCELED, message: 'The request was canceled.' } : error;
  });

// Bước 1: phân tích file, không lưu gì. tracks (tuỳ chọn): track đang chọn, gọi lại khi người dùng đổi lựa chọn.
// -> { fileName, suggestedTitle, suggestedDifficulty, bpm, timeSignature, keySignature, durationSec, noteCount,
//      tracks, suggestedTracks, selectedTracks, warnings }
export const analyzeMidi = (file, { tracks, signal, onUploadProgress } = {}) =>
  withCancel(
    apiClient
      .post('/uploads/midi/analyze', buildUploadForm(file, { tracks }), { signal, onUploadProgress, timeout: UPLOAD_TIMEOUT_MS })
      .then((res) => res.data),
    signal,
  );

// Bước 2: tạo bài từ file. fields: { title, composer, difficulty, tags[], coverColor, visibility, tracks[] }
// (U-BE-07) -> sheet vừa tạo
export const createSheet = (file, fields, { signal, onUploadProgress } = {}) =>
  withCancel(
    apiClient
      .post('/sheets', buildUploadForm(file, fields), { signal, onUploadProgress, timeout: UPLOAD_TIMEOUT_MS })
      .then((res) => res.data),
    signal,
  );

// Bài tôi đã upload (PUBLIC + PRIVATE), dạng giống GET /sheets: { data, meta } (U-BE-09)
export const getMySheets = (params = {}, { signal } = {}) =>
  withCancel(apiClient.get('/users/me/sheets', { params: compactParams(params), signal }).then((res) => res.data), signal);

// Bài PUBLIC của một người dùng, cho trang profile (U-BE-09)
export const getUserSheets = (userId, params = {}, { signal } = {}) =>
  withCancel(
    apiClient
      .get(`/users/${encodeURIComponent(userId)}/sheets`, { params: compactParams(params), signal })
      .then((res) => res.data),
    signal,
  );

// Sửa thông tin bài của mình, không đổi nốt. fields: { title, composer, difficulty, tags, coverColor, visibility } (U-BE-10)
export const updateSheet = (id, fields) =>
  apiClient.patch(`/sheets/${encodeURIComponent(id)}`, fields).then((res) => res.data);

// Xoá bài của mình (U-BE-10)
export const deleteSheet = (id) => apiClient.delete(`/sheets/${encodeURIComponent(id)}`).then((res) => res.data);
