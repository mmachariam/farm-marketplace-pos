// ===========================================
// ADMIN OVERVIEW PAGE
// First page an admin sees after login.
// Shows platform-wide stats: total users, orders, GMV,
// order status breakdown, and top categories.
//
// Data flow:
// - Fetch from GET /api/admin/overview
// ===========================================

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

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOverview() {
      try {
        setLoading(true);
        setError("");

        // TODO: replace with real API call
        // const result = await apiRequest("/admin/overview");
        // setData(result);

        // TEMPORARY sample data
        await new Promise((res) => setTimeout(res, 500));
        setData({
          totalUsers: 248,
          ordersThisMonth: 1340,
          gmv: 1200000,
          ordersByStatus: [
            { status: "Pending",   count: 42,   className: "dash-badge-pending"   },
            { status: "Confirmed", count: 89,   className: "dash-badge-confirmed" },
            { status: "Delivered", count: 1174, className: "dash-badge-delivered" },
            { status: "Cancelled", count: 35,   className: "dash-badge-cancelled" },
          ],
          topCategories: [
            { category: "Vegetables", sales: 480000 },
            { category: "Cereals",    sales: 320000 },
            { category: "Fruits",     sales: 240000 },
            { category: "Dairy",      sales: 160000 },
          ],
        });

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
      {error && <div className="dash-error">⚠️ {error}</div>}

      {!loading && !error && data && (
        <>
          {/* ---- TOP-LEVEL STATS ---- */}
          <div className="dash-stats-row">
            <div className="dash-stat-card">
              <div className="dash-stat-label">Total users</div>
              <div className="dash-stat-value">{data.totalUsers}</div>
            </div>
            <div className="dash-stat-card">
              <div className="dash-stat-label">Orders this month</div>
              <div className="dash-stat-value">{data.ordersThisMonth.toLocaleString()}</div>
            </div>
            <div className="dash-stat-card">
              <div className="dash-stat-label">GMV (this month)</div>
              <div className="dash-stat-value">KES {(data.gmv / 1000000).toFixed(1)}M</div>
            </div>
          </div>

          {/* ---- TWO-COLUMN TABLES ---- */}
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
                    {data.ordersByStatus.map((row) => (
                      <tr key={row.status}>
                        <td><span className={`dash-badge ${row.className}`}>{row.status}</span></td>
                        <td>{row.count.toLocaleString()}</td>
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
                    <tr><th>Category</th><th>Sales (KES)</th></tr>
                  </thead>
                  <tbody>
                    {data.topCategories.map((row) => (
                      <tr key={row.category}>
                        <td>{row.category}</td>
                        <td>{row.sales.toLocaleString()}</td>
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
