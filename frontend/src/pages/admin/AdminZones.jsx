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

function AdminZones() {
  const navItems = [
    { label: "Overview",  icon: "bi-grid-1x2",          path: "/admin/overview",  active: false },
    { label: "Users",     icon: "bi-people",            path: "/admin/users",     active: false },
    { label: "Zones",     icon: "bi-geo-alt",           path: "/admin/zones",     active: true  },
    { label: "Reports",   icon: "bi-file-earmark-text", path: "/admin/reports",   active: false },
  ];

  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---- ADD ZONE FORM STATE ----
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ zoneName: "", region: "", pickupAddress: "" });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchZones() {
      try {
        setLoading(true);
        setError("");

        // TODO: replace with real API call
        // const data = await apiRequest("/admin/zones");
        // setZones(data);

        // TEMPORARY sample data
        await new Promise((res) => setTimeout(res, 500));
        setZones([
          { zone_id: 1, zone_name: "Kiambu Zone", region: "Kiambu", pickup_address: "Kiambu Town Market, Gate 3", farmer_count: 34, active_orders: 12 },
          { zone_id: 2, zone_name: "Nakuru Zone", region: "Nakuru", pickup_address: "Nakuru Central Market",     farmer_count: 21, active_orders: 8  },
          { zone_id: 3, zone_name: "Meru Zone",   region: "Meru",   pickup_address: "Meru Town Bus Stage",       farmer_count: 18, active_orders: 5  },
        ]);

      } catch (err) {
        setError(err.message || "Failed to load pickup zones.");
      } finally {
        setLoading(false);
      }
    }

    fetchZones();
  }, []);

  // ---- FORM HANDLERS ----
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.zoneName.trim()) errs.zoneName = "Zone name is required";
    if (!formData.region.trim()) errs.region = "Region is required";
    if (!formData.pickupAddress.trim()) errs.pickupAddress = "Pickup address is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddZone = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);

    try {
      // TODO: replace with real API call
      // const newZone = await apiRequest("/admin/zones", "POST", {
      //   zone_name: formData.zoneName,
      //   region: formData.region,
      //   pickup_address: formData.pickupAddress,
      // });
      // setZones((prev) => [...prev, newZone]);

      // TEMPORARY: simulate adding locally
      await new Promise((res) => setTimeout(res, 600));
      const newZone = {
        zone_id: Date.now(), // temporary unique id
        zone_name: formData.zoneName,
        region: formData.region,
        pickup_address: formData.pickupAddress,
        farmer_count: 0,
        active_orders: 0,
      };
      setZones((prev) => [...prev, newZone]);

      // Reset form
      setFormData({ zoneName: "", region: "", pickupAddress: "" });
      setShowForm(false);

    } catch (err) {
      alert(`Failed to add zone: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Pickup zones" navItems={navItems}>

      {/* ---- ADD ZONE BUTTON / FORM TOGGLE ---- */}
      <div style={{ marginBottom: "16px" }}>
        <button
          className="dash-btn-add"
          style={{ background: showForm ? "#fff" : "#1D9E75", color: showForm ? "#73726c" : "#fff", border: showForm ? "1px solid #e0ded5" : "none", width: "auto", padding: "10px 20px" }}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Add zone"}
        </button>
      </div>

      {/* ---- ADD ZONE FORM ---- */}
      {showForm && (
        <form onSubmit={handleAddZone} className="dash-table-wrap" style={{ padding: "20px", marginBottom: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", alignItems: "start" }}>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="zoneName">Zone name</label>
              <input
                id="zoneName"
                name="zoneName"
                type="text"
                placeholder="e.g. Eldoret Zone"
                value={formData.zoneName}
                onChange={handleChange}
                className={formErrors.zoneName ? "input-error" : ""}
              />
              {formErrors.zoneName && <span className="field-error">{formErrors.zoneName}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="region">Region</label>
              <input
                id="region"
                name="region"
                type="text"
                placeholder="e.g. Uasin Gishu"
                value={formData.region}
                onChange={handleChange}
                className={formErrors.region ? "input-error" : ""}
              />
              {formErrors.region && <span className="field-error">{formErrors.region}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="pickupAddress">Pickup address</label>
              <input
                id="pickupAddress"
                name="pickupAddress"
                type="text"
                placeholder="e.g. Eldoret Town Market"
                value={formData.pickupAddress}
                onChange={handleChange}
                className={formErrors.pickupAddress ? "input-error" : ""}
              />
              {formErrors.pickupAddress && <span className="field-error">{formErrors.pickupAddress}</span>}
            </div>

          </div>

          <button type="submit" className="btn-auth" style={{ marginTop: "14px", maxWidth: "180px" }} disabled={saving}>
            {saving ? "Saving…" : "Save zone"}
          </button>
        </form>
      )}

      {loading && <div className="dash-loading">Loading zones…</div>}
      {error && <div className="dash-error">⚠️ {error}</div>}

      {/* ---- ZONES LIST ---- */}
      {!loading && !error && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {zones.map((zone) => (
            <div className="dash-table-wrap" key={zone.zone_id} style={{ padding: "16px 20px" }}>
              <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>
                📍 {zone.zone_name}
              </div>
              <div style={{ fontSize: "12px", color: "#73726c" }}>
                Pickup: {zone.pickup_address} · {zone.farmer_count} farmers · {zone.active_orders} active orders
              </div>
            </div>
          ))}
        </div>
      )}

    </DashboardLayout>
  );
}

export default AdminZones;
