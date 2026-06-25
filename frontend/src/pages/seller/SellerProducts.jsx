// SellerProducts — SokoMoja
// Updated navItems with Bootstrap Icons and full farmer sidebar.

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";

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
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        await new Promise((r) => setTimeout(r, 500));
        setProducts([
          { product_id: 1, product_name: "Broccoli",     category: "Vegetables", price: 80, stock_quantity: 40  },
          { product_id: 2, product_name: "Kale (Sukuma)",category: "Vegetables", price: 30, stock_quantity: 5   },
          { product_id: 3, product_name: "Maize",        category: "Cereals",    price: 45, stock_quantity: 0   },
          { product_id: 4, product_name: "Avocados",     category: "Fruits",     price: 15, stock_quantity: 150 },
        ]);
      } catch (err) { setError(err.message || "Failed to load products."); }
      finally { setLoading(false); }
    }
    fetchProducts();
  }, []);

  const getStatus = (qty) => {
    if (qty === 0) return { label: "Out of stock", cls: "badge-cancelled" };
    if (qty < 10)  return { label: "Low stock",    cls: "badge-pending"   };
    return { label: "In stock", cls: "badge-delivered" };
  };

  return (
    <DashboardLayout title="My products" navItems={navItems}>
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
              <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const status = getStatus(p.stock_quantity);
                return (
                  <tr key={p.product_id}>
                    <td className="fw-semibold">{p.product_name}</td>
                    <td className="text-muted">{p.category}</td>
                    <td>KES {p.price}/kg</td>
                    <td>{p.stock_quantity} kg</td>
                    <td><span className={`badge rounded-pill ${status.cls}`} style={{ fontSize: "0.72rem" }}>{status.label}</span></td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        style={{ fontSize: "0.72rem" }}
                        onClick={() => alert(`Edit ${p.product_name} (coming soon)`)}
                      >
                        Edit
                      </button>
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
