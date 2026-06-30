// AdminOverview — SokoMoja
// Platform-wide stats for admin.
// GET /api/admin/overview

import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { apiRequest } from "../../utils/api";

function AdminOverview() {
  const navItems = [
    { label: "Overview",  icon: "bi-grid-1x2",          path: "/admin/overview",  active: true  },
    { label: "Users",     icon: "bi-people",            path: "/admin/users",     active: false },
    { label: "Zones",     icon: "bi-geo-alt",           path: "/admin/zones",     active: false },
    { label: "Reports",   icon: "bi-file-earmark-text", path: "/admin/reports",   active: false },
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

      {loading && <div className="dash-loading">Loading overview…</div>}
      {error   && <div className="dash-error">⚠️ {error}</div>}

      {!loading && !error && data && (
        <>
          {/* Top-level stats */}
          <div className="dash-stats-row">
            <div className="dash-stat-card">
              <div className="dash-stat-label">Total users</div>
              <div className="dash-stat-value">{data.total_users}</div>
            </div>
            <div className="dash-stat-card">
              <div className="dash-stat-label">Total orders</div>
              <div className="dash-stat-value">{Number(data.total_orders).toLocaleString()}</div>
            </div>
            <div className="dash-stat-card">
              <div className="dash-stat-label">Total revenue</div>
              <div className="dash-stat-value">KES {(data.total_revenue / 1000000).toFixed(1)}M</div>
            </div>
          </div>

          {/* Secondary stats row */}
          <div className="dash-stats-row" style={{ marginBottom: 20 }}>
            <div className="dash-stat-card">
              <div className="dash-stat-label">Farmers</div>
              <div className="dash-stat-value">{data.total_farmers}</div>
            </div>
            <div className="dash-stat-card">
              <div className="dash-stat-label">Verified farmers</div>
              <div className="dash-stat-value">{data.verified_farmers}</div>
            </div>
            <div className="dash-stat-card">
              <div className="dash-stat-label">New users this month</div>
              <div className="dash-stat-value">{data.new_users_this_month}</div>
            </div>
          </div>

          {/* Two-column tables */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

            {/* Orders by status */}
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>Orders by status</div>
              <div className="dash-table-wrap">
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

            {/* Top categories */}
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>Top categories</div>
              <div className="dash-table-wrap">
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
        </>
      )}

    </DashboardLayout>
  );
}

export default AdminOverview;
