// DashboardLayout — SokoMoja
// Topbar avatar shows the user's uploaded profile image if available,
// otherwise falls back to the first letter of their name.

import { useState } from "react";
import { Link } from "react-router-dom";
import { getUser, logout } from "../utils/auth";

export default function DashboardLayout({ title, navItems, children }) {
  const user = getUser() || { name: "User", role: "buyer" };

  // Desktop: sidebar can be collapsed entirely (topbar toggle).
  // Mobile: sidebar slides in as an overlay drawer (hamburger toggle).
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const roleLabel = {
    buyer:  "Buyer",
    seller: "Farmer",
    admin:  "Administrator",
  }[user.role] || user.role;

  const initial   = user.name ? user.name.charAt(0).toUpperCase() : "?";
  const avatarUrl = user.avatar_url || user.avatarUrl || null;

  return (
    <div className="sm-dashboard">

      {/* Overlay for mobile drawer */}
      {mobileOpen && (
        <div className="sm-sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* ══════════ SIDEBAR ══════════ */}
      <aside className={`sm-sidebar ${mobileOpen ? "open" : ""} ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sm-sidebar-brand">
          <Link to="/" className="sm-logo">
            Soko<span>Moja</span>
          </Link>
        </div>

        <nav className="sm-sidebar-nav">
          {navItems.map((item, i) => (
            <Link
              key={i}
              to={item.path}
              className={`sm-nav-item ${item.active ? "active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              <i className={`bi ${item.icon} sm-nav-icon`}></i>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sm-sidebar-footer">
          <button className="sm-nav-item" onClick={logout}>
            <i className="bi bi-box-arrow-left sm-nav-icon"></i>
            Log out
          </button>
        </div>
      </aside>

      {/* ══════════ MAIN AREA ══════════ */}
      <main className={`sm-main ${sidebarCollapsed ? "collapsed" : ""}`}>

        {/* ── Topbar ── */}
        <div className="sm-topbar">
          <div className="d-flex align-items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="btn btn-sm btn-outline-secondary d-lg-none"
              onClick={() => setMobileOpen(true)}
              title="Open menu"
            >
              <i className="bi bi-list"></i>
            </button>
            {/* Desktop sidebar collapse toggle */}
            <button
              className="btn btn-sm btn-outline-secondary d-none d-lg-inline-block"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
            >
              <i className={`bi bi-${sidebarCollapsed ? "layout-sidebar-reverse" : "layout-sidebar"}`}></i>
            </button>
            <h5 className="sm-topbar-title mb-0">{title}</h5>
          </div>

          {/* User info */}
          <div className="d-flex align-items-center gap-2">
            <div className="sm-avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt={user.name} />
              ) : (
                initial
              )}
            </div>
            <div className="d-none d-sm-block">
              <div style={{ fontSize: "0.85rem", fontWeight: 600, lineHeight: 1.2 }}>
                {user.name}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--sm-text-muted)" }}>{roleLabel}</div>
            </div>
          </div>
        </div>

        {/* ── Page content ── */}
        <div className="sm-page-content">
          {children}
        </div>

      </main>
    </div>
  );
}
