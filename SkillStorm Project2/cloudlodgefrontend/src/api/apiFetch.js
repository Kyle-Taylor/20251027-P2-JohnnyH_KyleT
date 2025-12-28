export const API_BASE_URL = "http://54.237.236.102:8080";

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = { ...(options.headers || {}) };

  // Attach JWT always
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let body = options.body;

  // Only JSON-stringify plain objects
  if (
    body &&
    typeof body === "object" &&
    !(body instanceof FormData)
  ) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    body,
    credentials: "include",
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (response.status === 403) {
    throw new Error("Forbidden. You do not have access to this resource.");
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "API error");
  }

  return response.status === 204 ? null : response.json();
}
