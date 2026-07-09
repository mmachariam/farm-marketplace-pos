// SellerOrders — SokoMoja
// Shows incoming orders for this seller's products.
// Confirm or cancel pending orders via the real API.
// GET  /api/seller/orders?page=N
// PATCH /api/seller/orders/{id}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import PaginationBar from "../../components/PaginationBar";
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

function SellerOrders() {
  const navItems = [
    { label: "Dashboard",  icon: "bi-speedometer2",   path: "/seller/dashboard",  active: false },
    { label: "Products",   icon: "bi-flower2",        path: "/seller/products",   active: false },
    { label: "Inventory",  icon: "bi-boxes",          path: "/seller/inventory",  active: false },
    { label: "Sales",      icon: "bi-receipt",        path: "/seller/sales",      active: false },
    { label: "Schedule",   icon: "bi-calendar-check", path: "/seller/schedule",   active: false },
    { label: "Orders",     icon: "bi-box-seam",       path: "/seller/orders",     active: true  },
    { label: "Reports",    icon: "bi-file-earmark-text", path: "/seller/reports", active: false },
    { label: "Profile",    icon: "bi-person-circle",  path: "/seller/profile",    active: false },
  ];

  const [orders,      setOrders]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [updatingId,  setUpdatingId]  = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage,    setLastPage]    = useState(1);
  const [total,       setTotal]       = useState(0);
  const [perPage,     setPerPage]     = useState(10);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  async function fetchOrders(page) {
    try {
      setLoading(true);
      setError("");

      const res = await apiRequest(`/seller/orders?page=${page}`);
      // res.data = Laravel paginator; res.data.data = items array
      const paginated = res.data;
      setOrders(paginated.data    ?? []);
      setLastPage(paginated.last_page ?? 1);
      setTotal(paginated.total    ?? 0);
      setPerPage(paginated.per_page ?? 10);
    } catch (err) {
      setError(err.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await apiRequest(`/seller/orders/${orderId}`, "PATCH", { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.order_id === orderId ? res.data : o))
      );
    } catch (err) {
      alert(`Failed to update order: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case "Pending":   return "dash-badge-pending";
      case "Confirmed": return "dash-badge-confirmed";
      case "Delivered": return "dash-badge-delivered";
      case "Cancelled": return "dash-badge-cancelled";
      default:          return "dash-badge-pending";
    }
  };

  const summariseItems = (items = []) =>
    items.map((i) => `${i.product_name} × ${i.quantity} kg`).join(", ") || "—";

  return (
    <DashboardLayout title="Incoming orders" navItems={navItems}>

      {/* Loading */}
      {loading && <PageLoader text="Loading incoming orders..." />}

      {/* Error */}
      {error && (
        <div className="dash-error">
          <i className="bi bi-exclamation-triangle-fill me-1"></i>{error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && orders.length === 0 && (
        <EmptyState
          icon="bi-box-seam"
          title="No orders yet"
          text="Once buyers order your produce, their orders will appear here for you to confirm."
        />
      )}

      {/* Order cards */}
      {!loading && !error && orders.length > 0 && (
        <div className="d-flex flex-column gap-3 sm-fade-in">
          {orders.map((order) => {
            const date = order.order_date
              ? new Date(order.order_date).toLocaleDateString("en-KE", { dateStyle: "medium" })
              : "—";
            const zone = order.zone?.zone_name ?? "—";

            return (
              <div className="dash-table-wrap" key={order.order_id} style={{ padding: "16px 20px" }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-semibold">Order #{order.order_id}</span>
                  <span className={`dash-badge ${getBadgeClass(order.order_status)}`}>{order.order_status}</span>
                </div>

                <div className="text-muted small mb-2">
                  Buyer: {order.buyer?.name ?? "—"} · {date} · {zone}
                </div>
                <div className="small mb-3">
                  {summariseItems(order.items)} — <strong>KES {Number(order.total_amount).toFixed(2)}</strong>
                </div>

                {order.order_status === "Pending" && (
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => updateOrderStatus(order.order_id, "Confirmed")}
                      disabled={updatingId === order.order_id}
                    >
                      {updatingId === order.order_id ? "Updating..." : "Confirm"}
                    </button>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => updateOrderStatus(order.order_id, "Cancelled")}
                      disabled={updatingId === order.order_id}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {order.order_status === "Confirmed" && (
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => updateOrderStatus(order.order_id, "Delivered")}
                      disabled={updatingId === order.order_id}
                    >
                      {updatingId === order.order_id ? "Updating..." : "Mark delivered"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination — stays visible while changing pages */}
      {!error && total > 0 && (
        <PaginationBar
          page={currentPage}
          lastPage={lastPage}
          total={total}
          perPage={perPage}
          loading={loading}
          onChange={(p) => setCurrentPage(p)}
        />
      )}

    </DashboardLayout>
  );
}

export default SellerOrders;
