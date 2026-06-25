// Checkout — SokoMoja
// Grocery/isGrocery logic removed. Buyer only.

import { useState } from "react";
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

  const pickupZones = [
    { zone_id: 1, zone_name: "Kiambu Zone", pickup_address: "Kiambu Town Market, Gate 3" },
    { zone_id: 2, zone_name: "Nakuru Zone", pickup_address: "Nakuru Central Market" },
    { zone_id: 3, zone_name: "Meru Zone",   pickup_address: "Meru Town Bus Stage" },
  ];

  const [zoneId, setZoneId]             = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("M-Pesa");
  const [mpesaNumber, setMpesaNumber]   = useState("");
  const [errors, setErrors]             = useState({});
  const [loading, setLoading]           = useState(false);
  const [successMsg, setSuccessMsg]     = useState("");

  const validate = () => {
    const errs = {};
    if (cart.length === 0)   errs.cart  = "Your cart is empty.";
    if (!zoneId && !deliveryAddress.trim()) errs.zone = "Select a pickup zone or enter a delivery address";
    if (paymentMethod === "M-Pesa") {
      if (!mpesaNumber.trim()) errs.mpesa = "M-Pesa number is required";
      else if (!/^0[17]\d{8}$/.test(mpesaNumber)) errs.mpesa = "Enter a valid Kenyan phone (e.g. 0712345678)";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleConfirmAndPay = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    if (!validate()) return;
    setLoading(true);
    try {
      // TODO: await apiRequest("/orders", "POST", { ... });
      await new Promise((r) => setTimeout(r, 1200));
      setSuccessMsg("✅ Order placed successfully! Redirecting to your orders…");
      clearCart();
      setTimeout(() => navigate("/buyer/orders"), 1500);
    } catch (err) {
      setErrors({ general: err.message || "Failed to place order." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Checkout" navItems={navItems}>
      {errors.general && <div className="alert alert-danger py-2 small mb-3">{errors.general}</div>}
      {successMsg && <div className="alert alert-success py-2 small mb-3">{successMsg}</div>}

      {cart.length === 0 && !successMsg && (
        <div className="text-center text-muted py-5">
          Your cart is empty.{" "}
          <Link to="/buyer/dashboard" style={{ color: "var(--sm-green)" }}>Browse produce</Link> to add items.
        </div>
      )}

      {cart.length > 0 && (
        <form onSubmit={handleConfirmAndPay} noValidate>
          <div className="row g-4">
            {/* Order summary + zone */}
            <div className="col-12 col-lg-7">
              <h6 className="fw-bold mb-3">Order summary</h6>
              <div className="sm-card mb-4">
                <table className="table table-sm mb-0" style={{ fontSize: "0.875rem" }}>
                  <thead className="table-light">
                    <tr><th>Item</th><th>Qty</th><th className="text-end">Subtotal</th></tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.product_id}>
                        <td>{item.name}</td>
                        <td className="text-muted">{item.quantity} kg</td>
                        <td className="text-end">KES {item.price * item.quantity}</td>
                      </tr>
                    ))}
                    <tr className="table-light">
                      <td colSpan={2} className="fw-bold">Total</td>
                      <td className="text-end fw-bold" style={{ color: "var(--sm-green)" }}>KES {cartTotal}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h6 className="fw-bold mb-3">Pickup zone</h6>
              <div className="mb-2">
                <select
                  className={`form-select ${errors.zone ? "is-invalid" : ""}`}
                  value={zoneId}
                  onChange={(e) => { setZoneId(e.target.value); setErrors((p) => ({ ...p, zone: "" })); }}
                >
                  <option value="">Select a pickup zone</option>
                  {pickupZones.map((z) => (
                    <option key={z.zone_id} value={z.zone_id}>{z.zone_name} — {z.pickup_address}</option>
                  ))}
                </select>
              </div>
              {zoneId && (
                <div className="rounded-3 p-2 mb-2 small" style={{ background: "var(--sm-green-light)", color: "#27500A" }}>
                  <i className="bi bi-geo-alt-fill me-1"></i>
                  {pickupZones.find((z) => z.zone_id === Number(zoneId))?.pickup_address}
                </div>
              )}
              <div className="text-muted small text-center mb-2">— or —</div>
              <div className="mb-1">
                <label className="form-label small fw-semibold">Delivery address (optional)</label>
                <input
                  className="form-control"
                  placeholder="Leave blank to collect from a zone"
                  value={deliveryAddress}
                  onChange={(e) => { setDeliveryAddress(e.target.value); setErrors((p) => ({ ...p, zone: "" })); }}
                />
              </div>
              {errors.zone && <div className="text-danger small">{errors.zone}</div>}
            </div>

            {/* Payment */}
            <div className="col-12 col-lg-5">
              <h6 className="fw-bold mb-3">Payment</h6>
              <div className="sm-card p-4">
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Payment method</label>
                  <select className="form-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="Card">Card</option>
                    <option value="Cash">Cash (pay on pickup)</option>
                  </select>
                </div>
                {paymentMethod === "M-Pesa" && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">M-Pesa number</label>
                    <input
                      type="tel"
                      className={`form-control ${errors.mpesa ? "is-invalid" : ""}`}
                      placeholder="07XX XXX XXX"
                      value={mpesaNumber}
                      onChange={(e) => { setMpesaNumber(e.target.value); setErrors((p) => ({ ...p, mpesa: "" })); }}
                    />
                    {errors.mpesa && <div className="invalid-feedback">{errors.mpesa}</div>}
                    <div className="form-text">You'll receive an STK push prompt to complete payment</div>
                  </div>
                )}
                {paymentMethod === "Cash" && <p className="text-muted small">Pay with cash when you collect your order at the pickup zone.</p>}
                <button
                  type="submit"
                  className="btn w-100 fw-semibold py-2"
                  style={{ background: "var(--sm-green)", color: "#fff", border: "none" }}
                  disabled={loading}
                >
                  {loading
                    ? <><span className="spinner-border spinner-border-sm me-2"></span>Processing…</>
                    : `Confirm & pay KES ${cartTotal}`}
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
