// FarmerSales — SokoMoja
// Farmer records offline (farm-gate) sales and views sales history/report.
// GET  /api/seller/sales?page=N
// POST /api/seller/sales

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import PaginationBar from "../../components/PaginationBar";
import Toast from "../../components/Toast";
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

  const [view, setView] = useState("history");

  // History + pagination state
  const [sales,        setSales]        = useState([]);
  const [summary,      setSummary]      = useState({ todayRevenue: 0, totalRevenue: 0, todaySales: 0, totalSales: 0 });
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [currentPage,  setCurrentPage]  = useState(1);
  const [lastPage,     setLastPage]     = useState(1);
  const [total,        setTotal]        = useState(0);
  const [perPage,      setPerPage]      = useState(15);

  // New sale form state
  const [saleItems,      setSaleItems]      = useState([{ product_name: "", quantity: "", unit: "kg", unit_price: "" }]);
  const [paymentMethod,  setPaymentMethod]  = useState("Cash");
  const [buyerName,      setBuyerName]      = useState("");
  const [saving,         setSaving]         = useState(false);
  const [toast,          setToast]          = useState(null);
  const [formErrors,     setFormErrors]     = useState({});

  useEffect(() => {
    fetchSales(currentPage);
  }, [currentPage]);

  async function fetchSales(page = 1) {
    try {
      setLoading(true);
      setError("");
      const res = await apiRequest(`/seller/sales?page=${page}`);

      // res.data = Laravel paginator; res.data.data = items array; res.summary = stat totals
      const paginated = res.data;
      setSales(paginated.data    ?? []);
      setLastPage(paginated.last_page ?? 1);
      setTotal(paginated.total    ?? 0);
      setPerPage(paginated.per_page ?? 15);

      setSummary({
        todayRevenue: res.summary?.today_revenue ?? 0,
        totalRevenue: res.summary?.total_revenue ?? 0,
        todaySales:   res.summary?.today_count   ?? 0,
        totalSales:   res.summary?.total_count   ?? 0,
      });
    } catch (err) {
      setError(err.message || "Failed to load sales.");
    } finally {
      setLoading(false);
    }
  }

  // ── Sale item handlers ───────────────────────────────────────────────
  const handleItemChange = (index, field, value) => {
    setSaleItems((prev) =>
      prev.map((item, i) => i === index ? { ...item, [field]: value } : item)
    );
  };

  const addItem = () => {
    setSaleItems((prev) => [...prev, { product_name: "", quantity: "", unit: "kg", unit_price: "" }]);
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
      if (!item.product_name.trim())              errs[`name_${i}`]  = "Required";
      if (!item.quantity   || item.quantity  <= 0) errs[`qty_${i}`]   = "Required";
      if (!item.unit_price || item.unit_price <= 0) errs[`price_${i}`] = "Required";
    });
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitSale = async (e) => {
    e.preventDefault();
    if (!validateSale()) return;
    setSaving(true);
    try {
      await apiRequest("/seller/sales", "POST", {
        buyer_name:     buyerName || null,
        payment_method: paymentMethod,
        items: saleItems.map((i) => ({
          product_name: i.product_name,
          quantity:     parseFloat(i.quantity),
          unit:         i.unit,
          unit_price:   parseFloat(i.unit_price),
          subtotal:     parseFloat(i.quantity) * parseFloat(i.unit_price),
        })),
      });

      setToast({ message: `Sale recorded — KES ${saleTotal.toFixed(2)} via ${paymentMethod}`, type: "success" });
      setSaleItems([{ product_name: "", quantity: "", unit: "kg", unit_price: "" }]);
      setBuyerName("");
      setView("history");

      // Refresh page 1 of the history so the new record is visible
      if (currentPage === 1) {
        fetchSales(1);
      } else {
        setCurrentPage(1); // triggers the useEffect → fetchSales(1)
      }
    } catch (err) {
      setToast({ message: "Failed to record sale: " + err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Sales" navItems={navItems}>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

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
          {/* Summary stats */}
          <div className="row g-3 mb-4 sm-fade-in">
            <div className="col-6 col-md-3">
              <div className="sm-stat-card d-flex align-items-center gap-3">
                <div className="sm-stat-icon">
                  <i className="bi bi-cash-coin"></i>
                </div>
                <div>
                  <div className="sm-stat-value">KES {summary.todayRevenue.toLocaleString()}</div>
                  <div className="sm-stat-label">Today's revenue</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="sm-stat-card d-flex align-items-center gap-3">
                <div className="sm-stat-icon">
                  <i className="bi bi-bar-chart-line"></i>
                </div>
                <div>
                  <div className="sm-stat-value">KES {summary.totalRevenue.toLocaleString()}</div>
                  <div className="sm-stat-label">Total (all time)</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="sm-stat-card d-flex align-items-center gap-3">
                <div className="sm-stat-icon">
                  <i className="bi bi-receipt"></i>
                </div>
                <div>
                  <div className="sm-stat-value">{summary.todaySales}</div>
                  <div className="sm-stat-label">Sales today</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="sm-stat-card d-flex align-items-center gap-3">
                <div className="sm-stat-icon">
                  <i className="bi bi-box-seam"></i>
                </div>
                <div>
                  <div className="sm-stat-value">{summary.totalSales}</div>
                  <div className="sm-stat-label">Total transactions</div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && <PageLoader text="Loading sales data..." />}

          {error && <div className="alert alert-danger">{error}</div>}

          {/* Empty state */}
          {!loading && !error && sales.length === 0 && (
            <EmptyState
              icon="bi-receipt"
              title="No sales recorded yet"
              text="Record your first offline sale or wait for marketplace orders to come in."
              btnLabel="Record a sale"
              btnAction={() => setView("record")}
            />
          )}

          {/* Sales table */}
          {!loading && !error && sales.length > 0 && (
            <div className="sm-card sm-fade-in">
              <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ fontSize: "0.875rem" }}>
                <caption className="visually-hidden">Sales history</caption>
                <thead className="table-light">
                  <tr>
                    <th scope="col">Sale ID</th>
                    <th scope="col">Date</th>
                    <th scope="col">Buyer</th>
                    <th scope="col">Items</th>
                    <th scope="col">Total</th>
                    <th scope="col">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.sale_id}>
                      <td className="text-muted">#{sale.sale_id}</td>
                      <td>{sale.sale_date ? new Date(sale.sale_date).toLocaleDateString("en-KE") : "—"}</td>
                      <td>{sale.buyer_name || "Walk-in buyer"}</td>
                      <td className="text-muted" style={{ fontSize: "0.8rem" }}>
                        {(sale.items ?? []).map((i) => `${i.product_name} × ${i.quantity} ${i.unit}`).join(", ")}
                      </td>
                      <td className="fw-semibold" style={{ color: "var(--sm-green)" }}>
                        KES {Number(sale.total_amount).toLocaleString()}
                      </td>
                      <td>{sale.payment_method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}

          {/* Pagination */}
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
        </>
      )}

      {/* ===== RECORD OFFLINE SALE VIEW ===== */}
      {view === "record" && (
        <form onSubmit={handleSubmitSale} noValidate className="sm-fade-in">
          <div className="sm-card p-4">
            <p className="text-muted small mb-4">
              Record a sale made directly at your farm or market stall — not through the SokoMoja marketplace.
            </p>

            {/* Buyer name (optional) */}
            <div className="mb-3">
              <label htmlFor="sale-buyer-name" className="form-label fw-semibold small">Buyer name (optional)</label>
              <input
                id="sale-buyer-name"
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
                <div className="col-5 col-md-2">
                  <div className="input-group input-group-sm">
                    <input
                      type="number" min="0" step="0.1"
                      className={`form-control ${formErrors[`qty_${i}`] ? "is-invalid" : ""}`}
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(i, "quantity", e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-4 col-md-2">
                  <select
                    className="form-select form-select-sm"
                    style={{ width: 90 }}
                    value={item.unit}
                    onChange={(e) => handleItemChange(i, "unit", e.target.value)}
                  >
                    <option value="kg">kg</option>
                    <option value="bunch">bunch</option>
                    <option value="piece">piece</option>
                    <option value="litre">litre</option>
                    <option value="crate">crate</option>
                    <option value="bag">bag</option>
                    <option value="dozen">dozen</option>
                  </select>
                </div>
                <div className="col-5 col-md-2">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text">KES</span>
                    <input
                      type="number" min="0"
                      className={`form-control ${formErrors[`price_${i}`] ? "is-invalid" : ""}`}
                      placeholder={`Price/${item.unit}`}
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
                      aria-label="Remove item"
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
                <label htmlFor="sale-payment-method" className="form-label fw-semibold small">Payment method</label>
                <select id="sale-payment-method" className="form-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
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
