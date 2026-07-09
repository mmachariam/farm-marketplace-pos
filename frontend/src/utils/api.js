// ===========================================
// API HELPER — SokoMoja
// Centralizes all calls to the Laravel backend.
// Automatically attaches the JWT token and handles errors.
//
// Usage:
//   import { apiRequest } from "../utils/api";
//   const data = await apiRequest("/auth/login", "POST", { email, password });
// ===========================================

import { getToken, logout } from "./auth";

// Backend runs at localhost:8000 (Laravel dev server)
// frontend runs at localhost:5173 (Vite dev server)
// In production change this to your real API domain.
const BASE_URL = "http://localhost:8000/api";

export async function apiRequest(endpoint, method = "GET", body = null) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    "Accept":        "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  // Parse JSON regardless of status code
  // (Laravel returns JSON error messages too)
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Use the message from the Laravel validation/error response
    const message = data?.message || `Request failed: ${response.status}`;
    const error   = new Error(message);
    error.errors  = data?.errors || {}; // field-level validation errors
    error.status  = response.status;

    // Auto-logout on token expiry — only when a token was actually sent.
    // (Anonymous requests like /auth/login also return 401 for bad
    // credentials; that must not trigger a logout/redirect.)
    if (response.status === 401 && token) {
      logout();
    }

    throw error;
  }

  return data;
}

// ── Multipart form upload (for avatar images) ──────────────────────
// Can't use JSON for file uploads — needs FormData
export async function apiUpload(endpoint, formData) {
  const token = getToken();

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Accept":        "application/json",
      // NOTE: do NOT set Content-Type here — browser sets it automatically
      // with the correct multipart boundary when using FormData
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || `Upload failed: ${response.status}`;
    const error   = new Error(message);
    error.errors  = data?.errors || {};
    throw error;
  }

  return data;
}

// ── File download (PDF/Excel report exports) ───────────────────────
// The backend streams a binary file, not JSON, so this fetches it as a
// blob and triggers a save-as via a throwaway <a> tag. Auth still needs
// the Bearer header, which is why a plain <a href> can't be used.
export async function apiDownload(endpoint, fallbackFilename = "download") {
  const token = getToken();

  const headers = { "Accept": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, { headers });

  if (!response.ok) {
    const data    = await response.json().catch(() => null);
    const message = data?.message || `Download failed: ${response.status}`;
    const error   = new Error(message);
    error.errors  = data?.errors || {};
    error.status  = response.status;
    throw error;
  }

  const disposition = response.headers.get("Content-Disposition") || "";
  const match        = disposition.match(/filename="?([^"]+)"?/);
  const filename      = match ? match[1] : fallbackFilename;

  const blob = await response.blob();
  const url  = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href     = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}