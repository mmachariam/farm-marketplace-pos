// FarmerInventory — SokoMoja
// Farmer manages their produce inventory (stock levels).
// Maps to: inventory table
// GET /api/seller/inventory
// PATCH /api/seller/inventory/{id} { stock_quantity }

import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";

function FarmerInventory() {
  const navItems = [
    { label: "Dashboard",  icon: "bi-speedometer2",   path: "/seller/dashboard",   active: false },
    { label: "Products",   icon: "bi-flower2",        path: "/seller/products",    active: false },
    { label: "Inventory",  icon: "bi-boxes",          path: "/seller/inventory",   active: true  },
    { label: "Sales",      icon: "bi-receipt",        path: "/seller/sales",       active: false },
    { label: "Schedule",   icon: "bi-calendar-check", path: "/seller/schedule",    active: false },
    { label: "Orders",     icon: "bi-box-seam",       path: "/seller/orders",      active: false },
    { label: "Profile",    icon: "bi-person-circle",  path: "/seller/profile",     active: false },
  ];

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [editingId, setEditingId] = useState(null);  // product_id being edited
  const [editQty, setEditQty]     = useState("");
  const [saving, setSaving]       = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    async function fetchInventory() {
      try {
        setLoading(true);
        // TODO: const data = await apiRequest("/seller/inventory");
        await new Promise((r) => setTimeout(r, 500));
        setInventory([
          { product_id: 1, product_name: "Broccoli",    category: "Vegetables", stock_quantity: 40,  unit: "kg" },
          { product_id: 2, product_name: "Kale (Sukuma)",category: "Vegetables", stock_quantity: 5,   unit: "kg" },
          { product_id: 3, product_name: "Maize",       category: "Cereals",    stock_quantity: 0,   unit: "kg" },
          { product_id: 4, product_name: "Avocados",    category: "Fruits",     stock_quantity: 150, unit: "kg" },
        ]);
      } catch (err) {
        setError(err.message || "Failed to load inventory.");
      } finally {
        setLoading(false);
      }
    }
    fetchInventory();
  }, []);

  const handleSave = async (productId) => {
    const qty = parseInt(editQty);
    if (isNaN(qty) || qty < 0) return;
    setSaving(true);
    try {
      // TODO: await apiRequest(`/seller/inventory/${productId}`, "PATCH", { stock_quantity: qty });
      await new Promise((r) => setTimeout(r, 600));
      setInventory((prev) =>
        prev.map((item) => item.product_id === productId ? { ...item, stock_quantity: qty } : item)
      );
      setSuccessMsg("Stock updated successfully.");
      setEditingId(null);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert("Failed to update: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getStatus = (qty) => {
    if (qty === 0) return { label: "Out of stock", cls: "badge-cancelled" };
    if (qty < 10)  return { label: "Low stock",    cls: "badge-pending"   };
    return { label: "Good",         cls: "badge-delivered" };
  };

  return (
    <DashboardLayout title="Inventory" navItems={navItems}>

      {successMsg && <div className="alert alert-success py-2 small mb-3">{successMsg}</div>}

      {loading && <div className="text-center text-muted py-5">Loading inventory…</div>}
      {error   && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <div className="sm-card">
          <table className="table table-hover mb-0" style={{ fontSize: "0.875rem" }}>
            <thead className="table-light">
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => {
                const status = getStatus(item.stock_quantity);
                const isEditing = editingId === item.product_id;
                return (
                  <tr key={item.product_id}>
                    <td className="fw-semibold">{item.product_name}</td>
                    <td className="text-muted">{item.category}</td>
                    <td>{item.stock_quantity} {item.unit}</td>
                    <td><span className={`badge rounded-pill ${status.cls}`} style={{ fontSize: "0.72rem" }}>{status.label}</span></td>
                    <td>
                      {isEditing ? (
                        <div className="d-flex gap-1 align-items-center">
                          <input
                            type="number" min="0"
                            className="form-control form-control-sm"
                            style={{ width: 80 }}
                            value={editQty}
                            onChange={(e) => setEditQty(e.target.value)}
                            autoFocus
                          />
                          <span className="text-muted small">{item.unit}</span>
                          <button
                            className="btn btn-sm"
                            style={{ background: "var(--sm-green)", color: "#fff", border: "none" }}
                            onClick={() => handleSave(item.product_id)}
                            disabled={saving}
                          >
                            {saving ? "…" : <i className="bi bi-check"></i>}
                          </button>
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditingId(null)}>
                            <i className="bi bi-x"></i>
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => { setEditingId(item.product_id); setEditQty(String(item.stock_quantity)); }}
                        >
                          <i className="bi bi-pencil me-1"></i>Edit
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

export default FarmerInventory;
