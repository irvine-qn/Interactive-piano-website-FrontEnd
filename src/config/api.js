const DEFAULT_API_PORT = 5000;

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window === "undefined"
    ? `http://localhost:${DEFAULT_API_PORT}`
    : `${window.location.protocol}//${window.location.hostname}:${DEFAULT_API_PORT}`);

// BE trả đường dẫn tương đối của ảnh hồ sơ
export const toImageUrl = (path) => (path ? `${API_BASE_URL}${path}` : null);
export const PIANO_SAMPLES_BASE_URL = "https://tonejs.github.io/audio/salamander/";
