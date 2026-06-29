// MyOrders — SokoMoja
// Grocery/isGrocery logic removed. Links to OrderTracking page.

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";

function MyOrders() {
  const navItems = [
    { label: "Browse",    icon: "bi-shop",          path: "/buyer/dashboard", active: false },
    { label: "My orders", icon: "bi-box-seam",      path: "/buyer/orders",    active: true  },
    { label: "Cart",      icon: "bi-cart3",         path: "/buyer/dashboard", active: false },
    { label: "Profile",   icon: "bi-person-circle", path: "/buyer/profile",   active: false },
  ];

  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        // TODO: const data = await apiRequest("/orders");
        await new Promise((r) => setTimeout(r, 500));
        setOrders([
          { order_id: 1042, date: "2026-06-02", zone: "Kiambu Zone", items_summary: "Broccoli × 5 kg, Tomatoes × 10 kg", total: 1200, status: "Delivered",  payment_status: "Completed" },
          { order_id: 1055, date: "2026-06-07", zone: "Nakuru Zone", items_summary: "Maize × 20 kg",                      total: 900,  status: "Confirmed",  payment_status: "Completed" },
          { order_id: 1061, date: "2026-06-09", zone: "Kiambu Zone", items_summary: "Carrots × 8 kg",                     total: 480,  status: "Pending",    payment_status: "Pending"   },
          { order_id: 1039, date: "2026-05-28", zone: "Nakuru Zone", items_summary: "Sukuma Wiki × 4 kg",                  total: 120,  status: "Cancelled",  payment_status: "Failed"    },
        ]);
      } catch (err) {
        setError(err.message || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const badgeClass = { Pending: "badge-pending", Confirmed: "badge-confirmed", Delivered: "badge-delivered", Cancelled: "badge-cancelled" };
  const filtered = orders.filter((o) => !statusFilter || o.status === statusFilter);
  const paymentColor = { Completed: "#27500A", Failed: "#791F1F", Pending: "#444441" };

  return (
    <DashboardLayout title="My orders" navItems={navItems}>
      <div className="row g-2 mb-4">
        <div className="col-12 col-md-4">
          <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All orders</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading && <div className="text-center text-muted py-5">Loading your orders…</div>}
      {error   && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center text-muted py-5">No orders found.</div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="d-flex flex-column gap-3">
          {filtered.map((order) => (
            <div className="sm-card p-4" key={order.order_id}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold">Order #{order.order_id}</span>
                <span className={`badge rounded-pill ${badgeClass[order.status]}`} style={{ fontSize: "0.72rem" }}>{order.status}</span>
              </div>
              <div className="text-muted small mb-1">{order.date} · {order.zone} · KES {order.total}</div>
              <div className="mb-2" style={{ fontSize: "0.875rem" }}>{order.items_summary}</div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="small" style={{ color: paymentColor[order.payment_status] }}>
                  Payment: {order.payment_status}
                </span>
                <Link
                  to={`/buyer/orders/${order.order_id}`}
                  className="btn btn-sm btn-outline-secondary"
                  style={{ fontSize: "0.78rem" }}
                >
                  <i className="bi bi-eye me-1"></i>Track order
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export default MyOrders;
