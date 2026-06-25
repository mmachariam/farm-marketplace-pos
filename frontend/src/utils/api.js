// ===========================================
// API HELPER
// Centralizes all calls to the Laravel backend.
// Automatically attaches the JWT token (if logged in)
// and handles JSON parsing + error throwing.
//
// Usage:
//   import { apiRequest } from "../utils/api";
//   const data = await apiRequest("/products");          // GET
//   const data = await apiRequest("/orders", "POST", body); // POST
// ===========================================

import { getToken } from "./auth";

// Base URL of the Laravel backend.
// Change this if your backend runs on a different port.
const BASE_URL = "http://localhost:8000/api";

export async function apiRequest(endpoint, method = "GET", body = null) {
  const token = getToken(); // returns null if not logged in

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // Attach JWT token if the user is logged in
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  // Try to parse JSON response even on errors (Laravel returns JSON error messages)
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Throw an error with the message from the backend (or a fallback)
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  return data;
}