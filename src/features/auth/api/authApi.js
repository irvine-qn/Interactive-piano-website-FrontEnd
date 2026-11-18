import { API_BASE_URL } from "../../../config/api";
import apiClient from "../../../lib/axios";

const BASE_URL = `${API_BASE_URL}/api/v1/auth`;

const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Incorrect username/email or password.",
  USERNAME_TAKEN: "This username is already taken.",
  EMAIL_TAKEN: "This email is already in use.",
  VALIDATION_FAILED: "Some information is invalid. Please check and try again.",
  NOT_FOUND: "This feature is not available yet.",
  EMAIL_NOT_VERIFIED: "This account's email has not been verified yet.",
  TOO_MANY_REQUESTS: "Too many attempts. Please wait a few minutes and try again.",
  INVALID_TOKEN: "This link is invalid or has expired.",
  ALREADY_VERIFIED: "Your email is already verified.",
  NETWORK_ERROR: "Unable to connect to the server.",
};

const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again.";

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

export const resetPassword = ({ token, password }) =>
  postJson("/reset-password", { token, password });

export const verifyEmail = ({ token }) => postJson("/verify-email", { token });

export const resendVerification = () =>
  apiClient.post("/auth/verify-email/resend").then((res) => res.data).catch((error) => {
    throw { code: error.code, message: ERROR_MESSAGES[error.code] || error.message || DEFAULT_ERROR_MESSAGE };
  });
