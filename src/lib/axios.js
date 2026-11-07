import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { useAuthStore } from '../store/useAuthStore';

export { API_BASE_URL };

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) useAuthStore.getState().clearAuth();
    const apiError = error.response?.data?.error;
    return Promise.reject({
      status: error.response?.status ?? null,
      code: apiError?.code ?? 'NETWORK_ERROR',
      message: apiError?.message ?? 'Unable to connect to the server',
      // Thông tin thêm của lỗi nếu BE gửi, vd { field: 'title' } ở POST /sheets (upload hiện lỗi dưới đúng ô)
      details: apiError?.details,
    });
  },
);

export default apiClient;
