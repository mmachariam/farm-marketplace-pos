// ===========================================
// ADMIN PICKUP ZONES PAGE
// Lists all pickup zones with farmer counts and active orders.
// Allows adding a new zone via a simple form.
//
// Maps to: pickup_zones table
//
// Data flow:
// - Fetch from GET /api/admin/zones
// - Add new zone → POST /api/admin/zones
// ===========================================

import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
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

export default function AdminZones() {
  const location = useLocation();

  const navItems = [
    { label: "Overview",  icon: "bi-grid-1x2",          path: "/admin/overview",  active: false },
    { label: "Users",     icon: "bi-people",            path: "/admin/users",     active: false },
    { label: "Zones",     icon: "bi-geo-alt",           path: "/admin/zones",     active: true  },
    { label: "Reports",   icon: "bi-file-earmark-text", path: "/admin/reports",   active: false },
    { label: "Profile",   icon: "bi-person-circle",     path: "/admin/profile",   active: false },
  ];

  const [zones,      setZones]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [showForm,   setShowForm]   = useState(!!location.state?.openForm);
  const [saving,     setSaving]     = useState(false);
  const [toast,      setToast]      = useState(null);

  const [formData,   setFormData]   = useState({
    zoneName:      "",
    region:        "",
    pickupAddress: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // ── Inline edit / delete ──────────────────────────────────────────
  const [editingId,   setEditingId]   = useState(null);
  const [editForm,    setEditForm]    = useState({ zoneName: "", region: "", pickupAddress: "" });
  const [editErrors,  setEditErrors]  = useState({});
  const [editSaving,  setEditSaving]  = useState(false);
  const [deletingId,  setDeletingId]  = useState(null);
  const [zoneErrors,  setZoneErrors]  = useState({}); // per-zone delete/edit errors, keyed by zone_id

  // ── Load zones on mount ───────────────────────────────────────────
  useEffect(() => {
    async function fetchZones() {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest("/admin/zones");
        setZones(data.data);
      } catch (err) {
        setError(err.message || "Failed to load pickup zones.");
      } finally {
        setLoading(false);
      }
    }
    fetchZones();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (formErrors[name]) setFormErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.zoneName.trim())      errs.zoneName      = "Zone name is required";
    if (!formData.region.trim())        errs.region        = "Region is required";
    if (!formData.pickupAddress.trim()) errs.pickupAddress = "Pickup address is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Add new zone ──────────────────────────────────────────────────
  const handleAddZone = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    try {
      const data = await apiRequest("/admin/zones", "POST", {
        zone_name:      formData.zoneName,
        region:         formData.region,
        pickup_address: formData.pickupAddress,
      });

      setZones((prev) => [...prev, data.data]);
      setFormData({ zoneName: "", region: "", pickupAddress: "" });
      setShowForm(false);
      setToast({ message: "Pickup zone added successfully.", type: "success" });

    } catch (err) {
      if (err.errors) {
        const mapped = {};
        if (err.errors.zone_name)      mapped.zoneName      = err.errors.zone_name[0];
        if (err.errors.region)         mapped.region        = err.errors.region[0];
        if (err.errors.pickup_address) mapped.pickupAddress = err.errors.pickup_address[0];
        setFormErrors(mapped);
      } else {
        setError(err.message || "Failed to add zone.");
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Inline edit ────────────────────────────────────────────────────
  const startEdit = (zone) => {
    setEditingId(zone.zone_id);
    setEditForm({
      zoneName:      zone.zone_name,
      region:        zone.region,
      pickupAddress: zone.pickup_address,
    });
    setEditErrors({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditErrors({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((p) => ({ ...p, [name]: value }));
    if (editErrors[name]) setEditErrors((p) => ({ ...p, [name]: "" }));
  };

  const validateEdit = () => {
    const errs = {};
    if (!editForm.zoneName.trim())      errs.zoneName      = "Zone name is required";
    if (!editForm.region.trim())        errs.region        = "Region is required";
    if (!editForm.pickupAddress.trim()) errs.pickupAddress = "Pickup address is required";
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveEdit = async (zoneId) => {
    if (!validateEdit()) return;
    setEditSaving(true);
    try {
      const data = await apiRequest(`/admin/zones/${zoneId}`, "PATCH", {
        zone_name:      editForm.zoneName,
        region:         editForm.region,
        pickup_address: editForm.pickupAddress,
      });

      setZones((prev) => prev.map((z) => z.zone_id === zoneId ? { ...z, ...data.data } : z));
      setEditingId(null);
      setToast({ message: "Pickup zone updated successfully.", type: "success" });

    } catch (err) {
      if (err.errors) {
        const mapped = {};
        if (err.errors.zone_name)      mapped.zoneName      = err.errors.zone_name[0];
        if (err.errors.region)         mapped.region        = err.errors.region[0];
        if (err.errors.pickup_address) mapped.pickupAddress = err.errors.pickup_address[0];
        setEditErrors(mapped);
      } else {
        setZoneErrors((prev) => ({ ...prev, [zoneId]: err.message || "Failed to update zone." }));
      }
    } finally {
      setEditSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────
  const handleDeleteZone = async (zone) => {
    if (!window.confirm(`Delete pickup zone "${zone.zone_name}"? This cannot be undone.`)) return;

    setDeletingId(zone.zone_id);
    setZoneErrors((prev) => ({ ...prev, [zone.zone_id]: "" }));
    try {
      await apiRequest(`/admin/zones/${zone.zone_id}`, "DELETE");
      setZones((prev) => prev.filter((z) => z.zone_id !== zone.zone_id));
      setToast({ message: "Pickup zone deleted successfully.", type: "success" });
    } catch (err) {
      setZoneErrors((prev) => ({ ...prev, [zone.zone_id]: err.message || "Failed to delete zone." }));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout title="Pickup zones" navItems={navItems}>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {error && <div className="alert alert-danger mb-3">{error}</div>}

      {/* Add zone button */}
      <div className="mb-3">
        <button
          className="btn btn-success btn-sm d-flex align-items-center gap-2"
          onClick={() => setShowForm(!showForm)}>
          {showForm
            ? <><i className="bi bi-x"></i> Cancel</>
            : <><i className="bi bi-plus"></i> Add zone</>}
        </button>
      </div>

      {/* Add zone form */}
      {showForm && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <form onSubmit={handleAddZone} noValidate>
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <label htmlFor="zone-name" className="form-label fw-semibold small">
                    Zone name <span className="text-danger">*</span>
                  </label>
                  <input id="zone-name" className={`form-control ${formErrors.zoneName ? "is-invalid" : ""}`}
                    name="zoneName" placeholder="e.g. Eldoret Zone"
                    value={formData.zoneName} onChange={handleChange} />
                  {formErrors.zoneName && (
                    <div className="invalid-feedback d-block">
                      <i className="bi bi-exclamation-circle me-1"></i>{formErrors.zoneName}
                    </div>
                  )}
                </div>

                <div className="col-12 col-md-3">
                  <label htmlFor="zone-region" className="form-label fw-semibold small">
                    Region <span className="text-danger">*</span>
                  </label>
                  <select id="zone-region" className={`form-select ${formErrors.region ? "is-invalid" : ""}`}
                    name="region" value={formData.region} onChange={handleChange}>
                    <option value="">Select region</option>
                    {["Kiambu","Nakuru","Meru","Nairobi","Eldoret","Kisumu","Mombasa","Kakamega"].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  {formErrors.region && (
                    <div className="invalid-feedback d-block">
                      <i className="bi bi-exclamation-circle me-1"></i>{formErrors.region}
                    </div>
                  )}
                </div>

                <div className="col-12 col-md-5">
                  <label htmlFor="zone-pickup-address" className="form-label fw-semibold small">
                    Pickup address <span className="text-danger">*</span>
                  </label>
                  <input id="zone-pickup-address" className={`form-control ${formErrors.pickupAddress ? "is-invalid" : ""}`}
                    name="pickupAddress" placeholder="e.g. Eldoret Town Market, Gate 1"
                    value={formData.pickupAddress} onChange={handleChange} />
                  {formErrors.pickupAddress && (
                    <div className="invalid-feedback d-block">
                      <i className="bi bi-exclamation-circle me-1"></i>{formErrors.pickupAddress}
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="btn btn-success btn-sm mt-3 px-4"
                disabled={saving}>
                {saving
                  ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                  : "Save zone"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Zones list */}
      {loading && <PageLoader text="Loading pickup zones..." />}

      {!loading && zones.length === 0 && !error && (
        <EmptyState
          icon="bi-geo-alt"
          title="No pickup zones yet"
          text="Add your first pickup zone so farmers and buyers can coordinate collections."
          btnLabel="Add zone"
          btnAction={() => setShowForm(true)}
        />
      )}

      {!loading && zones.length > 0 && (
        <div className="row g-3">
          {zones.map((zone) => (
            <div className="col-12 col-md-6 col-lg-4" key={zone.zone_id}>
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">

                  {editingId === zone.zone_id ? (
                    // ── Inline edit form ──────────────────────────
                    <div>
                      <div className="mb-2">
                        <label htmlFor={`zone-edit-name-${zone.zone_id}`} className="form-label small fw-semibold mb-1">Zone name</label>
                        <input id={`zone-edit-name-${zone.zone_id}`} className={`form-control form-control-sm ${editErrors.zoneName ? "is-invalid" : ""}`}
                          name="zoneName" value={editForm.zoneName} onChange={handleEditChange} />
                        {editErrors.zoneName && (
                          <div className="invalid-feedback d-block">
                            <i className="bi bi-exclamation-circle me-1"></i>{editErrors.zoneName}
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <label htmlFor={`zone-edit-region-${zone.zone_id}`} className="form-label small fw-semibold mb-1">Region</label>
                        <select id={`zone-edit-region-${zone.zone_id}`} className={`form-select form-select-sm ${editErrors.region ? "is-invalid" : ""}`}
                          name="region" value={editForm.region} onChange={handleEditChange}>
                          <option value="">Select region</option>
                          {["Kiambu","Nakuru","Meru","Nairobi","Eldoret","Kisumu","Mombasa","Kakamega"].map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        {editErrors.region && (
                          <div className="invalid-feedback d-block">
                            <i className="bi bi-exclamation-circle me-1"></i>{editErrors.region}
                          </div>
                        )}
                      </div>
                      <div className="mb-3">
                        <label htmlFor={`zone-edit-address-${zone.zone_id}`} className="form-label small fw-semibold mb-1">Pickup address</label>
                        <input id={`zone-edit-address-${zone.zone_id}`} className={`form-control form-control-sm ${editErrors.pickupAddress ? "is-invalid" : ""}`}
                          name="pickupAddress" value={editForm.pickupAddress} onChange={handleEditChange} />
                        {editErrors.pickupAddress && (
                          <div className="invalid-feedback d-block">
                            <i className="bi bi-exclamation-circle me-1"></i>{editErrors.pickupAddress}
                          </div>
                        )}
                      </div>
                      {zoneErrors[zone.zone_id] && (
                        <div className="alert alert-danger py-1 px-2 small mb-2">{zoneErrors[zone.zone_id]}</div>
                      )}
                      <div className="d-flex flex-wrap gap-2">
                        <button className="btn btn-success btn-sm flex-grow-1"
                          onClick={() => handleSaveEdit(zone.zone_id)} disabled={editSaving}>
                          {editSaving
                            ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                            : <>Save</>
                          }
                        </button>
                        <button className="btn btn-outline-secondary btn-sm flex-grow-1"
                          onClick={cancelEdit} disabled={editSaving}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // ── Read-only view ────────────────────────────
                    <div className="d-flex align-items-start gap-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 bg-success-subtle"
                        style={{ width: 42, height: 42 }}>
                        <i className="bi bi-geo-alt-fill text-success"></i>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="fw-bold mb-1">{zone.zone_name}</div>
                          <div className="d-flex flex-wrap gap-1">
                            <button className="btn btn-outline-secondary btn-sm py-0 px-1"
                              title="Edit zone" aria-label="Edit zone" onClick={() => startEdit(zone)}>
                              <i className="bi bi-pencil" style={{ fontSize: "0.75rem" }}></i>
                            </button>
                            <button className="btn btn-outline-danger btn-sm py-0 px-1"
                              title="Delete zone" aria-label="Delete zone" onClick={() => handleDeleteZone(zone)}
                              disabled={deletingId === zone.zone_id}>
                              <i className="bi bi-trash" style={{ fontSize: "0.75rem" }}></i>
                            </button>
                          </div>
                        </div>
                        <div className="text-muted small mb-1">
                          <i className="bi bi-building me-1"></i>{zone.pickup_address}
                        </div>
                        <div className="d-flex gap-2 flex-wrap mt-2">
                          <span className="badge bg-success-subtle text-success rounded-pill"
                            style={{ fontSize: "0.72rem" }}>
                            {zone.region}
                          </span>
                          {zone.farmer_count !== undefined && (
                            <span className="badge rounded-pill badge-confirmed"
                              style={{ fontSize: "0.72rem" }}>
                              <i className="bi bi-flower2 me-1"></i>
                              {zone.farmer_count} farmer{zone.farmer_count !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        {zoneErrors[zone.zone_id] && (
                          <div className="alert alert-danger py-1 px-2 small mt-2 mb-0">{zoneErrors[zone.zone_id]}</div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </DashboardLayout>
  );
}
