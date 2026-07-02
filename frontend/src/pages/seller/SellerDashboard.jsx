// SellerDashboard — SokoMoja
// Overview page for farmers. Shows key stats, weekly sales chart,
// and a quick link to pending orders.

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { apiRequest } from "../../utils/api";

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

function SellerDashboard() {
  const navItems = [
    { label: "Dashboard",  icon: "bi-speedometer2",   path: "/seller/dashboard",  active: true  },
    { label: "Products",   icon: "bi-flower2",        path: "/seller/products",   active: false },
    { label: "Inventory",  icon: "bi-boxes",          path: "/seller/inventory",  active: false },
    { label: "Sales",      icon: "bi-receipt",        path: "/seller/sales",      active: false },
    { label: "Schedule",   icon: "bi-calendar-check", path: "/seller/schedule",   active: false },
    { label: "Orders",     icon: "bi-box-seam",       path: "/seller/orders",     active: false },
    { label: "Profile",    icon: "bi-person-circle",  path: "/seller/profile",    active: false },
  ];

  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true);
        setError("");
        const res = await apiRequest("/seller/summary");
        const d   = res.data;
        setStats({
          totalSales:     d.total_sales,
          activeListings: d.active_listings,
          pendingOrders:  d.pending_orders,
          averageRating:  d.average_rating ?? 0,
          weeklySales:    d.weekly_sales,
        });
      } catch (err) {
        setError(err.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  const maxSale = stats ? Math.max(...stats.weeklySales.map((d) => d.amount), 1) : 1;

  return (
    <DashboardLayout title="Dashboard" navItems={navItems}>
      {loading && <PageLoader text="Loading your dashboard..." />}
      {error   && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && stats && (
        <>
          {/* Stat cards */}
          <div className="row g-3 mb-4 sm-fade-in">
            {[
              { label: "Sales this month", value: `KES ${stats.totalSales.toLocaleString()}`, icon: "bi-cash-coin"       },
              { label: "Active listings",  value: stats.activeListings,                        icon: "bi-flower2"          },
              { label: "Pending orders",   value: stats.pendingOrders,                         icon: "bi-box-seam"         },
              { label: "Average rating",   value: `${stats.averageRating} ★`,                 icon: "bi-star-fill"        },
            ].map((card) => (
              <div className="col-6 col-lg-3" key={card.label}>
                <div className="sm-stat-card d-flex align-items-center gap-3">
                  <div className="sm-stat-icon">
                    <i className={`bi ${card.icon}`}></i>
                  </div>
                  <div>
                    <div className="sm-stat-value">{card.value}</div>
                    <div className="sm-stat-label">{card.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Weekly sales chart */}
          <div className="sm-card p-4 mb-4">
            <h6 className="fw-bold mb-4">Sales this week</h6>
            <div className="d-flex align-items-flex-end gap-2" style={{ height: 130 }}>
              {stats.weeklySales.map((day) => (
                <div key={day.day} className="d-flex flex-column align-items-center gap-1 flex-grow-1">
                  <div
                    className="w-100 rounded-top"
                    style={{
                      height: `${(day.amount / maxSale) * 100}px`,
                      background: "var(--sm-green)",
                      opacity: 0.8,
                      maxWidth: 36,
                      margin: "0 auto",
                    }}
                    title={`KES ${day.amount}`}
                  />
                  <span className="text-muted" style={{ fontSize: "0.72rem" }}>{day.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <Link to="/seller/products/add" className="sm-card p-3 d-flex align-items-center gap-3 text-decoration-none">
                <i className="bi bi-plus-circle-fill fs-4" style={{ color: "var(--sm-green)" }}></i>
                <div>
                  <div className="fw-semibold" style={{ fontSize: "0.875rem" }}>Add new product</div>
                  <div className="text-muted" style={{ fontSize: "0.75rem" }}>List a new produce item</div>
                </div>
              </Link>
            </div>
            <div className="col-12 col-md-4">
              <Link to="/seller/inventory" className="sm-card p-3 d-flex align-items-center gap-3 text-decoration-none">
                <i className="bi bi-boxes fs-4" style={{ color: "var(--sm-green)" }}></i>
                <div>
                  <div className="fw-semibold" style={{ fontSize: "0.875rem" }}>Update inventory</div>
                  <div className="text-muted" style={{ fontSize: "0.75rem" }}>Adjust stock quantities</div>
                </div>
              </Link>
            </div>
            <div className="col-12 col-md-4">
              <Link to="/seller/orders" className="sm-card p-3 d-flex align-items-center gap-3 text-decoration-none">
                <i className="bi bi-box-seam fs-4" style={{ color: "var(--sm-green)" }}></i>
                <div>
                  <div className="fw-semibold" style={{ fontSize: "0.875rem" }}>View orders</div>
                  <div className="text-muted" style={{ fontSize: "0.75rem" }}>{stats.pendingOrders} pending orders</div>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default SellerDashboard;
