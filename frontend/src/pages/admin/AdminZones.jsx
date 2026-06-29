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
import DashboardLayout from "../../components/DashboardLayout";
import { apiRequest } from "../../utils/api";

export default function AdminZones() {
  const navItems = [
    { label: "Overview",  icon: "bi-grid-1x2",          path: "/admin/overview",  active: false },
    { label: "Users",     icon: "bi-people",            path: "/admin/users",     active: false },
    { label: "Zones",     icon: "bi-geo-alt",           path: "/admin/zones",     active: true  },
    { label: "Analytics", icon: "bi-bar-chart-line",    path: "/admin/analytics", active: false },
    { label: "Reports",   icon: "bi-file-earmark-text", path: "/admin/reports",   active: false },
  ];

  const [zones,      setZones]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [showForm,   setShowForm]   = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [formData,   setFormData]   = useState({
    zoneName:      "",
    region:        "",
    pickupAddress: "",
  });
  const [formErrors, setFormErrors] = useState({});

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
      setSuccessMsg("Pickup zone added successfully.");
      setTimeout(() => setSuccessMsg(""), 3500);

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

  return (
    <DashboardLayout title="Pickup zones" navItems={navItems}>

      {successMsg && (
        <div className="alert alert-success d-flex align-items-center gap-2 py-2 small mb-3">
          <i className="bi bi-check-circle-fill"></i> {successMsg}
        </div>
      )}

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
                  <label className="form-label fw-semibold small">Zone name</label>
                  <input className={`form-control ${formErrors.zoneName ? "is-invalid" : ""}`}
                    name="zoneName" placeholder="e.g. Eldoret Zone"
                    value={formData.zoneName} onChange={handleChange} />
                  {formErrors.zoneName && <div className="invalid-feedback">{formErrors.zoneName}</div>}
                </div>

                <div className="col-12 col-md-3">
                  <label className="form-label fw-semibold small">Region</label>
                  <select className={`form-select ${formErrors.region ? "is-invalid" : ""}`}
                    name="region" value={formData.region} onChange={handleChange}>
                    <option value="">Select region</option>
                    {["Kiambu","Nakuru","Meru","Nairobi","Eldoret","Kisumu","Mombasa","Kakamega"].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  {formErrors.region && <div className="invalid-feedback">{formErrors.region}</div>}
                </div>

                <div className="col-12 col-md-5">
                  <label className="form-label fw-semibold small">Pickup address</label>
                  <input className={`form-control ${formErrors.pickupAddress ? "is-invalid" : ""}`}
                    name="pickupAddress" placeholder="e.g. Eldoret Town Market, Gate 1"
                    value={formData.pickupAddress} onChange={handleChange} />
                  {formErrors.pickupAddress && <div className="invalid-feedback">{formErrors.pickupAddress}</div>}
                </div>
              </div>

              <button type="submit" className="btn btn-success btn-sm mt-3 px-4"
                disabled={saving}>
                {saving
                  ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving…</>
                  : "Save zone"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Zones list */}
      {loading && (
        <div className="text-center py-5">
          <span className="spinner-border text-success"></span>
          <div className="text-muted small mt-2">Loading zones…</div>
        </div>
      )}

      {!loading && zones.length === 0 && !error && (
        <div className="text-center text-muted py-5">
          No pickup zones yet. Add the first one above.
        </div>
      )}

      {!loading && zones.length > 0 && (
        <div className="row g-3">
          {zones.map((zone) => (
            <div className="col-12 col-md-6 col-lg-4" key={zone.zone_id}>
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-start gap-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 42, height: 42, background: "#d1e7dd" }}>
                      <i className="bi bi-geo-alt-fill text-success"></i>
                    </div>
                    <div>
                      <div className="fw-bold mb-1">{zone.zone_name}</div>
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </DashboardLayout>
  );
}
