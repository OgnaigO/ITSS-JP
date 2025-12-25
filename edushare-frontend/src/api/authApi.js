// src/api/authApi.js
const API_BASE = "http://localhost:8080";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  return res.json();
}

// POST /api/auth/login
export function login({ email, password }) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// POST /api/auth/register
export function register({ email, username, password, role, school }) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, username, password, role, school }),
  });
}

// GET /api/users - Get all users
export function getAllUsers() {
  return request(`/api/users`, {
    method: "GET",
  });
}

// GET /api/users/{id}
export function getUserById(id) {
  return request(`/api/users/${id}`, {
    method: "GET",
  });
}

// PUT /api/users/{id}
export function updateUser(id, userData) {
  return request(`/api/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(userData),
  });
}

// POST /api/users/{id}/avatar
export async function uploadAvatar(id, file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/users/${id}/avatar`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  return res.json();
}