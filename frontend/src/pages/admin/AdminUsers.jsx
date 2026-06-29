// AdminUsers — SokoMoja
// Wired to real backend:
// GET    /api/admin/users
// PATCH  /api/admin/users/{id}         (suspend/activate)
// PATCH  /api/admin/users/{id}/verify  (verify farmer)

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { apiRequest } from "../../utils/api";

export default function AdminUsers() {
  const navItems = [
    { label: "Overview",  icon: "bi-grid-1x2",          path: "/admin/overview",  active: false },
    { label: "Users",     icon: "bi-people",            path: "/admin/users",     active: true  },
    { label: "Zones",     icon: "bi-geo-alt",           path: "/admin/zones",     active: false },
    { label: "Reports",   icon: "bi-file-earmark-text", path: "/admin/reports",   active: false },
  ];

  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [searchTerm,  setSearchTerm]  = useState("");
  const [roleFilter,  setRoleFilter]  = useState("");
  const [updatingId,  setUpdatingId]  = useState(null);
  const [successMsg,  setSuccessMsg]  = useState("");
  const [pagination,  setPagination]  = useState({ total: 0, current_page: 1, last_page: 1 });

  // ── Fetch users whenever search/filter/page changes ──────────────
  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      if (roleFilter) params.set("role",   roleFilter);
      params.set("page", page);

      const data = await apiRequest(`/admin/users?${params.toString()}`);
      setUsers(data.data);
      setPagination(data.meta);
    } catch (err) {
      setError(err.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, roleFilter]);

  // Debounce search — wait 400ms after user stops typing before fetching
  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(1), 400);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  // ── Suspend / Activate ────────────────────────────────────────────
  const toggleStatus = async (user) => {
    const newStatus = user.status === "active" ? "suspended" : "active";
    setUpdatingId(user.user_id);
    try {
      await apiRequest(`/admin/users/${user.user_id}`, "PATCH", { status: newStatus });
      setUsers((prev) =>
        prev.map((u) => u.user_id === user.user_id ? { ...u, status: newStatus } : u)
      );
      flash(`${user.name} ${newStatus === "active" ? "activated" : "suspended"}.`);
    } catch (err) {
      setError(err.message || "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Verify farmer ─────────────────────────────────────────────────
  const verifyFarmer = async (user) => {
    setUpdatingId(user.user_id);
    try {
      await apiRequest(`/admin/users/${user.user_id}/verify`, "PATCH");
      setUsers((prev) =>
        prev.map((u) => u.user_id === user.user_id ? { ...u, is_verified: true } : u)
      );
      flash(`${user.name} has been verified as a farmer. ✅`);
    } catch (err) {
      setError(err.message || "Failed to verify farmer.");
    } finally {
      setUpdatingId(null);
    }
  };

  const roleBadge = { buyer: "badge-confirmed", seller: "badge-delivered" };
  const roleLabel = { buyer: "Buyer",           seller: "Farmer"          };

  return (
    <DashboardLayout title="Users" navItems={navItems}>

      {successMsg && (
        <div className="alert alert-success d-flex align-items-center gap-2 py-2 small mb-3">
          <i className="bi bi-check-circle-fill"></i> {successMsg}
        </div>
      )}

      {/* Search + filter row */}
      <div className="row g-2 mb-4">
        <div className="col-12 col-md-5">
          <div className="input-group">
            <span className="input-group-text"><i className="bi bi-search"></i></span>
            <input className="form-control" placeholder="Search users…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div className="col-6 col-md-3">
          <select className="form-select" value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All roles</option>
            <option value="buyer">Buyers</option>
            <option value="seller">Farmers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
        <div className="col-6 col-md-2">
          <button className="btn btn-outline-secondary w-100"
            onClick={() => { setSearchTerm(""); setRoleFilter(""); }}>
            Clear
          </button>
        </div>
        <div className="col-12 col-md-2 text-muted small d-flex align-items-center justify-content-end">
          {pagination.total} user{pagination.total !== 1 ? "s" : ""}
        </div>
      </div>

      {loading && (
        <div className="text-center py-5">
          <span className="spinner-border text-success"></span>
          <div className="text-muted small mt-2">Loading users…</div>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && users.length === 0 && (
        <div className="text-center text-muted py-5">No users match your search.</div>
      )}

      {!loading && !error && users.length > 0 && (
        <>
          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover mb-0" style={{ fontSize: "0.875rem" }}>
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Region</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Verified</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.user_id}>
                      {/* Avatar + name */}
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                            style={{ width: 32, height: 32,
                              background: user.avatar_url ? "transparent" : "#198754",
                              fontSize: "0.8rem" }}>
                            {user.avatar_url
                              ? <img src={user.avatar_url} alt={user.name}
                                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                              : user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-semibold">{user.name}</div>
                            <div className="text-muted" style={{ fontSize: "0.72rem" }}>{user.email}</div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={`badge rounded-pill ${roleBadge[user.role] || "badge-pending"}`}
                          style={{ fontSize: "0.72rem" }}>
                          {roleLabel[user.role] || user.role}
                        </span>
                      </td>

                      <td className="text-muted">{user.region || "—"}</td>
                      <td className="text-muted">{user.joined}</td>

                      <td>
                        <span className={`badge rounded-pill ${user.status === "active" ? "badge-delivered" : "badge-cancelled"}`}
                          style={{ fontSize: "0.72rem" }}>
                          {user.status === "active" ? "Active" : "Suspended"}
                        </span>
                      </td>

                      {/* Verified — only meaningful for farmers */}
                      <td>
                        {user.role === "seller" ? (
                          user.is_verified
                            ? <span className="d-flex align-items-center gap-1 text-success"
                                style={{ fontSize: "0.78rem", fontWeight: 600 }}>
                                <i className="bi bi-patch-check-fill"></i> Verified
                              </span>
                            : <span className="badge rounded-pill badge-pending-verify"
                                style={{ fontSize: "0.72rem" }}>Pending</span>
                        ) : (
                          <span className="text-muted" style={{ fontSize: "0.75rem" }}>—</span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          {/* Verify button — unverified farmers only */}
                          {user.role === "seller" && !user.is_verified && (
                            <button
                              className="btn btn-sm btn-success"
                              style={{ fontSize: "0.72rem" }}
                              onClick={() => verifyFarmer(user)}
                              disabled={updatingId === user.user_id}>
                              {updatingId === user.user_id ? "…" : "Verify"}
                            </button>
                          )}

                          {/* Suspend / Activate */}
                          <button
                            className={`btn btn-sm ${user.status === "active" ? "btn-outline-danger" : "btn-outline-success"}`}
                            style={{ fontSize: "0.72rem" }}
                            onClick={() => toggleStatus(user)}
                            disabled={updatingId === user.user_id}>
                            {updatingId === user.user_id
                              ? "…"
                              : user.status === "active" ? "Suspend" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="d-flex justify-content-center gap-2 mt-4">
              <button className="btn btn-sm btn-outline-secondary"
                disabled={pagination.current_page === 1}
                onClick={() => fetchUsers(pagination.current_page - 1)}>
                ← Prev
              </button>
              <span className="btn btn-sm btn-success disabled">
                {pagination.current_page} / {pagination.last_page}
              </span>
              <button className="btn btn-sm btn-outline-secondary"
                disabled={pagination.current_page === pagination.last_page}
                onClick={() => fetchUsers(pagination.current_page + 1)}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
