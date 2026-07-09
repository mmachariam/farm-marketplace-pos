// FarmerInventory — SokoMoja
// Wired to GET /api/seller/inventory and PATCH /api/seller/inventory/{id}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
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

function FarmerInventory() {
  const navItems = [
    { label: "Dashboard",  icon: "bi-speedometer2",   path: "/seller/dashboard",   active: false },
    { label: "Products",   icon: "bi-flower2",        path: "/seller/products",    active: false },
    { label: "Inventory",  icon: "bi-boxes",          path: "/seller/inventory",   active: true  },
    { label: "Sales",      icon: "bi-receipt",        path: "/seller/sales",       active: false },
    { label: "Schedule",   icon: "bi-calendar-check", path: "/seller/schedule",    active: false },
    { label: "Orders",     icon: "bi-box-seam",       path: "/seller/orders",      active: false },
    { label: "Reports",    icon: "bi-file-earmark-text", path: "/seller/reports",  active: false },
    { label: "Profile",    icon: "bi-person-circle",  path: "/seller/profile",     active: false },
  ];

  const [inventory,   setInventory]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [editingId,   setEditingId]   = useState(null); // inventory_id being edited
  const [editQty,     setEditQty]     = useState("");
  const [editThreshold, setEditThreshold] = useState("");
  const [saving,      setSaving]      = useState(false);
  const [toast,       setToast]       = useState(null);

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
      setToast({ message: "Stock updated successfully.", type: "success" });
      setEditingId(null);
    } catch (err) {
      setToast({ message: "Failed to update: " + err.message, type: "error" });
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

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {loading && <PageLoader text="Loading inventory..." />}
      {error   && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && inventory.length === 0 && (
        <EmptyState
          icon="bi-boxes"
          title="No inventory found"
          text="Your inventory will appear here once you have active product listings."
          btnLabel="Add a product"
          btnTo="/seller/products/add"
        />
      )}

      {!loading && !error && inventory.length > 0 && (
        <div className="sm-card sm-fade-in">
          <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: "0.875rem" }}>
            <caption className="visually-hidden">Inventory levels</caption>
            <thead className="table-light">
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Category</th>
                <th scope="col">Stock</th>
                <th scope="col">Alert at</th>
                <th scope="col">Status</th>
                <th scope="col">Update</th>
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
                            className="btn btn-success btn-sm"
                            aria-label="Save"
                            onClick={() => handleSave(item.inventory_id)}
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
        </div>
      )}

    </DashboardLayout>
  );
}

export default FarmerInventory;
