// AdminUsers — SokoMoja
// Wired to real backend:
// GET    /api/admin/users
// PATCH  /api/admin/users/{id}         (suspend/activate)
// PATCH  /api/admin/users/{id}/verify  (verify farmer)

import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import PaginationBar from "../../components/PaginationBar";
import Toast from "../../components/Toast";
import { apiRequest } from "../../utils/api";

// Display-only copy of the backend's DEFAULT_USER_PASSWORD (config/sokomoja.php),
// needed here only for the confirmation prompt text below — the actual reset
// always uses the value returned by the backend response.
const DEFAULT_PASSWORD = "SokoMoja2026!";

function EmptyState({ icon, title, text, btnLabel, btnTo, btnAction }) {
  return (
    <div className="sm-empty sm-fade-in">
      <div className="sm-empty-icon">
        <i className={`bi ${icon}`}></i>
      </div>
      <div className="sm-empty-title">{title}</div>
      <p className="sm-empty-text">{text}</p>
      {btnTo && (
        <Link to={btnTo} className="btn btn-success btn-sm px-4">
          {btnLabel}
        </Link>
      )}
      {btnAction && (
        <button className="btn btn-success btn-sm px-4" onClick={btnAction}>
          {btnLabel}
        </button>
      )}
    </div>
  );
}

function PageLoader({ text = "Loading..." }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3 sm-fade-in">
      <div className="spinner-border text-success" role="status" style={{ width: "2rem", height: "2rem" }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <span className="text-muted small">{text}</span>
    </div>
  );
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Overview",  icon: "bi-grid-1x2",          path: "/admin/overview",  active: false },
    { label: "Users",     icon: "bi-people",            path: "/admin/users",     active: true  },
    { label: "Zones",     icon: "bi-geo-alt",           path: "/admin/zones",     active: false },
    { label: "Reports",   icon: "bi-file-earmark-text", path: "/admin/reports",   active: false },
    { label: "Profile",   icon: "bi-person-circle",     path: "/admin/profile",   active: false },
  ];

  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [searchTerm,  setSearchTerm]  = useState("");
  const [roleFilter,  setRoleFilter]  = useState(location.state?.roleFilter || "");
  const [updatingId,  setUpdatingId]  = useState(null);
  const [toast,       setToast]       = useState(null);
  const [pagination,  setPagination]  = useState({ total: 0, current_page: 1, last_page: 1 });
  // AdminUserController meta does not include per_page; 20 matches paginate(20) in the controller
  const perPage = 20;

  // ── Create admin modal ────────────────────────────────────────────
  const [createForm, setCreateForm] = useState({
    name: "", email: "", phone: "", password: "", password_confirmation: "",
  });
  const [createErrors, setCreateErrors] = useState({});
  const [creating,     setCreating]     = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

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

  // Auto-open the Create admin modal when arriving via a Quick Action
  useEffect(() => {
    if (location.state?.openCreate && window.bootstrap) {
      const modalEl = document.getElementById("createAdminModal");
      if (modalEl) window.bootstrap.Modal.getOrCreateInstance(modalEl).show();
    }
  }, [location.state]);

  const flash = (msg) => setToast({ message: msg, type: "success" });

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("");
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
      setToast({ message: err.message || "Failed to update status.", type: "error" });
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
      flash(`${user.name} has been verified as a farmer.`);
    } catch (err) {
      setToast({ message: err.message || "Failed to verify farmer.", type: "error" });
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Reset password ────────────────────────────────────────────────
  const resetPassword = async (user) => {
    const confirmed = window.confirm(
      `Reset this user's password back to the system default (${DEFAULT_PASSWORD})?`
    );
    if (!confirmed) return;

    setUpdatingId(user.user_id);
    try {
      const data = await apiRequest(`/admin/users/${user.user_id}/reset-password`, "POST");
      flash(
        <>
          Password reset successfully.
          <br />
          Default password: <strong>{data.data.default_password}</strong>
        </>
      );
    } catch (err) {
      setToast({ message: err.message || "Failed to reset password.", type: "error" });
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Create admin ──────────────────────────────────────────────────
  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((p) => ({ ...p, [name]: value }));
    if (createErrors[name]) setCreateErrors((p) => ({ ...p, [name]: "" }));
  };

  const validateCreate = () => {
    const errs = {};
    if (!createForm.name.trim())  errs.name  = "Full name is required";
    if (!createForm.email)        errs.email = "Email address is required";
    else if (!/\S+@\S+\.\S+/.test(createForm.email)) errs.email = "Enter a valid email address";
    if (!createForm.phone.trim()) errs.phone = "Phone number is required";
    if (!createForm.password || createForm.password.length < 8)
      errs.password = "Password must be at least 8 characters";
    if (createForm.password !== createForm.password_confirmation)
      errs.password_confirmation = "Passwords do not match";
    setCreateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!validateCreate()) return;
    setCreating(true);
    try {
      await apiRequest("/admin/users/create", "POST", createForm);
      setCreateForm({ name: "", email: "", phone: "", password: "", password_confirmation: "" });
      setCreateErrors({});
      document.getElementById("createAdminModalClose")?.click();
      flash("Administrator created successfully.");
      fetchUsers(1);
    } catch (err) {
      if (err.errors) {
        const mapped = {};
        if (err.errors.name)     mapped.name     = err.errors.name[0];
        if (err.errors.email)    mapped.email    = err.errors.email[0];
        if (err.errors.phone)    mapped.phone    = err.errors.phone[0];
        if (err.errors.password) mapped.password = err.errors.password[0];
        setCreateErrors(mapped);
      } else {
        setCreateErrors({ general: err.message || "Failed to create administrator." });
      }
    } finally {
      setCreating(false);
    }
  };

  const roleBadge = { buyer: "badge-confirmed", seller: "badge-delivered" };
  const roleLabel = { buyer: "Buyer",           seller: "Farmer"          };

  return (
    <DashboardLayout title="Users" navItems={navItems}>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Create admin button */}
      <div className="mb-3 d-flex justify-content-end">
        <button className="btn btn-success btn-sm d-flex align-items-center gap-2"
          data-bs-toggle="modal" data-bs-target="#createAdminModal">
          <i className="bi bi-person-plus"></i> Create admin
        </button>
      </div>

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
            onClick={clearFilters}>
            Clear
          </button>
        </div>
        <div className="col-12 col-md-2 text-muted small d-flex align-items-center justify-content-end">
          {pagination.total} user{pagination.total !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Create admin modal */}
      <div className="modal fade" id="createAdminModal" tabIndex="-1" aria-hidden="true"
        aria-labelledby="createAdminModalLabel" aria-modal="true" role="dialog">
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <form onSubmit={handleCreateAdmin} noValidate>
              <div className="modal-header">
                <h5 className="modal-title fw-bold" id="createAdminModalLabel">Create administrator</h5>
                <button id="createAdminModalClose" type="button" className="btn-close"
                  data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body sm-fade-in">
                {createErrors.general && (
                  <div className="alert alert-danger py-2 small">{createErrors.general}</div>
                )}
                <div className="mb-3">
                  <label htmlFor="create-admin-name" className="form-label fw-semibold small">
                    Full name <span className="text-danger">*</span>
                  </label>
                  <input id="create-admin-name" name="name" type="text"
                    className={`form-control ${createErrors.name ? "is-invalid" : ""}`}
                    value={createForm.name} onChange={handleCreateChange} />
                  {createErrors.name && (
                    <div className="invalid-feedback d-block">
                      <i className="bi bi-exclamation-circle me-1"></i>{createErrors.name}
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="create-admin-email" className="form-label fw-semibold small">
                    Email address <span className="text-danger">*</span>
                  </label>
                  <input id="create-admin-email" name="email" type="email"
                    className={`form-control ${createErrors.email ? "is-invalid" : ""}`}
                    value={createForm.email} onChange={handleCreateChange} />
                  {createErrors.email && (
                    <div className="invalid-feedback d-block">
                      <i className="bi bi-exclamation-circle me-1"></i>{createErrors.email}
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="create-admin-phone" className="form-label fw-semibold small">
                    Phone number <span className="text-danger">*</span>
                  </label>
                  <input id="create-admin-phone" name="phone" type="tel"
                    className={`form-control ${createErrors.phone ? "is-invalid" : ""}`}
                    placeholder="0712 345 678"
                    value={createForm.phone} onChange={handleCreateChange} />
                  {createErrors.phone && (
                    <div className="invalid-feedback d-block">
                      <i className="bi bi-exclamation-circle me-1"></i>{createErrors.phone}
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="create-admin-password" className="form-label fw-semibold small">
                    Password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <input id="create-admin-password" name="password" type={showPassword ? "text" : "password"}
                      className={`form-control ${createErrors.password ? "is-invalid" : ""}`}
                      value={createForm.password} onChange={handleCreateChange} />
                    <button type="button" className="btn btn-outline-secondary" aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword(!showPassword)}>
                      <i className={`bi bi-${showPassword ? "eye-slash" : "eye"}`}></i>
                    </button>
                    {createErrors.password && (
                      <div className="invalid-feedback d-block">
                        <i className="bi bi-exclamation-circle me-1"></i>{createErrors.password}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor="create-admin-password-confirm" className="form-label fw-semibold small">
                    Confirm password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <input id="create-admin-password-confirm" name="password_confirmation" type={showPasswordConfirm ? "text" : "password"}
                      className={`form-control ${createErrors.password_confirmation ? "is-invalid" : ""}`}
                      value={createForm.password_confirmation} onChange={handleCreateChange} />
                    <button type="button" className="btn btn-outline-secondary" aria-label={showPasswordConfirm ? "Hide password" : "Show password"}
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}>
                      <i className={`bi bi-${showPasswordConfirm ? "eye-slash" : "eye"}`}></i>
                    </button>
                    {createErrors.password_confirmation && (
                      <div className="invalid-feedback d-block">
                        <i className="bi bi-exclamation-circle me-1"></i>{createErrors.password_confirmation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="btn btn-success" disabled={creating}>
                  {creating
                    ? <><span className="spinner-border spinner-border-sm me-2"></span>Creating...</>
                    : <><i className="bi bi-check-circle me-2"></i>Create admin</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {loading && <PageLoader text="Loading users..." />}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && users.length === 0 && (
        <EmptyState
          icon="bi-people"
          title="No users found"
          text="No users match your current search or filter criteria."
          btnLabel="Clear filters"
          btnAction={clearFilters}
        />
      )}

      {!loading && !error && users.length > 0 && (
        <>
          <div className="card border-0 shadow-sm sm-fade-in">
            <div className="table-responsive">
              <table className="table table-hover align-middle table-striped-columns mb-0" style={{ fontSize: "0.875rem" }}>
                <caption className="visually-hidden">Registered users</caption>
                <thead className="table-light">
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Role</th>
                    <th scope="col">Region</th>
                    <th scope="col">Joined</th>
                    <th scope="col">Status</th>
                    <th scope="col">Verified</th>
                    <th scope="col">Actions</th>
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
                              background: user.avatar_url ? "transparent" : "var(--sm-green)",
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
                          {/* View farmer profile */}
                          {user.role === "seller" && (
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              style={{ fontSize: "0.72rem" }}
                              onClick={() => navigate(`/admin/farmers/${user.user_id}`)}>
                              View
                            </button>
                          )}

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

                          {/* Reset password */}
                          <button
                            className="btn btn-sm btn-warning"
                            style={{ fontSize: "0.72rem" }}
                            onClick={() => resetPassword(user)}
                            disabled={updatingId === user.user_id}>
                            {updatingId === user.user_id ? "…" : "Reset Password"}
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
          {!error && pagination.total > 0 && (
            <PaginationBar
              page={pagination.current_page}
              lastPage={pagination.last_page}
              total={pagination.total}
              perPage={perPage}
              loading={loading}
              onChange={(p) => fetchUsers(p)}
            />
          )}
        </>
      )}
    </DashboardLayout>
  );
}
