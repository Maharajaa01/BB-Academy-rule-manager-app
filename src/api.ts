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

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Intercept the .json() method to automatically unwrap Frappe's "message" wrapper
  // This is required when fetching directly from Frappe bypassing the local proxy
  const originalJson = response.json.bind(response);
  response.json = async () => {
    let data = await originalJson();
    if (data && data.message && typeof data.message === "object" && data.message.status) {
      data = data.message;
    }
    return data;
  };

  return response;
};
