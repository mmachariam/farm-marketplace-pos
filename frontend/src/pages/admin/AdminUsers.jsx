// AdminUsers — SokoMoja
// Lists all platform users. Admins can verify farmers,
// suspend/activate accounts, and filter by role.
// Grocery role completely removed.

import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";

function AdminUsers() {
  const navItems = [
    { label: "Overview",    icon: "bi-grid-1x2",      path: "/admin/overview", active: false },
    { label: "Users",       icon: "bi-people",        path: "/admin/users",    active: true  },
    { label: "Zones",       icon: "bi-geo-alt",       path: "/admin/zones",    active: false },
    { label: "Analytics",   icon: "bi-bar-chart-line",path: "/admin/analytics",active: false },
    { label: "Reports",     icon: "bi-file-earmark-text", path: "/admin/reports", active: false },
  ];

  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        // TODO: const data = await apiRequest("/admin/users");
        await new Promise((r) => setTimeout(r, 500));
        setUsers([
          { user_id: 1, name: "Jane Wambui",   role: "seller", region: "Kiambu",  joined: "2026-01-12", status: "active",    verified: true  },
          { user_id: 2, name: "Samuel Mwangi", role: "seller", region: "Meru",    joined: "2026-02-03", status: "active",    verified: false },
          { user_id: 3, name: "Peter Otieno",  role: "buyer",  region: "Nairobi", joined: "2026-03-18", status: "active",    verified: null  },
          { user_id: 4, name: "Lucy Achieng",  role: "buyer",  region: "Kisumu",  joined: "2026-04-20", status: "active",    verified: null  },
          { user_id: 5, name: "David Omondi",  role: "seller", region: "Nakuru",  joined: "2026-04-02", status: "suspended", verified: true  },
        ]);
      } catch (err) {
        setError(err.message || "Failed to load users.");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    const s = u.name.toLowerCase().includes(searchTerm.toLowerCase());
    const r = !roleFilter || u.role === roleFilter;
    return s && r;
  });

  // Toggle active/suspended
  const toggleStatus = async (user) => {
    const newStatus = user.status === "active" ? "suspended" : "active";
    setUpdatingId(user.user_id);
    try {
      // TODO: await apiRequest(`/admin/users/${user.user_id}`, "PATCH", { status: newStatus });
      await new Promise((r) => setTimeout(r, 500));
      setUsers((prev) => prev.map((u) => u.user_id === user.user_id ? { ...u, status: newStatus } : u));
      setSuccessMsg(`${user.name} ${newStatus === "active" ? "activated" : "suspended"}.`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) { alert(err.message); }
    finally { setUpdatingId(null); }
  };

  // Verify a farmer
  const verifyFarmer = async (user) => {
    setUpdatingId(user.user_id);
    try {
      // TODO: await apiRequest(`/admin/users/${user.user_id}/verify`, "PATCH");
      await new Promise((r) => setTimeout(r, 500));
      setUsers((prev) => prev.map((u) => u.user_id === user.user_id ? { ...u, verified: true } : u));
      setSuccessMsg(`${user.name} has been verified as a farmer. ✅`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) { alert(err.message); }
    finally { setUpdatingId(null); }
  };

  const roleBadge = { buyer: "badge-confirmed", seller: "badge-delivered" };
  const roleLabel = { buyer: "Buyer", seller: "Farmer" };

  return (
    <DashboardLayout title="Users" navItems={navItems}>

      {successMsg && <div className="alert alert-success py-2 small mb-3">{successMsg}</div>}

      {/* Search + filter */}
      <div className="row g-2 mb-4">
        <div className="col-12 col-md-5">
          <div className="input-group">
            <span className="input-group-text"><i className="bi bi-search"></i></span>
            <input className="form-control" placeholder="Search users…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div className="col-6 col-md-3">
          <select className="form-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All roles</option>
            <option value="buyer">Buyers</option>
            <option value="seller">Farmers</option>
          </select>
        </div>
      </div>

      {loading && <div className="text-center text-muted py-5">Loading users…</div>}
      {error   && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        filtered.length === 0
          ? <div className="text-center text-muted py-5">No users match your search.</div>
          : (
            <div className="sm-card">
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
                  {filtered.map((user) => (
                    <tr key={user.user_id}>
                      <td className="fw-semibold">{user.name}</td>
                      <td><span className={`badge rounded-pill ${roleBadge[user.role]}`} style={{ fontSize: "0.72rem" }}>{roleLabel[user.role]}</span></td>
                      <td className="text-muted">{user.region}</td>
                      <td className="text-muted">{user.joined}</td>
                      <td>
                        <span className={`badge rounded-pill ${user.status === "active" ? "badge-delivered" : "badge-cancelled"}`} style={{ fontSize: "0.72rem" }}>
                          {user.status === "active" ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td>
                        {/* Only farmers have a verified status */}
                        {user.role === "seller" && (
                          user.verified
                            ? <span className="sm-verified"><i className="bi bi-patch-check-fill me-1"></i>Verified</span>
                            : <span className="badge rounded-pill badge-pending-verify" style={{ fontSize: "0.72rem" }}>Pending</span>
                        )}
                        {user.role === "buyer" && <span className="text-muted" style={{ fontSize: "0.75rem" }}>—</span>}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          {/* Verify button — only for unverified farmers */}
                          {user.role === "seller" && !user.verified && (
                            <button
                              className="btn btn-sm"
                              style={{ fontSize: "0.72rem", background: "var(--sm-green)", color: "#fff", border: "none" }}
                              onClick={() => verifyFarmer(user)}
                              disabled={updatingId === user.user_id}
                            >
                              {updatingId === user.user_id ? "…" : "Verify"}
                            </button>
                          )}
                          {/* Suspend / Activate */}
                          <button
                            className={`btn btn-sm ${user.status === "active" ? "btn-outline-danger" : "btn-outline-success"}`}
                            style={{ fontSize: "0.72rem" }}
                            onClick={() => toggleStatus(user)}
                            disabled={updatingId === user.user_id}
                          >
                            {updatingId === user.user_id ? "…" : user.status === "active" ? "Suspend" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
      )}
    </DashboardLayout>
  );
}

export default AdminUsers;
