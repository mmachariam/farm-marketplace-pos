// ===========================================
// AUTH UTILITY
// Small helper functions for storing/reading the JWT token
// and logged-in user info from localStorage.
//
// Why localStorage: simple for now since this is a 3-week project.
// In a more advanced setup you'd use httpOnly cookies for security.
// ===========================================

const TOKEN_KEY = "shamba_token";
const USER_KEY = "shamba_user";

// ---- TOKEN ----
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ---- USER INFO ----
// Stores basic user info (id, name, role, region) so the dashboard
// can display "Welcome, Jane" without an extra API call every page load.
export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
}

// ---- LOGOUT ----
// Clears everything and redirects to login
export function logout() {
  clearToken();
  clearUser();
  window.location.href = "/login";
}

// ---- AUTH CHECK ----
// Returns true if a token exists (user appears logged in)
export function isAuthenticated() {
  return !!getToken();
}