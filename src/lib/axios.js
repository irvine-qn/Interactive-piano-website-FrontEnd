import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export { API_BASE_URL };

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
