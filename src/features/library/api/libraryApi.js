import apiClient from '../../../lib/axios';

const compactParams = (params) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );

export const getSheets = (params = {}, { signal } = {}) =>
  apiClient.get('/sheets', { params: compactParams(params), signal }).then((res) => res.data);

export const getTags = ({ signal } = {}) =>
  apiClient.get('/sheets/tags', { signal }).then((res) => res.data);

export const toggleSheetLike = (id) =>
  apiClient.post(`/sheets/${encodeURIComponent(id)}/like`).then((res) => res.data);
