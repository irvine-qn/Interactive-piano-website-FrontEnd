import { API_BASE_URL } from "../../../config/api";

const BASE_URL = `${API_BASE_URL}/api/v1/auth`;

export async function loginUser({ identifier, password }) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function registerUser({ displayName, username, email, password }) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ displayName, username, email, password }),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function forgotPassword({ email }) {
  const res = await fetch(`${BASE_URL}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}
