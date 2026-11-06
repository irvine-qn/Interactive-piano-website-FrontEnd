import apiClient from "../../../lib/axios";

export const getLikedSheets = (params = {}, { signal } = {}) =>
  apiClient.get("/sheets/liked", { params, signal }).then((res) => res.data);

export const getMe = ({ signal } = {}) =>
  apiClient.get("/users/me", { signal }).then((res) => res.data);

export const updateProfile = (data) =>
  apiClient.put("/users/profile", data).then((res) => res.data);
