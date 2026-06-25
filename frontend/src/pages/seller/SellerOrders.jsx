// ===========================================
// SELLER ORDERS PAGE
// Shows incoming orders for this seller's products,
// with the ability to confirm or cancel pending orders.
//
// Maps to: orders + order_items tables (filtered by this seller's products)
//
// Data flow:
// - Fetch from GET /api/seller/orders
// - "Confirm" → PATCH /api/seller/orders/{id} { status: "Confirmed" }
// - "Cancel"  → PATCH /api/seller/orders/{id} { status: "Cancelled" }
// ===========================================

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

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Tracks which order is currently being updated (to show a mini loading state per row)
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        setError("");

        // TODO: replace with real API call
        // const data = await apiRequest("/seller/orders");
        // setOrders(data);

        // TEMPORARY sample data
        await new Promise((res) => setTimeout(res, 500));
        setOrders([
          { order_id: 1061, buyer_name: "John K.",            date: "2026-06-09", zone: "Kiambu Zone", item_summary: "Broccoli × 8 kg", total: 640, status: "Pending"   },
          { order_id: 1058, buyer_name: "Mama Grace Grocers",  date: "2026-06-08", zone: "Nakuru Zone", item_summary: "Kale × 20 kg",   total: 600, status: "Confirmed" },
          { order_id: 1042, buyer_name: "Peter Otieno",        date: "2026-06-02", zone: "Kiambu Zone", item_summary: "Broccoli × 5 kg, Tomatoes × 10 kg", total: 1200, status: "Delivered" },
        ]);

      } catch (err) {
        setError(err.message || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  // ---- HELPER: badge class for each status ----
  const getBadgeClass = (status) => {
    switch (status) {
      case "Pending":   return "dash-badge-pending";
      case "Confirmed": return "dash-badge-confirmed";
      case "Delivered": return "dash-badge-delivered";
      case "Cancelled": return "dash-badge-cancelled";
      default:          return "dash-badge-pending";
    }
  };

  // ---- UPDATE ORDER STATUS ----
  // Used by both the Confirm and Cancel buttons
  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);

    try {
      // TODO: replace with real API call
      // await apiRequest(`/seller/orders/${orderId}`, "PATCH", { status: newStatus });

      // TEMPORARY: simulate network delay
      await new Promise((res) => setTimeout(res, 600));

      // Update the order's status in local state so the UI reflects the change immediately
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_id === orderId ? { ...order, status: newStatus } : order
        )
      );

    } catch (err) {
      alert(`Failed to update order: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <DashboardLayout title="Incoming orders" navItems={navItems}>

      {loading && <div className="dash-loading">Loading orders…</div>}
      {error && <div className="dash-error">⚠️ {error}</div>}

      {/* Empty state */}
      {!loading && !error && orders.length === 0 && (
        <div className="dash-empty-state">
          You have no orders yet. Once buyers order your produce, they'll appear here.
        </div>
      )}

      {/* ---- ORDERS LIST (cards, not a table, since each row needs action buttons) ---- */}
      {!loading && !error && orders.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {orders.map((order) => (
            <div className="dash-table-wrap" key={order.order_id} style={{ padding: "16px 20px" }}>

              {/* Header row: order ID + status badge */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontWeight: 600, fontSize: "14px" }}>Order #{order.order_id}</span>
                <span className={`dash-badge ${getBadgeClass(order.status)}`}>{order.status}</span>
              </div>

              {/* Order details */}
              <div style={{ fontSize: "12px", color: "#73726c", marginBottom: "6px" }}>
                Buyer: {order.buyer_name} · {order.date} · {order.zone}
              </div>
              <div style={{ fontSize: "13px", marginBottom: "10px" }}>
                {order.item_summary} — <strong>KES {order.total}</strong>
              </div>

              {/* Action buttons - only show for Pending orders */}
              {order.status === "Pending" && (
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
          ))}
        </div>
      )}

    </DashboardLayout>
  );
}

export default SellerOrders;
