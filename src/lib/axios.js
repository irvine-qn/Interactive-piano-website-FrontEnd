import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
});

// Chuẩn hoá lỗi: BE trả { error: { code, message } }, mất kết nối thì không có response
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = error.response?.data?.error;
    return Promise.reject({
      status: error.response?.status ?? null,
      code: apiError?.code ?? 'NETWORK_ERROR',
      message: apiError?.message ?? 'Không thể kết nối tới máy chủ',
    });
  },
);

export default apiClient;
