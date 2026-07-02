// AdminOverview — SokoMoja
// Platform-wide stats for admin.
// GET /api/admin/overview

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { apiRequest } from "../../utils/api";

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

function AdminOverview() {
  const navItems = [
    { label: "Overview",  icon: "bi-grid-1x2",          path: "/admin/overview",  active: true  },
    { label: "Users",     icon: "bi-people",            path: "/admin/users",     active: false },
    { label: "Zones",     icon: "bi-geo-alt",           path: "/admin/zones",     active: false },
    { label: "Reports",   icon: "bi-file-earmark-text", path: "/admin/reports",   active: false },
    { label: "Profile",   icon: "bi-person-circle",     path: "/admin/profile",   active: false },
  ];

  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    async function fetchOverview() {
      try {
        setLoading(true);
        setError("");
        const res = await apiRequest("/admin/overview");
        setData(res.data);
      } catch (err) {
        setError(err.message || "Failed to load overview data.");
      } finally {
        setLoading(false);
      }
    }
    fetchOverview();
  }, []);

  return (
    <DashboardLayout title="Overview" navItems={navItems}>

      {loading && <PageLoader text="Loading overview..." />}
      {error && !loading && (
        <EmptyState
          icon="bi-exclamation-triangle"
          title="Could not load overview"
          text="There was a problem loading the dashboard. Please try refreshing the page."
          btnLabel="Refresh"
          btnAction={() => window.location.reload()}
        />
      )}

      {!loading && !error && data && (
        <>
          {/* Top-level stats */}
          <div className="row g-3 mb-4 sm-fade-in">
            <div className="col-6 col-md-4">
              <div className="sm-stat-card d-flex align-items-center gap-3">
                <div className="sm-stat-icon">
                  <i className="bi bi-people"></i>
                </div>
                <div>
                  <div className="sm-stat-value">{data.total_users}</div>
                  <div className="sm-stat-label">Total users</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-4">
              <div className="sm-stat-card d-flex align-items-center gap-3">
                <div className="sm-stat-icon">
                  <i className="bi bi-box-seam"></i>
                </div>
                <div>
                  <div className="sm-stat-value">{Number(data.total_orders).toLocaleString()}</div>
                  <div className="sm-stat-label">Total orders</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-4">
              <div className="sm-stat-card d-flex align-items-center gap-3">
                <div className="sm-stat-icon">
                  <i className="bi bi-cash-coin"></i>
                </div>
                <div>
                  <div className="sm-stat-value">KES {(data.total_revenue / 1000000).toFixed(1)}M</div>
                  <div className="sm-stat-label">Total revenue</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>Quick actions</div>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/admin/users" state={{ openCreate: true }}
                  className="btn btn-success btn-sm d-flex align-items-center gap-2">
                  <i className="bi bi-person-plus"></i> Create admin
                </Link>
                <Link to="/admin/zones" state={{ openForm: true }}
                  className="btn btn-outline-success btn-sm d-flex align-items-center gap-2">
                  <i className="bi bi-geo-alt"></i> Add pickup zone
                </Link>
                <Link to="/admin/reports"
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2">
                  <i className="bi bi-file-earmark-text"></i> View reports
                </Link>
                <Link to="/admin/users" state={{ roleFilter: "seller" }}
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2">
                  <i className="bi bi-people"></i> View pending farmers
                </Link>
              </div>
            </div>
          </div>

          {/* Secondary stats row */}
          <div className="row g-3 mb-4 sm-fade-in">
            <div className="col-6 col-md-4">
              <div className="sm-stat-card d-flex align-items-center gap-3">
                <div className="sm-stat-icon">
                  <i className="bi bi-person-badge"></i>
                </div>
                <div>
                  <div className="sm-stat-value">{data.total_farmers}</div>
                  <div className="sm-stat-label">Farmers</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-4">
              <div className="sm-stat-card d-flex align-items-center gap-3">
                <div className="sm-stat-icon">
                  <i className="bi bi-patch-check-fill"></i>
                </div>
                <div>
                  <div className="sm-stat-value">{data.verified_farmers}</div>
                  <div className="sm-stat-label">Verified farmers</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-4">
              <div className="sm-stat-card d-flex align-items-center gap-3">
                <div className="sm-stat-icon">
                  <i className="bi bi-person-plus"></i>
                </div>
                <div>
                  <div className="sm-stat-value">{data.new_users_this_month}</div>
                  <div className="sm-stat-label">New users this month</div>
                </div>
              </div>
            </div>
          </div>

          {/* Two-column tables */}
          <div className="row g-3">

            {/* Orders by status */}
            <div className="col-12 col-md-6">
              <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>Orders by status</div>
              <div className="dash-table-wrap">
                <div className="table-responsive">
                <table className="dash-table">
                  <thead>
                    <tr><th>Status</th><th>Count</th></tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.orders_by_status).map(([status, count]) => (
                      <tr key={status}>
                        <td>
                          <span className={`dash-badge dash-badge-${status.toLowerCase()}`}>
                            {status}
                          </span>
                        </td>
                        <td>{Number(count).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>

            {/* Top categories */}
            <div className="col-12 col-md-6">
              <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>Top categories</div>
              <div className="dash-table-wrap">
                <div className="table-responsive">
                <table className="dash-table">
                  <thead>
                    <tr><th>Category</th><th>Orders</th></tr>
                  </thead>
                  <tbody>
                    {(data.top_categories ?? []).map((row) => (
                      <tr key={row.category}>
                        <td>{row.category}</td>
                        <td>{Number(row.order_volume).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>

          </div>
        </>
      )}

    </DashboardLayout>
  );
}

export default AdminOverview;
