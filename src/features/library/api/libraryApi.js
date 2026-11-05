import apiClient from '../../../lib/axios';

// Bỏ các tham số rỗng để URL gọn (?q=&tag= không cần gửi lên BE)
const compactParams = (params) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );

// params: { q, difficulty, tag, sort, page, pageSize } -> { data: Sheet[], meta: { page, pageSize, total, totalPages } }
export const getSheets = (params = {}, { signal } = {}) =>
  apiClient.get('/sheets', { params: compactParams(params), signal }).then((res) => res.data);

// -> { data: [{ name, count }] }
export const getTags = ({ signal } = {}) =>
  apiClient.get('/sheets/tags', { signal }).then((res) => res.data);
