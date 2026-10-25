import apiClient from '../../../lib/axios';

export const getSheet = (id, { signal } = {}) =>
  apiClient.get(`/sheets/${encodeURIComponent(id)}`, { signal }).then((res) => res.data);
