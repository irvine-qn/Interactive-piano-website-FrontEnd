export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// BE trả đường dẫn tương đối của ảnh hồ sơ
export const toImageUrl = (path) => (path ? `${API_BASE_URL}${path}` : null);
export const PIANO_SAMPLES_BASE_URL = "https://tonejs.github.io/audio/salamander/";
