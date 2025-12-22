const API_BASE_URL = "http://localhost:8080";

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  // Default headers
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // Attach JWT token if available
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Automatically stringify body if it's an object
  const body =
    options.body && typeof options.body === "object"
      ? JSON.stringify(options.body)
      : options.body;

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      body,
    });

    // Handle global auth errors
    if (response.status === 401) {
      // Not logged in or invalid token
      localStorage.removeItem("token");
      window.location.href = "/login";
      throw new Error("Unauthorized. Please log in.");
    }

    if (response.status === 403) {
      // Forbidden (role mismatch)
      throw new Error("Forbidden. You do not have access to this resource.");
    }

    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "API error");
    }

    // Try parsing JSON, fallback to empty object
    return response.json().catch(() => ({}));
  } catch (err) {
    console.error("API Fetch Error:", err);
    throw err;
  }
}
