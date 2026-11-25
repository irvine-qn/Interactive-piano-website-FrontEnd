import apiClient, { API_BASE_URL } from '../../../lib/axios';

export const getSheet = (id, { signal } = {}) =>
  apiClient.get(`/sheets/${encodeURIComponent(id)}`, { signal }).then((res) => res.data);

export const getSheetScore = (id, { signal } = {}) =>
  apiClient.get(`/sheets/${encodeURIComponent(id)}/score`, { signal }).then((res) => res.data);

export const recordView = (id) =>
  apiClient.post(`/sheets/${encodeURIComponent(id)}/view`).then((res) => res.data);

// Dung fetch keepalive de request van duoc gui khi nguoi dung dong tab
export const savePracticeSession = (id, data, accessToken) =>
  fetch(`${API_BASE_URL}/api/v1/sheets/${encodeURIComponent(id)}/practice-sessions`, {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(data),
  });
