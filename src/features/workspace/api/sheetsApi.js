import apiClient from '../../../lib/axios';

export const getSheet = (id, { signal } = {}) =>
  apiClient.get(`/sheets/${encodeURIComponent(id)}`, { signal }).then((res) => res.data);

export const getSheetScore = (id, { signal } = {}) =>
  apiClient.get(`/sheets/${encodeURIComponent(id)}/score`, { signal }).then((res) => res.data);

export const recordView = (id) =>
  apiClient.post(`/sheets/${encodeURIComponent(id)}/view`).then((res) => res.data);
