// Checkout — SokoMoja
// Buyer only. Loads real pickup zones, places order, initiates M-Pesa, polls for payment.

import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { useCart } from "../../context/CartContext";
import { apiRequest } from "../../utils/api";

function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();

  const navItems = [
    { label: "Browse",    icon: "bi-shop",          path: "/buyer/dashboard", active: false },
    { label: "My orders", icon: "bi-box-seam",      path: "/buyer/orders",    active: false },
    { label: "Cart",      icon: "bi-cart3",         path: "/buyer/dashboard", active: true  },
    { label: "Profile",   icon: "bi-person-circle", path: "/buyer/profile",   active: false },
  ];

  const [pickupZones, setPickupZones]       = useState([]);
  const [zoneId, setZoneId]                 = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod]   = useState("M-Pesa");
  const [mpesaNumber, setMpesaNumber]       = useState("");
  const [errors, setErrors]                 = useState({});
  const [loading, setLoading]               = useState(false);
  const [statusMsg, setStatusMsg]           = useState("");
  const [isSuccess, setIsSuccess]           = useState(false);

  // Polling refs — cleaned up on unmount so no stale intervals run
  const pollInterval = useRef(null);
  const pollTimeout  = useRef(null);

  useEffect(() => {
    apiRequest("/pickup-zones")
      .then((res) => setPickupZones(res.data ?? res))
      .catch(() => setPickupZones([]));

    return () => {
      clearInterval(pollInterval.current);
      clearTimeout(pollTimeout.current);
    };
  }, []);

  const validate = () => {
    const errs = {};
    if (cart.length === 0) errs.cart = "Your cart is empty.";
    if (!zoneId && !deliveryAddress.trim()) errs.zone = "Select a pickup zone or enter a delivery address.";
    if (paymentMethod === "M-Pesa") {
      if (!mpesaNumber.trim()) errs.mpesa = "M-Pesa number is required.";
      else if (!/^0[17]\d{8}$/.test(mpesaNumber)) errs.mpesa = "Enter a valid Kenyan phone (e.g. 0712345678).";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const stopPolling = () => {
    clearInterval(pollInterval.current);
    clearTimeout(pollTimeout.current);
  };

  const startPaymentPolling = (orderId) => {
    const POLL_INTERVAL_MS = 5000;
    const TIMEOUT_MS       = 120000; // 2 minutes

    // Auto-timeout after 2 minutes
    pollTimeout.current = setTimeout(() => {
      stopPolling();
      setLoading(false);
      setErrors({ general: "Payment confirmation timed out. Check your orders page for the latest status." });
    }, TIMEOUT_MS);

    pollInterval.current = setInterval(async () => {
      try {
        const res = await apiRequest(`/payments/${orderId}/status`);
        const { payment_status } = res.data;

        if (payment_status === "Completed") {
          stopPolling();
          setIsSuccess(true);
          setStatusMsg("Payment confirmed! Redirecting to your orders…");
          clearCart();
          setTimeout(() => navigate("/buyer/orders"), 1800);
        } else if (payment_status === "Failed") {
          stopPolling();
          setLoading(false);
          setErrors({ general: "Payment failed or was cancelled. Please try again." });
        }
        // if still Pending, keep polling
      } catch {
        // Network hiccup — keep polling
      }
    }, POLL_INTERVAL_MS);
  };

  const handleConfirmAndPay = async (e) => {
    e.preventDefault();
    setStatusMsg("");
    setIsSuccess(false);
    if (!validate()) return;
    setLoading(true);

    try {
      // 1. Place the order
      const orderPayload = {
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity:   item.quantity,
        })),
        zone_id:          zoneId ? Number(zoneId) : null,
        delivery_address: deliveryAddress || null,
        payment_method:   paymentMethod,
        phone_number:     paymentMethod === "M-Pesa" ? mpesaNumber : null,
      };

      const orderRes = await apiRequest("/orders", "POST", orderPayload);
      const orderId  = orderRes.data.order_id;

      // 2. For non-M-Pesa payments, we're done
      if (paymentMethod !== "M-Pesa") {
        setIsSuccess(true);
        setStatusMsg("Order placed successfully! Redirecting to your orders…");
        clearCart();
        setTimeout(() => navigate("/buyer/orders"), 1800);
        return;
      }

      // 3. Initiate M-Pesa STK push
      setStatusMsg("Sending M-Pesa prompt to your phone…");
      await apiRequest("/payments/mpesa/initiate", "POST", {
        order_id:     orderId,
        phone_number: mpesaNumber,
      });

      setStatusMsg("Check your phone and enter your M-Pesa PIN. Waiting for confirmation…");

      // 4. Poll every 5 seconds for up to 2 minutes
      startPaymentPolling(orderId);

    } catch (err) {
      setLoading(false);
      setErrors({ general: err.message || "Failed to place order. Please try again." });
    }
  };

  const selectedZone = pickupZones.find((z) => z.zone_id === Number(zoneId));

  return (
    <DashboardLayout title="Checkout" navItems={navItems}>
      {errors.general && <div className="alert alert-danger py-2 small mb-3">{errors.general}</div>}
      {statusMsg && (
        <div className={`alert py-2 small mb-3 ${isSuccess ? "alert-success" : "alert-info"}`}>
          {!isSuccess && <span className="spinner-border spinner-border-sm me-2"></span>}
          {statusMsg}
        </div>
      )}

      {cart.length === 0 && !isSuccess && (
        <div className="text-center text-muted py-5">
          Your cart is empty.{" "}
          <Link to="/buyer/dashboard" className="text-success">Browse produce</Link> to add items.
        </div>
      )}

      {cart.length > 0 && !isSuccess && (
        <form onSubmit={handleConfirmAndPay} noValidate className="sm-fade-in">
          <div className="row g-4">
            {/* ── Order summary + zone ── */}
            <div className="col-12 col-lg-7">
              <h6 className="fw-bold mb-3">Order summary</h6>
              <div className="sm-card mb-4">
                <div className="table-responsive">
                <table className="table table-sm mb-0" style={{ fontSize: "0.875rem" }}>
                  <thead className="table-light">
                    <tr><th>Item</th><th>Qty</th><th className="text-end">Subtotal</th></tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.product_id}>
                        <td>{item.name}</td>
                        <td className="text-muted">{item.quantity} kg</td>
                        <td className="text-end">KES {(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="table-light">
                      <td colSpan={2} className="fw-bold">Total</td>
                      <td className="text-end fw-bold" style={{ color: "var(--sm-green)" }}>
                        KES {cartTotal.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
                </div>
              </div>

              <h6 className="fw-bold mb-3">Pickup zone</h6>
              <div className="mb-2">
                <select
                  aria-label="Pickup zone"
                  className={`form-select ${errors.zone ? "is-invalid" : ""}`}
                  value={zoneId}
                  onChange={(e) => { setZoneId(e.target.value); setErrors((p) => ({ ...p, zone: "" })); }}
                  disabled={loading}
                >
                  <option value="">Select a pickup zone</option>
                  {pickupZones.map((z) => (
                    <option key={z.zone_id} value={z.zone_id}>
                      {z.zone_name} — {z.pickup_address}
                    </option>
                  ))}
                </select>
              </div>
              {selectedZone && (
                <div className="rounded-3 p-2 mb-2 small bg-success-subtle text-success-emphasis">
                  <i className="bi bi-geo-alt-fill me-1"></i>{selectedZone.pickup_address}
                </div>
              )}
              <div className="text-muted small text-center mb-2">— or —</div>
              <div className="mb-1">
                <label htmlFor="checkout-delivery-address" className="form-label small fw-semibold">
                  Delivery address <span className="text-muted fw-normal">(optional)</span>
                </label>
                <input
                  id="checkout-delivery-address"
                  className="form-control"
                  placeholder="Leave blank to collect from a zone"
                  value={deliveryAddress}
                  onChange={(e) => { setDeliveryAddress(e.target.value); setErrors((p) => ({ ...p, zone: "" })); }}
                  disabled={loading}
                />
              </div>
              {errors.zone && (
                <div className="text-danger small">
                  <i className="bi bi-exclamation-circle me-1"></i>{errors.zone}
                </div>
              )}
            </div>

            {/* ── Payment ── */}
            <div className="col-12 col-lg-5">
              <h6 className="fw-bold mb-3">Payment</h6>
              <div className="sm-card p-4">
                <div className="mb-3">
                  <label htmlFor="checkout-payment-method" className="form-label fw-semibold small">
                    Payment method <span className="text-danger">*</span>
                  </label>
                  <select
                    id="checkout-payment-method"
                    className="form-select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    disabled={loading}
                  >
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="Card">Card</option>
                    <option value="Cash">Cash (pay on pickup)</option>
                  </select>
                </div>

                {paymentMethod === "M-Pesa" && (
                  <div className="mb-3">
                    <label htmlFor="checkout-mpesa-number" className="form-label fw-semibold small">
                      M-Pesa number <span className="text-danger">*</span>
                    </label>
                    <input
                      id="checkout-mpesa-number"
                      type="tel"
                      className={`form-control ${errors.mpesa ? "is-invalid" : ""}`}
                      placeholder="07XX XXX XXX"
                      value={mpesaNumber}
                      onChange={(e) => { setMpesaNumber(e.target.value); setErrors((p) => ({ ...p, mpesa: "" })); }}
                      disabled={loading}
                    />
                    {errors.mpesa && (
                      <div className="invalid-feedback d-block">
                        <i className="bi bi-exclamation-circle me-1"></i>{errors.mpesa}
                      </div>
                    )}
                    <div className="form-text text-muted">You'll receive an STK push prompt to complete payment.</div>
                  </div>
                )}

                {paymentMethod === "Cash" && (
                  <p className="text-muted small">Pay with cash when you collect your order at the pickup zone.</p>
                )}

                <button
                  type="submit"
                  className="btn btn-success w-100 fw-semibold py-2"
                  disabled={loading}
                >
                  {loading
                    ? <><span className="spinner-border spinner-border-sm me-2"></span>Processing...</>
                    : `Confirm & pay KES ${cartTotal.toFixed(2)}`}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </DashboardLayout>
  );
}

export default Checkout;
