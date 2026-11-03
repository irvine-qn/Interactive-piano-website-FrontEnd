import { API_BASE_URL } from "../../../config/api";

const BASE_URL = `${API_BASE_URL}/api/v1/auth`;

const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Tên đăng nhập/email hoặc mật khẩu không đúng.",
  USERNAME_TAKEN: "Tên người dùng đã tồn tại.",
  EMAIL_TAKEN: "Email đã được sử dụng.",
  VALIDATION_FAILED: "Thông tin chưa hợp lệ. Vui lòng kiểm tra lại.",
  NOT_FOUND: "Tính năng này chưa sẵn sàng.",
  NETWORK_ERROR: "Không thể kết nối tới máy chủ.",
};

const DEFAULT_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại.";

const postJson = async (path, body) => {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw { code: "NETWORK_ERROR", message: ERROR_MESSAGES.NETWORK_ERROR };
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const code = data?.error?.code;
    throw { code, message: ERROR_MESSAGES[code] || DEFAULT_ERROR_MESSAGE };
  }
  return data;
};

export const loginUser = ({ identifier, password }) =>
  postJson("/login", { identifier, password });

export const registerUser = ({ displayName, username, email, password }) =>
  postJson("/register", { displayName, username, email, password });

export const forgotPassword = ({ email }) =>
  postJson("/forgot-password", { email });
