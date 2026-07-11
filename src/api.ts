// In production, use the environment variable for cross-origin requests.
// In local dev, if VITE_FRAPPE_URL isn't set, it falls back to relative path for proxying.
export const API_BASE = import.meta.env.VITE_FRAPPE_URL || "";

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token = import.meta.env.VITE_FRAPPE_TOKEN;
  if (token) {
    headers.set("Authorization", token.includes("token") ? token : `token ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
};
