// MyOrders — SokoMoja
// Buyer's order list with real API, status filter, and pagination.

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { apiRequest } from "../../utils/api";

function MyOrders() {
  const navItems = [
    { label: "Browse",    icon: "bi-shop",          path: "/buyer/dashboard", active: false },
    { label: "My orders", icon: "bi-box-seam",      path: "/buyer/orders",    active: true  },
    { label: "Cart",      icon: "bi-cart3",         path: "/buyer/dashboard", active: false },
    { label: "Profile",   icon: "bi-person-circle", path: "/buyer/profile",   active: false },
  ];

  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage]       = useState(1);

  useEffect(() => {
    fetchOrders(currentPage, statusFilter);
  }, [currentPage, statusFilter]);

  async function fetchOrders(page, status) {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({ page });
      if (status) params.append("status", status);

      const res = await apiRequest(`/orders?${params.toString()}`);

      // Paginated response from Laravel through()
      const paginated = res.data;
      setOrders(paginated.data ?? []);
      setLastPage(paginated.last_page ?? 1);
    } catch (err) {
      setError(err.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  // Format items summary from the items array
  const summariseItems = (items = []) =>
    items
      .map((i) => `${i.product_name} × ${i.quantity} kg`)
      .join(", ") || "—";

  const badgeClass = {
    Pending:   "badge-pending",
    Confirmed: "badge-confirmed",
    Delivered: "badge-delivered",
    Cancelled: "badge-cancelled",
  };

  const paymentColor = {
    Completed: "#27500A",
    Failed:    "#791F1F",
    Pending:   "#444441",
  };

  return (
    <DashboardLayout title="My orders" navItems={navItems}>
      <div className="row g-2 mb-4">
        <div className="col-12 col-md-4">
          <select className="form-select" value={statusFilter} onChange={handleStatusChange}>
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

      {!loading && !error && orders.length === 0 && (
        <div className="text-center text-muted py-5">No orders found.</div>
      )}

      {!loading && !error && orders.length > 0 && (
        <>
          <div className="d-flex flex-column gap-3">
            {orders.map((order) => {
              const payStatus = order.payment?.payment_status ?? "Pending";
              const zone      = order.delivery?.zone?.zone_name ?? order.delivery?.delivery_address ?? "—";
              const date      = order.order_date
                ? new Date(order.order_date).toLocaleDateString("en-KE", { dateStyle: "medium" })
                : "—";

              return (
                <div className="sm-card p-4" key={order.order_id}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold">Order #{order.order_id}</span>
                    <span
                      className={`badge rounded-pill ${badgeClass[order.order_status] ?? "badge-pending"}`}
                      style={{ fontSize: "0.72rem" }}
                    >
                      {order.order_status}
                    </span>
                  </div>
                  <div className="text-muted small mb-1">
                    {date} · {zone} · KES {Number(order.total_amount).toFixed(2)}
                  </div>
                  <div className="mb-2" style={{ fontSize: "0.875rem" }}>
                    {summariseItems(order.items)}
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="small" style={{ color: paymentColor[payStatus] ?? "#444441" }}>
                      Payment: {payStatus}
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
              );
            })}
          </div>

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="d-flex justify-content-center gap-2 mt-4">
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <span className="btn btn-sm btn-light disabled" style={{ minWidth: 80 }}>
                {currentPage} / {lastPage}
              </span>
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={currentPage === lastPage}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}

export default MyOrders;
