import apiClient from "../../../lib/axios";

export const getLikedSheets = (params = {}, { signal } = {}) =>
  apiClient.get("/sheets/liked", { params, signal }).then((res) => res.data);
