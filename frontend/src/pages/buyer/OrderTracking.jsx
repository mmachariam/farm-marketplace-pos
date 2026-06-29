// OrderTracking — SokoMoja
// Buyer can track a specific order's status with a visual progress stepper.
// Maps to: orders + deliveries + payments tables
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

  // Review state
  const [showReviewForm, setShowReviewForm]   = useState(false);
  const [reviewRating, setReviewRating]       = useState(5);
  const [reviewComment, setReviewComment]     = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

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

  // Progress steps mapped to order statuses
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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    // TODO: wire to POST /api/reviews once that endpoint is implemented
    await new Promise((r) => setTimeout(r, 700));
    setReviewSubmitted(true);
    setShowReviewForm(false);
  };

  const badgeClass = {
    Pending:   "badge-pending",
    Confirmed: "badge-confirmed",
    Delivered: "badge-delivered",
    Cancelled: "badge-cancelled",
  };

  // Derived display values
  const zoneName       = order?.delivery?.zone?.zone_name ?? null;
  const deliveryAddr   = order?.delivery?.delivery_address ?? null;
  const locationLabel  = zoneName ?? deliveryAddr ?? "—";
  const pickupAddress  = order?.delivery?.zone?.pickup_address ?? deliveryAddr ?? "—";
  const estimatedDate  = order?.delivery?.delivery_date ?? null;

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
                      {/* Icon circle */}
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
                      {/* Label */}
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

          {/* Right: order summary + review */}
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

            {/* Leave a review (only after delivery) */}
            {order.order_status === "Delivered" && (
              <div className="sm-card p-4">
                <h6 className="fw-bold mb-3">
                  <i className="bi bi-star me-2" style={{ color: "var(--sm-green)" }}></i>
                  Rate this order
                </h6>

                {reviewSubmitted ? (
                  <div className="alert alert-success py-2 small mb-0">
                    ✅ Review submitted — thank you!
                  </div>
                ) : showReviewForm ? (
                  <form onSubmit={handleReviewSubmit}>
                    <div className="mb-2">
                      <label className="form-label small fw-semibold">Rating</label>
                      <div className="d-flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star} type="button"
                            onClick={() => setReviewRating(star)}
                            style={{
                              background: "none", border: "none",
                              fontSize: "1.4rem", cursor: "pointer",
                              color: star <= reviewRating ? "#f59e0b" : "#e0ded5",
                            }}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-3">
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Share your experience with this farmer…"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                      />
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setShowReviewForm(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-sm flex-grow-1"
                        style={{ background: "var(--sm-green)", color: "#fff", border: "none" }}
                      >
                        Submit review
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    className="btn btn-sm w-100"
                    style={{ border: "1px solid var(--sm-green)", color: "var(--sm-green)" }}
                    onClick={() => setShowReviewForm(true)}
                  >
                    <i className="bi bi-pencil me-2"></i>Write a review
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default OrderTracking;
