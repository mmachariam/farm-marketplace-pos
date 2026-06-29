// FarmerInventory — SokoMoja
// Wired to GET /api/seller/inventory and PATCH /api/seller/inventory/{id}

import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { apiRequest } from "../../utils/api";

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

  const [inventory,   setInventory]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [editingId,   setEditingId]   = useState(null); // inventory_id being edited
  const [editQty,     setEditQty]     = useState("");
  const [editThreshold, setEditThreshold] = useState("");
  const [saving,      setSaving]      = useState(false);
  const [successMsg,  setSuccessMsg]  = useState("");

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    try {
      setLoading(true);
      const res = await apiRequest("/seller/inventory");
      setInventory(res.data || []);
    } catch (err) {
      setError(err.message || "Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  }

  const startEdit = (item) => {
    setEditingId(item.inventory_id);
    setEditQty(String(item.quantity_available));
    setEditThreshold(String(item.low_stock_threshold));
  };

  const cancelEdit = () => setEditingId(null);

  const handleSave = async (inventoryId) => {
    const qty = parseFloat(editQty);
    if (isNaN(qty) || qty < 0) return;
    setSaving(true);
    try {
      const res = await apiRequest(`/seller/inventory/${inventoryId}`, "PATCH", {
        quantity_available:  qty,
        low_stock_threshold: editThreshold !== "" ? parseFloat(editThreshold) : undefined,
      });
      setInventory((prev) =>
        prev.map((item) => item.inventory_id === inventoryId ? res.data : item)
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

  const getStatusBadge = (item) => {
    switch (item.stock_status) {
      case "out_of_stock": return { label: "Out of stock", cls: "badge-cancelled" };
      case "low_stock":    return { label: "Low stock",    cls: "badge-pending"   };
      default:             return { label: "Good",         cls: "badge-delivered" };
    }
  };

  return (
    <DashboardLayout title="Inventory" navItems={navItems}>

      {successMsg && <div className="alert alert-success py-2 small mb-3">{successMsg}</div>}

      {loading && <div className="text-center text-muted py-5">Loading inventory…</div>}
      {error   && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && inventory.length === 0 && (
        <div className="text-center text-muted py-5">No inventory yet — add your first product.</div>
      )}

      {!loading && !error && inventory.length > 0 && (
        <div className="sm-card">
          <table className="table table-hover mb-0" style={{ fontSize: "0.875rem" }}>
            <thead className="table-light">
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Alert at</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => {
                const badge     = getStatusBadge(item);
                const isEditing = editingId === item.inventory_id;

                return (
                  <tr key={item.inventory_id}>
                    <td className="fw-semibold">{item.product_name}</td>
                    <td className="text-muted">{item.category}</td>

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
                        </div>
                      ) : (
                        <>{item.quantity_available} {item.unit}</>
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <div className="d-flex gap-1 align-items-center">
                          <input
                            type="number" min="0"
                            className="form-control form-control-sm"
                            style={{ width: 80 }}
                            value={editThreshold}
                            onChange={(e) => setEditThreshold(e.target.value)}
                          />
                          <span className="text-muted small">{item.unit}</span>
                        </div>
                      ) : (
                        <span className="text-muted small">{item.low_stock_threshold} {item.unit}</span>
                      )}
                    </td>

                    <td>
                      <span className={`badge rounded-pill ${badge.cls}`} style={{ fontSize: "0.72rem" }}>
                        {badge.label}
                      </span>
                    </td>

                    <td>
                      {isEditing ? (
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-sm"
                            style={{ background: "var(--sm-green)", color: "#fff", border: "none" }}
                            onClick={() => handleSave(item.inventory_id)}
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
                          onClick={() => startEdit(item)}
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
