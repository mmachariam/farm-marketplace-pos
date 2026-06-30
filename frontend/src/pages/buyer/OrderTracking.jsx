// OrderTracking — SokoMoja
// Buyer can track a specific order's status with a visual progress stepper.
// Route: /buyer/orders/:orderId

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { apiRequest } from "../../utils/api";

function OrderTracking() {
  const { orderId } = useParams();

  const navItems = [
    { label: "Browse",    icon: "bi-shop",          path: "/buyer/dashboard", active: false },
    { label: "My orders", icon: "bi-box-seam",      path: "/buyer/orders",    active: true  },
    { label: "Cart",      icon: "bi-cart3",         path: "/buyer/dashboard", active: false },
    { label: "Profile",   icon: "bi-person-circle", path: "/buyer/profile",   active: false },
  ];

  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  // Per-item review state: { [product_id]: { rating, comment, submitted, submitting, showForm } }
  const [reviewState, setReviewState] = useState({});

  useEffect(() => {
    async function fetchOrder() {
      try {
        setLoading(true);
        setError("");
        const res = await apiRequest(`/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        setError(err.message || "Failed to load order.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  const steps = [
    { key: "Pending",   label: "Order placed",          icon: "bi-check-circle"  },
    { key: "Confirmed", label: "Confirmed by farmer",   icon: "bi-person-check"  },
    { key: "Delivered", label: "Ready for collection",  icon: "bi-geo-alt"       },
    { key: "Delivered", label: "Delivered / Collected", icon: "bi-bag-check"     },
  ];

  const statusIndex = {
    Pending: 0, Confirmed: 1, "In Transit": 2, Delivered: 3,
  };

  const currentStep = statusIndex[order?.order_status] ?? 0;

  const badgeClass = {
    Pending:   "badge-pending",
    Confirmed: "badge-confirmed",
    Delivered: "badge-delivered",
    Cancelled: "badge-cancelled",
  };

  const zoneName      = order?.delivery?.zone?.zone_name ?? null;
  const deliveryAddr  = order?.delivery?.delivery_address ?? null;
  const locationLabel = zoneName ?? deliveryAddr ?? "—";
  const pickupAddress = order?.delivery?.zone?.pickup_address ?? deliveryAddr ?? "—";
  const estimatedDate = order?.delivery?.delivery_date ?? null;

  // ── Per-item review helpers ──────────────────────────────────────
  const getItemReview = (productId) =>
    reviewState[productId] ?? { rating: 5, comment: "", submitted: false, submitting: false, showForm: false };

  const setItemReview = (productId, patch) =>
    setReviewState((prev) => ({
      ...prev,
      [productId]: { ...getItemReview(productId), ...patch },
    }));

  const handleReviewSubmit = async (e, productId) => {
    e.preventDefault();
    const rv = getItemReview(productId);
    setItemReview(productId, { submitting: true });
    try {
      await apiRequest("/reviews", "POST", {
        order_id:   Number(orderId),
        product_id: productId,
        rating:     rv.rating,
        comment:    rv.comment || null,
      });
      setItemReview(productId, { submitted: true, submitting: false, showForm: false });
    } catch (err) {
      alert("Failed to submit review: " + err.message);
      setItemReview(productId, { submitting: false });
    }
  };

  return (
    <DashboardLayout title={`Order #${orderId || "..."}`} navItems={navItems}>
      <div className="mb-3">
        <Link to="/buyer/orders" className="text-muted text-decoration-none small">
          <i className="bi bi-arrow-left me-1"></i>Back to orders
        </Link>
      </div>

      {loading && <div className="text-center text-muted py-5">Loading order…</div>}
      {error   && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && order && (
        <div className="row g-3">

          {/* Left: progress + details */}
          <div className="col-12 col-lg-7">

            {/* Status header */}
            <div className="sm-card p-4 mb-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">Order #{order.order_id}</h6>
                <span
                  className={`badge rounded-pill ${badgeClass[order.order_status] ?? "badge-pending"}`}
                  style={{ fontSize: "0.75rem" }}
                >
                  {order.order_status}
                </span>
              </div>
              <div className="text-muted small mb-1">
                Placed{" "}
                {order.order_date
                  ? new Date(order.order_date).toLocaleDateString("en-KE", { dateStyle: "medium" })
                  : "—"}
                {" "}·{" "}{locationLabel}
              </div>
            </div>

            {/* Progress stepper */}
            <div className="sm-card p-4 mb-3">
              <h6 className="fw-bold mb-4">Order progress</h6>
              <div className="position-relative">
                {steps.map((step, i) => {
                  const done    = i <= currentStep;
                  const current = i === currentStep;
                  return (
                    <div key={i} className="d-flex gap-3 mb-3 align-items-start">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: 36, height: 36,
                          background: done ? "var(--sm-green)" : "#e0ded5",
                          color: done ? "#fff" : "#73726c",
                          fontSize: "0.9rem",
                          border: current ? "2px solid var(--sm-green)" : "none",
                        }}
                      >
                        <i className={`bi ${step.icon}`}></i>
                      </div>
                      <div className="pt-1">
                        <div
                          className="fw-semibold"
                          style={{ fontSize: "0.875rem", color: done ? "#3d3d3a" : "#73726c" }}
                        >
                          {step.label}
                        </div>
                        {i === 2 && order.order_status === "Confirmed" && (
                          <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                            Est. {estimatedDate ?? "TBD"}
                          </div>
                        )}
                        {i === 3 && order.order_status === "Delivered" && (
                          <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                            {pickupAddress}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Collection point */}
            <div className="sm-card p-4">
              <h6 className="fw-bold mb-2">
                <i className="bi bi-geo-alt me-2" style={{ color: "var(--sm-green)" }}></i>
                Collection point
              </h6>
              <div className="fw-semibold" style={{ fontSize: "0.875rem" }}>
                {zoneName ?? "Home delivery"}
              </div>
              <div className="text-muted small">{pickupAddress}</div>
            </div>

          </div>

          {/* Right: order summary + reviews */}
          <div className="col-12 col-lg-5">

            {/* Order summary */}
            <div className="sm-card p-4 mb-3">
              <h6 className="fw-bold mb-3">Order summary</h6>
              <table className="table table-sm table-borderless mb-0">
                <thead>
                  <tr className="text-muted small">
                    <th>Item</th><th>Qty</th><th className="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items ?? []).map((item, i) => (
                    <tr key={i}>
                      <td style={{ fontSize: "0.875rem" }}>{item.product_name}</td>
                      <td className="text-muted" style={{ fontSize: "0.82rem" }}>{item.quantity} kg</td>
                      <td className="text-end" style={{ fontSize: "0.875rem" }}>KES {item.subtotal}</td>
                    </tr>
                  ))}
                  <tr className="border-top">
                    <td colSpan={2} className="fw-bold" style={{ fontSize: "0.875rem" }}>Total</td>
                    <td className="text-end fw-bold" style={{ color: "var(--sm-green)" }}>
                      KES {Number(order.total_amount).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
              <hr />
              <div className="d-flex justify-content-between small text-muted">
                <span>Payment</span>
                <span className="fw-semibold text-dark">
                  {order.payment?.payment_method ?? "—"} — {order.payment?.payment_status ?? "Pending"}
                </span>
              </div>
            </div>

            {/* Per-item reviews (only after delivery) */}
            {order.order_status === "Delivered" && (order.items ?? []).length > 0 && (
              <div className="sm-card p-4">
                <h6 className="fw-bold mb-3">
                  <i className="bi bi-star me-2" style={{ color: "var(--sm-green)" }}></i>
                  Rate your items
                </h6>

                {(order.items ?? []).map((item) => {
                  const productId = item.product_id;
                  if (!productId) return null;
                  const rv = getItemReview(productId);

                  return (
                    <div key={productId} className="mb-3 pb-3 border-bottom">
                      <div className="fw-semibold mb-2" style={{ fontSize: "0.875rem" }}>
                        {item.product_name}
                      </div>

                      {rv.submitted ? (
                        <div className="alert alert-success py-2 small mb-0">
                          ✅ Review submitted — thank you!
                        </div>
                      ) : rv.showForm ? (
                        <form onSubmit={(e) => handleReviewSubmit(e, productId)}>
                          <div className="mb-2">
                            <div className="d-flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star} type="button"
                                  onClick={() => setItemReview(productId, { rating: star })}
                                  style={{
                                    background: "none", border: "none",
                                    fontSize: "1.3rem", cursor: "pointer",
                                    color: star <= rv.rating ? "#f59e0b" : "#e0ded5",
                                  }}
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="mb-2">
                            <textarea
                              className="form-control form-control-sm"
                              rows={2}
                              placeholder="Optional comment…"
                              value={rv.comment}
                              onChange={(e) => setItemReview(productId, { comment: e.target.value })}
                            />
                          </div>
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => setItemReview(productId, { showForm: false })}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="btn btn-sm flex-grow-1"
                              style={{ background: "var(--sm-green)", color: "#fff", border: "none" }}
                              disabled={rv.submitting}
                            >
                              {rv.submitting ? "Submitting…" : "Submit review"}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          className="btn btn-sm"
                          style={{ border: "1px solid var(--sm-green)", color: "var(--sm-green)", fontSize: "0.8rem" }}
                          onClick={() => setItemReview(productId, { showForm: true })}
                        >
                          <i className="bi bi-pencil me-1"></i>Write a review
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default OrderTracking;
