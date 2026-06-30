// DashboardLayout — SokoMoja
// Topbar avatar now shows the user's uploaded profile image if available,
// otherwise falls back to the first letter of their name.

import { useState } from "react";
import { Link } from "react-router-dom";
import { getUser, logout } from "../utils/auth";

export default function DashboardLayout({ title, navItems, children }) {
  const user = getUser() || { name: "User", role: "buyer" };
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const roleLabel = {
    buyer:  "Buyer",
    seller: "Farmer",
    admin:  "Administrator",
  }[user.role] || user.role;

  const initial     = user.name ? user.name.charAt(0).toUpperCase() : "?";
  const avatarUrl   = user.avatar_url || user.avatarUrl || null;

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>

      {/* ══════════ SIDEBAR ══════════ */}
      {sidebarOpen && (
        <div
          className="d-flex flex-column bg-white border-end"
          style={{ width: 220, flexShrink: 0 }}
        >
          {/* Logo */}
          <div className="px-3 py-4 border-bottom">
            <Link to="/" className="sm-logo text-decoration-none d-block">
              Soko<span>Moja</span>
            </Link>
          </div>

          {/* Nav links */}
          <nav className="flex-grow-1 py-3 px-2">
            {navItems.map((item, i) => (
              <Link
                key={i}
                to={item.path}
                className={`sm-nav-item mb-1 d-flex ${item.active ? "active" : ""}`}
              >
                <i
                  className={`bi ${item.icon} me-2`}
                  style={{ fontSize: "1rem", width: 20, textAlign: "center" }}
                ></i>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="px-2 py-3 border-top">
            <button
              className="sm-nav-item w-100 border-0 bg-transparent text-start d-flex align-items-center"
              onClick={logout}
            >
              <i
                className="bi bi-box-arrow-left me-2"
                style={{ fontSize: "1rem", width: 20, textAlign: "center" }}
              ></i>
              Log out
            </button>
          </div>
        </div>
      )}

      {/* ══════════ MAIN AREA ══════════ */}
      <div className="flex-grow-1 d-flex flex-column" style={{ background: "#f8f9fa", minWidth: 0 }}>

        {/* ── Topbar ── */}
        <div className="d-flex align-items-center justify-content-between px-4 py-3 bg-white border-bottom shadow-sm">
          <div className="d-flex align-items-center gap-3">
            {/* Sidebar toggle */}
            <button
              className="btn btn-sm btn-outline-secondary px-2"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              <i className={`bi bi-${sidebarOpen ? "layout-sidebar" : "layout-sidebar-reverse"}`}></i>
            </button>
            <h5 className="mb-0 fw-semibold">{title}</h5>
          </div>

          {/* User info */}
          <div className="d-flex align-items-center gap-2">
            {/* Avatar — image if set, initial letter otherwise */}
            <div
              className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
              style={{
                width: 38,
                height: 38,
                background: avatarUrl ? "transparent" : "#198754",
                fontSize: "0.9rem",
                border: "2px solid #d1e7dd",
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                initial
              )}
            </div>

            {/* Name + role text */}
            <div className="d-none d-sm-block">
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#212529", lineHeight: 1.2 }}>
                {user.name}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#6c757d" }}>{roleLabel}</div>
            </div>
          </div>
        </div>

        {/* ── Page content ── */}
        <div className="p-4 flex-grow-1">
          {children}
        </div>

      </div>
    </div>
  );
}
