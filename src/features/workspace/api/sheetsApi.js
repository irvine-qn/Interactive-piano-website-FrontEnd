import apiClient from '../../../lib/axios';

export const getSheet = (id, { signal } = {}) =>
  apiClient.get(`/sheets/${encodeURIComponent(id)}`, { signal }).then((res) => res.data);

// Tăng 1 lượt xem, trả { views } (tổng mới)
export const recordView = (id) =>
  apiClient.post(`/sheets/${encodeURIComponent(id)}/view`).then((res) => res.data);
