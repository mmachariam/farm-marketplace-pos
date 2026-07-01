// AdminFarmerDetail — SokoMoja
// Wired to real backend:
// GET    /api/admin/farmers/{id}
// PATCH  /api/admin/users/{id}          (suspend/activate)
// PATCH  /api/admin/users/{id}/verify   (verify)
// PATCH  /api/admin/farmers/{id}/unverify

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { apiRequest } from "../../utils/api";

export default function AdminFarmerDetail() {
  const { farmerId } = useParams();

  const navItems = [
    { label: "Overview",  icon: "bi-grid-1x2",          path: "/admin/overview",  active: false },
    { label: "Users",     icon: "bi-people",            path: "/admin/users",     active: true  },
    { label: "Zones",     icon: "bi-geo-alt",           path: "/admin/zones",     active: false },
    { label: "Reports",   icon: "bi-file-earmark-text", path: "/admin/reports",   active: false },
    { label: "Profile",   icon: "bi-person-circle",     path: "/admin/profile",   active: false },
  ];

  const [farmer,     setFarmer]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [updating,   setUpdating]   = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    async function fetchFarmer() {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest(`/admin/farmers/${farmerId}`);
        setFarmer(data.data);
      } catch (err) {
        setError(err.message || "Failed to load farmer.");
      } finally {
        setLoading(false);
      }
    }
    fetchFarmer();
  }, [farmerId]);

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const toggleStatus = async () => {
    const newStatus = farmer.status === "active" ? "suspended" : "active";
    setUpdating(true);
    try {
      await apiRequest(`/admin/users/${farmer.user_id}`, "PATCH", { status: newStatus });
      setFarmer((prev) => ({ ...prev, status: newStatus }));
      flash(`${farmer.name} ${newStatus === "active" ? "activated" : "suspended"}.`);
    } catch (err) {
      setError(err.message || "Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  const toggleVerification = async () => {
    setUpdating(true);
    try {
      if (farmer.is_verified) {
        await apiRequest(`/admin/farmers/${farmer.user_id}/unverify`, "PATCH");
        setFarmer((prev) => ({ ...prev, is_verified: false }));
        flash(`${farmer.name}'s verification has been revoked.`);
      } else {
        await apiRequest(`/admin/users/${farmer.user_id}/verify`, "PATCH");
        setFarmer((prev) => ({ ...prev, is_verified: true }));
        flash(`${farmer.name} has been verified as a farmer.`);
      }
    } catch (err) {
      setError(err.message || "Failed to update verification.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Farmer profile" navItems={navItems}>
        <div className="text-center py-5">
          <span className="spinner-border text-success"></span>
          <div className="text-muted small mt-2">Loading farmer…</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !farmer) {
    return (
      <DashboardLayout title="Farmer profile" navItems={navItems}>
        <div className="alert alert-danger">{error}</div>
        <Link to="/admin/users" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left me-1"></i> Back to users
        </Link>
      </DashboardLayout>
    );
  }

  if (!farmer) {
    return (
      <DashboardLayout title="Farmer profile" navItems={navItems}>
        <div className="text-center text-muted py-5">Farmer not found.</div>
      </DashboardLayout>
    );
  }

  const initial = farmer.name ? farmer.name.charAt(0).toUpperCase() : "?";

  return (
    <DashboardLayout title="Farmer profile" navItems={navItems}>

      <div className="mb-3">
        <Link to="/admin/users" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left me-1"></i> Back to users
        </Link>
      </div>

      {successMsg && (
        <div className="alert alert-success d-flex align-items-center gap-2 py-2 small mb-3">
          <i className="bi bi-check-circle-fill"></i> {successMsg}
        </div>
      )}
      {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

      {/* Profile header */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                style={{ width: 64, height: 64,
                  background: farmer.avatar_url ? "transparent" : "#198754",
                  fontSize: "1.5rem", border: "3px solid #d1e7dd" }}>
                {farmer.avatar_url
                  ? <img src={farmer.avatar_url} alt={farmer.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : initial}
              </div>
              <div>
                <h5 className="fw-bold mb-1">{farmer.name}</h5>
                <div className="text-muted small">{farmer.email}</div>
                <div className="text-muted small">{farmer.phone_number || "—"}</div>
              </div>
            </div>

            <div className="d-flex flex-column align-items-end gap-2">
              <div className="d-flex gap-2">
                <span className={`badge rounded-pill ${farmer.status === "active" ? "badge-delivered" : "badge-cancelled"}`}>
                  {farmer.status === "active" ? "Active" : "Suspended"}
                </span>
                {farmer.is_verified
                  ? <span className="badge rounded-pill badge-confirmed"><i className="bi bi-patch-check-fill me-1"></i>Verified</span>
                  : <span className="badge rounded-pill badge-pending-verify">Pending verification</span>}
              </div>
              <div className="d-flex gap-2 flex-wrap justify-content-end">
                <button
                  className={`btn btn-sm ${farmer.is_verified ? "btn-outline-warning" : "btn-success"}`}
                  onClick={toggleVerification}
                  disabled={updating}>
                  {updating ? "…" : farmer.is_verified ? "Unverify" : "Verify"}
                </button>
                <button
                  className={`btn btn-sm ${farmer.status === "active" ? "btn-outline-danger" : "btn-outline-success"}`}
                  onClick={toggleStatus}
                  disabled={updating}>
                  {updating ? "…" : farmer.status === "active" ? "Suspend" : "Activate"}
                </button>
              </div>
            </div>
          </div>

          <div className="row mt-4 pt-3 border-top g-3">
            <div className="col-6 col-md-3">
              <div className="text-muted small">Region</div>
              <div className="fw-semibold">{farmer.region || "—"}</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-muted small">Pickup zone</div>
              <div className="fw-semibold">{farmer.zone?.zone_name || "—"}</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-muted small">Zone region</div>
              <div className="fw-semibold">{farmer.zone?.region || "—"}</div>
            </div>
            <div className="col-6 col-md-3">
              <div className="text-muted small">Joined</div>
              <div className="fw-semibold">{farmer.created_at ? new Date(farmer.created_at).toLocaleDateString() : "—"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm text-center py-3">
            <div className="fw-bold fs-4">{farmer.stats.total_products}</div>
            <div className="text-muted small">Total products</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm text-center py-3">
            <div className="fw-bold fs-4">{farmer.stats.active_products}</div>
            <div className="text-muted small">Active products</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm text-center py-3">
            <div className="fw-bold fs-4">{farmer.stats.orders_fulfilled}</div>
            <div className="text-muted small">Orders fulfilled</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm text-center py-3">
            <div className="fw-bold fs-4">
              {farmer.stats.average_rating ? `${farmer.stats.average_rating} ★` : "—"}
            </div>
            <div className="text-muted small">{farmer.stats.total_reviews} review{farmer.stats.total_reviews !== 1 ? "s" : ""}</div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Products */}
        <div className="col-12 col-lg-6">
          <h6 className="fw-bold mb-3">Latest products</h6>
          {farmer.products.length === 0 ? (
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center text-muted py-4 small">No products listed yet.</div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm">
              <ul className="list-group list-group-flush">
                {farmer.products.map((p) => (
                  <li key={p.product_id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold">{p.name}</div>
                      <div className="text-muted small">KES {Number(p.price).toLocaleString()} / {p.unit}</div>
                    </div>
                    <span className={`badge rounded-pill ${p.status === "active" ? "badge-delivered" : "badge-cancelled"}`}
                      style={{ fontSize: "0.72rem" }}>
                      {p.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Reviews */}
        <div className="col-12 col-lg-6">
          <h6 className="fw-bold mb-3">Latest reviews</h6>
          {farmer.reviews.length === 0 ? (
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center text-muted py-4 small">No reviews yet.</div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm">
              <ul className="list-group list-group-flush">
                {farmer.reviews.map((r) => (
                  <li key={r.review_id} className="list-group-item">
                    <div className="d-flex justify-content-between">
                      <div className="fw-semibold small">{r.buyer_name} on {r.product_name}</div>
                      <span className="text-warning small">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                    </div>
                    {r.comment && <div className="text-muted small mt-1">{r.comment}</div>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

    </DashboardLayout>
  );
}
