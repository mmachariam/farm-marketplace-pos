// SellerOrders — SokoMoja
// Shows incoming orders for this seller's products.
// Confirm or cancel pending orders via the real API.

import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { apiRequest } from "../../utils/api";

function SellerOrders() {
  const navItems = [
    { label: "Dashboard",  icon: "bi-speedometer2",   path: "/seller/dashboard",  active: false },
    { label: "Products",   icon: "bi-flower2",        path: "/seller/products",   active: false },
    { label: "Inventory",  icon: "bi-boxes",          path: "/seller/inventory",  active: false },
    { label: "Sales",      icon: "bi-receipt",        path: "/seller/sales",      active: false },
    { label: "Schedule",   icon: "bi-calendar-check", path: "/seller/schedule",   active: false },
    { label: "Orders",     icon: "bi-box-seam",       path: "/seller/orders",     active: true  },
    { label: "Profile",    icon: "bi-person-circle",  path: "/seller/profile",    active: false },
  ];

  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage]   = useState(1);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  async function fetchOrders(page) {
    try {
      setLoading(true);
      setError("");

      const res = await apiRequest(`/seller/orders?page=${page}`);
      const paginated = res.data;
      setOrders(paginated.data ?? []);
      setLastPage(paginated.last_page ?? 1);
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

      {loading && <div className="dash-loading">Loading orders…</div>}
      {error && <div className="dash-error">⚠ {error}</div>}

      {!loading && !error && orders.length === 0 && (
        <div className="dash-empty-state">
          You have no orders yet. Once buyers order your produce, they'll appear here.
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {orders.map((order) => {
              const date = order.order_date
                ? new Date(order.order_date).toLocaleDateString("en-KE", { dateStyle: "medium" })
                : "—";
              const zone = order.zone?.zone_name ?? "—";

              return (
                <div className="dash-table-wrap" key={order.order_id} style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontWeight: 600, fontSize: "14px" }}>Order #{order.order_id}</span>
                    <span className={`dash-badge ${getBadgeClass(order.order_status)}`}>{order.order_status}</span>
                  </div>

                  <div style={{ fontSize: "12px", color: "#73726c", marginBottom: "6px" }}>
                    Buyer: {order.buyer?.name ?? "—"} · {date} · {zone}
                  </div>
                  <div style={{ fontSize: "13px", marginBottom: "10px" }}>
                    {summariseItems(order.items)} — <strong>KES {Number(order.total_amount).toFixed(2)}</strong>
                  </div>

                  {order.order_status === "Pending" && (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => updateOrderStatus(order.order_id, "Confirmed")}
                        disabled={updatingId === order.order_id}
                        style={{
                          fontSize: "13px", padding: "6px 16px", borderRadius: "8px",
                          border: "1px solid #1D9E75", background: "#EAF3DE", color: "#27500A",
                          cursor: "pointer", fontWeight: 500,
                        }}
                      >
                        {updatingId === order.order_id ? "Updating…" : "Confirm"}
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.order_id, "Cancelled")}
                        disabled={updatingId === order.order_id}
                        style={{
                          fontSize: "13px", padding: "6px 16px", borderRadius: "8px",
                          border: "1px solid #e0ded5", background: "#fff", color: "#73726c",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

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

export default SellerOrders;
