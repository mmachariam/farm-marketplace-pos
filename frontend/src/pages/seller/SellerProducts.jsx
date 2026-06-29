// SellerProducts — SokoMoja
// Wired to GET /api/seller/products

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { apiRequest } from "../../utils/api";

function SellerProducts() {
  const navItems = [
    { label: "Dashboard",  icon: "bi-speedometer2",   path: "/seller/dashboard",   active: false },
    { label: "Products",   icon: "bi-flower2",        path: "/seller/products",    active: true  },
    { label: "Inventory",  icon: "bi-boxes",          path: "/seller/inventory",   active: false },
    { label: "Sales",      icon: "bi-receipt",        path: "/seller/sales",       active: false },
    { label: "Schedule",   icon: "bi-calendar-check", path: "/seller/schedule",    active: false },
    { label: "Orders",     icon: "bi-box-seam",       path: "/seller/orders",      active: false },
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

      {loading && <div className="text-center text-muted py-5">Loading products…</div>}
      {error   && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && products.length === 0 && (
        <div className="text-center text-muted py-5">
          No products yet.{" "}
          <Link to="/seller/products/add" style={{ color: "var(--sm-green)" }}>Add your first listing</Link>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="sm-card">
          <table className="table table-hover mb-0" style={{ fontSize: "0.875rem" }}>
            <thead className="table-light">
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th></th>
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
                            className="btn btn-sm"
                            style={{ background: "var(--sm-green)", color: "#fff", border: "none" }}
                            onClick={() => saveEdit(p.product_id)}
                            disabled={saving}
                          >
                            {saving ? "…" : <i className="bi bi-check"></i>}
                          </button>
                          <button className="btn btn-sm btn-outline-secondary" onClick={cancelEdit}>
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
      )}
    </DashboardLayout>
  );
}

export default SellerProducts;
