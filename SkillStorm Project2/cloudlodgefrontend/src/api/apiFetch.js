const API_BASE_URL = "http://localhost:8080";

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // Attach token if it exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Automatically stringify JSON body if it's an object
  const body =
    options.body && typeof options.body === "object"
      ? JSON.stringify(options.body)
      : options.body;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    body,
  });

  // Handle expired/invalid token globally
  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  // Handle non-OK responses
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "API error");
  }

  return response.json();
}
