import apiClient from "../../../lib/axios";

export const getLikedSheets = (params = {}, { signal } = {}) =>
  apiClient.get("/sheets/liked", { params, signal }).then((res) => res.data);

export const getMe = ({ signal } = {}) =>
  apiClient.get("/users/me", { signal }).then((res) => res.data);

export const updateProfile = (data) =>
  apiClient.put("/users/profile", data).then((res) => res.data);

export const uploadProfileImage = (kind, file) => {
  const form = new FormData();
  form.append("file", file, "photo.webp");
  return apiClient.put(`/users/profile/images/${kind}`, form, { timeout: 30000 }).then((res) => res.data);
};

export const deleteProfileImage = (kind) =>
  apiClient.delete(`/users/profile/images/${kind}`).then((res) => res.data);

export const getPracticeHistory = (params = {}, { signal } = {}) =>
  apiClient.get("/sheets/practice-history", { params, signal }).then((res) => res.data);
