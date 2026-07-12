// In production, use the environment variable for cross-origin requests.
// In local dev, we use an empty string so the Vite proxy handles the request.
export const API_BASE = import.meta.env.DEV ? "" : (import.meta.env.VITE_FRAPPE_URL || "");
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // DEMO FIX: Hardcode your API Key and Secret here to completely bypass browser cookie issues!
  // Format: "token YOUR_API_KEY:YOUR_API_SECRET"
  const HARDCODED_TOKEN = ""; // e.g. "token 123456789:abcdefghi"
  
  let token = import.meta.env.VITE_FRAPPE_TOKEN || HARDCODED_TOKEN;
  if (token) {
    token = token.replace(/['"]/g, '').trim(); 
    headers.set("Authorization", token.toLowerCase().startsWith("token") ? token : `token ${token}`);
  }

  const csrfToken = localStorage.getItem("frappe_csrf_token");
  if (csrfToken) {
    headers.set("X-Frappe-CSRF-Token", csrfToken);
  }

  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers,
  });

  // Extract CSRF token from successful responses and store it
  try {
    const cloned = response.clone();
    const data = await cloned.json();
    if (data?.data?.csrf_token) {
      localStorage.setItem("frappe_csrf_token", data.data.csrf_token);
    }
  } catch (e) {
    // Ignore JSON parse errors
  }

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
