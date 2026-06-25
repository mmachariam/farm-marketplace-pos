// FarmerSales — SokoMoja
// Farmer records offline (farm-gate) sales and views sales history/report.
// Maps to: pos_sales + pos_sale_items tables (repurposed for farmer offline sales)
// GET  /api/seller/sales
// POST /api/seller/sales

import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";

function FarmerSales() {
  const navItems = [
    { label: "Dashboard",  icon: "bi-speedometer2",   path: "/seller/dashboard",  active: false },
    { label: "Products",   icon: "bi-flower2",        path: "/seller/products",   active: false },
    { label: "Inventory",  icon: "bi-boxes",          path: "/seller/inventory",  active: false },
    { label: "Sales",      icon: "bi-receipt",        path: "/seller/sales",      active: true  },
    { label: "Schedule",   icon: "bi-calendar-check", path: "/seller/schedule",   active: false },
    { label: "Orders",     icon: "bi-box-seam",       path: "/seller/orders",     active: false },
    { label: "Profile",    icon: "bi-person-circle",  path: "/seller/profile",    active: false },
  ];

  // ---- VIEW TOGGLE: "record" (new sale) or "history" (past sales) ----
  const [view, setView] = useState("history");

  // ---- HISTORY STATE ----
  const [sales, setSales]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  // ---- NEW SALE FORM STATE ----
  const [saleItems, setSaleItems] = useState([
    { product_name: "", quantity: "", unit_price: "" },
  ]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [buyerName, setBuyerName]         = useState("");
  const [saving, setSaving]               = useState(false);
  const [successMsg, setSuccessMsg]       = useState("");
  const [formErrors, setFormErrors]       = useState({});

  useEffect(() => {
    async function fetchSales() {
      try {
        setLoading(true);
        setError("");
        // TODO: const data = await apiRequest("/seller/sales");
        await new Promise((r) => setTimeout(r, 500));
        setSales([
          { sale_id: "FS201", date: "2026-06-09", buyer: "John M.",       items: "Broccoli × 5 kg", total: 400,  method: "M-Pesa" },
          { sale_id: "FS200", date: "2026-06-09", buyer: "Walk-in buyer", items: "Maize × 10 kg",   total: 450,  method: "Cash"   },
          { sale_id: "FS199", date: "2026-06-08", buyer: "Mary W.",       items: "Avocados × 30 kg",total: 450,  method: "M-Pesa" },
          { sale_id: "FS198", date: "2026-06-07", buyer: "Walk-in buyer", items: "Kale × 8 kg",     total: 240,  method: "Cash"   },
          { sale_id: "FS197", date: "2026-06-06", buyer: "Peter O.",      items: "Broccoli × 12 kg",total: 960,  method: "M-Pesa" },
        ]);
      } catch (err) {
        setError(err.message || "Failed to load sales.");
      } finally {
        setLoading(false);
      }
    }
    fetchSales();
  }, []);

  // ---- SALES STATS ----
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const todaySales   = sales.filter((s) => s.date === "2026-06-09");
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);

  // ---- SALE ITEM HANDLERS ----
  const handleItemChange = (index, field, value) => {
    setSaleItems((prev) =>
      prev.map((item, i) => i === index ? { ...item, [field]: value } : item)
    );
  };

  const addItem = () => {
    setSaleItems((prev) => [...prev, { product_name: "", quantity: "", unit_price: "" }]);
  };

  const removeItem = (index) => {
    setSaleItems((prev) => prev.filter((_, i) => i !== index));
  };

  const saleTotal = saleItems.reduce((sum, item) => {
    const qty   = parseFloat(item.quantity)   || 0;
    const price = parseFloat(item.unit_price) || 0;
    return sum + qty * price;
  }, 0);

  const validateSale = () => {
    const errs = {};
    saleItems.forEach((item, i) => {
      if (!item.product_name.trim()) errs[`name_${i}`]  = "Required";
      if (!item.quantity || item.quantity <= 0) errs[`qty_${i}`] = "Required";
      if (!item.unit_price || item.unit_price <= 0) errs[`price_${i}`] = "Required";
    });
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitSale = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    if (!validateSale()) return;
    setSaving(true);
    try {
      // TODO: await apiRequest("/seller/sales", "POST", {
      //   buyer_name: buyerName,
      //   payment_method: paymentMethod,
      //   total_amount: saleTotal,
      //   items: saleItems.map((i) => ({
      //     product_name: i.product_name,
      //     quantity: parseFloat(i.quantity),
      //     unit_price: parseFloat(i.unit_price),
      //     subtotal: parseFloat(i.quantity) * parseFloat(i.unit_price),
      //   })),
      // });
      await new Promise((r) => setTimeout(r, 900));

      // Add to local list
      const newSale = {
        sale_id: `FS${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        buyer: buyerName || "Walk-in buyer",
        items: saleItems.map((i) => `${i.product_name} × ${i.quantity} kg`).join(", "),
        total: saleTotal,
        method: paymentMethod,
      };
      setSales((prev) => [newSale, ...prev]);
      setSuccessMsg(`✅ Sale recorded — KES ${saleTotal} via ${paymentMethod}`);
      setSaleItems([{ product_name: "", quantity: "", unit_price: "" }]);
      setBuyerName("");
      setView("history");
    } catch (err) {
      alert("Failed to record sale: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Sales" navItems={navItems}>

      {/* View toggle tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${view === "history" ? "active fw-semibold" : "text-muted"}`}
            onClick={() => setView("history")}
          >
            <i className="bi bi-clock-history me-2"></i>Sales history
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${view === "record" ? "active fw-semibold" : "text-muted"}`}
            onClick={() => setView("record")}
          >
            <i className="bi bi-plus-circle me-2"></i>Record offline sale
          </button>
        </li>
      </ul>

      {/* ===== SALES HISTORY VIEW ===== */}
      {view === "history" && (
        <>
          {successMsg && <div className="alert alert-success py-2 small mb-3">{successMsg}</div>}

          {/* Summary stats */}
          <div className="row g-3 mb-4">
            <div className="col-6 col-md-3">
              <div className="sm-card p-3">
                <div className="text-muted mb-1" style={{ fontSize: "0.75rem" }}>Today's revenue</div>
                <div className="fw-bold" style={{ fontSize: "1.2rem" }}>KES {todayRevenue.toLocaleString()}</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="sm-card p-3">
                <div className="text-muted mb-1" style={{ fontSize: "0.75rem" }}>Total (all time)</div>
                <div className="fw-bold" style={{ fontSize: "1.2rem" }}>KES {totalRevenue.toLocaleString()}</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="sm-card p-3">
                <div className="text-muted mb-1" style={{ fontSize: "0.75rem" }}>Sales today</div>
                <div className="fw-bold" style={{ fontSize: "1.2rem" }}>{todaySales.length}</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="sm-card p-3">
                <div className="text-muted mb-1" style={{ fontSize: "0.75rem" }}>Total transactions</div>
                <div className="fw-bold" style={{ fontSize: "1.2rem" }}>{sales.length}</div>
              </div>
            </div>
          </div>

          {loading && <div className="text-center text-muted py-5">Loading sales…</div>}
          {error   && <div className="alert alert-danger">{error}</div>}

          {!loading && !error && (
            <div className="sm-card">
              <table className="table table-hover mb-0" style={{ fontSize: "0.875rem" }}>
                <thead className="table-light">
                  <tr>
                    <th>Sale ID</th>
                    <th>Date</th>
                    <th>Buyer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Method</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.sale_id}>
                      <td className="text-muted">#{sale.sale_id}</td>
                      <td>{sale.date}</td>
                      <td>{sale.buyer}</td>
                      <td className="text-muted" style={{ fontSize: "0.8rem" }}>{sale.items}</td>
                      <td className="fw-semibold" style={{ color: "var(--sm-green)" }}>KES {sale.total}</td>
                      <td>{sale.method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ===== RECORD OFFLINE SALE VIEW ===== */}
      {view === "record" && (
        <form onSubmit={handleSubmitSale} noValidate>
          <div className="sm-card p-4">
            <p className="text-muted small mb-4">
              Record a sale made directly at your farm or market stall — not through the SokoMoja marketplace.
            </p>

            {/* Buyer name (optional) */}
            <div className="mb-3">
              <label className="form-label fw-semibold small">Buyer name (optional)</label>
              <input
                className="form-control"
                placeholder="e.g. John M. or leave blank for walk-in"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
              />
            </div>

            {/* Sale items */}
            <label className="form-label fw-semibold small">Items sold</label>
            {saleItems.map((item, i) => (
              <div className="row g-2 mb-2 align-items-start" key={i}>
                <div className="col-12 col-md-5">
                  <input
                    className={`form-control form-control-sm ${formErrors[`name_${i}`] ? "is-invalid" : ""}`}
                    placeholder="Product name (e.g. Broccoli)"
                    value={item.product_name}
                    onChange={(e) => handleItemChange(i, "product_name", e.target.value)}
                  />
                  {formErrors[`name_${i}`] && <div className="invalid-feedback">Required</div>}
                </div>
                <div className="col-5 col-md-3">
                  <div className="input-group input-group-sm">
                    <input
                      type="number" min="0" step="0.1"
                      className={`form-control ${formErrors[`qty_${i}`] ? "is-invalid" : ""}`}
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(i, "quantity", e.target.value)}
                    />
                    <span className="input-group-text">kg</span>
                  </div>
                </div>
                <div className="col-5 col-md-3">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text">KES</span>
                    <input
                      type="number" min="0"
                      className={`form-control ${formErrors[`price_${i}`] ? "is-invalid" : ""}`}
                      placeholder="Price/kg"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(i, "unit_price", e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-2 col-md-1">
                  {saleItems.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger w-100"
                      onClick={() => removeItem(i)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button type="button" className="btn btn-sm btn-outline-secondary mb-4" onClick={addItem}>
              <i className="bi bi-plus me-1"></i>Add item
            </button>

            {/* Payment method */}
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold small">Payment method</label>
                <select className="form-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="Cash">Cash</option>
                  <option value="M-Pesa">M-Pesa</option>
                </select>
              </div>
              <div className="col-12 col-md-4 d-flex align-items-end">
                <div className="sm-card p-3 w-100 text-center">
                  <div className="text-muted small">Sale total</div>
                  <div className="fw-bold" style={{ fontSize: "1.2rem", color: "var(--sm-green)" }}>
                    KES {saleTotal.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn fw-semibold px-4"
              style={{ background: "var(--sm-green)", color: "#fff", border: "none" }}
              disabled={saving}
            >
              {saving ? (
                <><span className="spinner-border spinner-border-sm me-2"></span>Recording…</>
              ) : (
                <><i className="bi bi-check-circle me-2"></i>Record sale</>
              )}
            </button>
          </div>
        </form>
      )}

    </DashboardLayout>
  );
}

export default FarmerSales;
