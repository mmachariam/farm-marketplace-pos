// SellerProducts — SokoMoja
// Wired to GET /api/seller/products

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
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

function SellerProducts() {
  const navItems = [
    { label: "Dashboard",  icon: "bi-speedometer2",   path: "/seller/dashboard",   active: false },
    { label: "Products",   icon: "bi-flower2",        path: "/seller/products",    active: true  },
    { label: "Inventory",  icon: "bi-boxes",          path: "/seller/inventory",   active: false },
    { label: "Sales",      icon: "bi-receipt",        path: "/seller/sales",       active: false },
    { label: "Schedule",   icon: "bi-calendar-check", path: "/seller/schedule",    active: false },
    { label: "Orders",     icon: "bi-box-seam",       path: "/seller/orders",      active: false },
    { label: "Reports",    icon: "bi-file-earmark-text", path: "/seller/reports",  active: false },
    { label: "Profile",    icon: "bi-person-circle",  path: "/seller/profile",     active: false },
  ];

  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  // Edit state — inline toggle for product status
  const [editingId,   setEditingId]   = useState(null);
  const [editStatus,  setEditStatus]  = useState("active");
  const [editPrice,   setEditPrice]   = useState("");
  const [saving,      setSaving]      = useState(false);
  const [successMsg,  setSuccessMsg]  = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await apiRequest("/seller/products");
      setProducts(res.data || []);
    } catch (err) {
      setError(err.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  const getStatus = (p) => {
    const qty = p.inventory?.quantity_available ?? 0;
    if (qty === 0) return { label: "Out of stock", cls: "badge-cancelled" };
    if (qty < (p.inventory?.low_stock_threshold ?? 10)) return { label: "Low stock", cls: "badge-pending" };
    return { label: "In stock", cls: "badge-delivered" };
  };

  const startEdit = (p) => {
    setEditingId(p.product_id);
    setEditStatus(p.status);
    setEditPrice(String(p.price));
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (productId) => {
    setSaving(true);
    try {
      const res = await apiRequest(`/seller/products/${productId}`, "PATCH", {
        status: editStatus,
        price:  Number(editPrice),
      });
      setProducts((prev) => prev.map((p) => p.product_id === productId ? res.data : p));
      setSuccessMsg("Product updated.");
      setEditingId(null);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert("Update failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="My products" navItems={navItems}>

      {successMsg && <div className="alert alert-success py-2 small mb-3">{successMsg}</div>}

      <div className="d-flex justify-content-end mb-3">
        <Link
          to="/seller/products/add"
          className="btn btn-sm fw-semibold"
          style={{ background: "var(--sm-green)", color: "#fff", border: "none" }}
        >
          <i className="bi bi-plus me-1"></i>Add new product
        </Link>
      </div>

      {loading && <PageLoader text="Loading your products..." />}
      {error   && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && products.length === 0 && (
        <EmptyState
          icon="bi-flower2"
          title="No products listed yet"
          text="Start listing your fresh produce for buyers to discover and order."
          btnLabel="Add your first product"
          btnTo="/seller/products/add"
        />
      )}

      {!loading && !error && products.length > 0 && (
        <div className="sm-card sm-fade-in">
          <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: "0.875rem" }}>
            <caption className="visually-hidden">Your product listings</caption>
            <thead className="table-light">
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Category</th>
                <th scope="col">Price</th>
                <th scope="col">Stock</th>
                <th scope="col">Status</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const stockStatus = getStatus(p);
                const qty         = p.inventory?.quantity_available ?? 0;
                const isEditing   = editingId === p.product_id;

                return (
                  <tr key={p.product_id}>
                    <td className="fw-semibold">{p.name}</td>
                    <td className="text-muted">{p.category?.name ?? "—"}</td>

                    <td>
                      {isEditing ? (
                        <input
                          type="number" min="0" step="0.01"
                          className="form-control form-control-sm"
                          style={{ width: 90 }}
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                        />
                      ) : (
                        <>KES {p.price}/{p.unit}</>
                      )}
                    </td>

                    <td>{qty} {p.unit}</td>

                    <td>
                      {isEditing ? (
                        <select
                          className="form-select form-select-sm"
                          style={{ width: 120 }}
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      ) : (
                        <span className={`badge rounded-pill ${stockStatus.cls}`} style={{ fontSize: "0.72rem" }}>
                          {p.status === "inactive" ? "Inactive" : stockStatus.label}
                        </span>
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-success btn-sm"
                            aria-label="Save"
                            onClick={() => saveEdit(p.product_id)}
                            disabled={saving}
                          >
                            {saving
                              ? <span className="spinner-border spinner-border-sm" role="status"><span className="visually-hidden">Saving...</span></span>
                              : <i className="bi bi-check"></i>}
                          </button>
                          <button className="btn btn-sm btn-outline-secondary" aria-label="Cancel" onClick={cancelEdit}>
                            <i className="bi bi-x"></i>
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          style={{ fontSize: "0.72rem" }}
                          onClick={() => startEdit(p)}
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default SellerProducts;
