// FarmerSchedule — SokoMoja
// Farmer sets and manages their collection schedule —
// which days/times they will have produce ready at the zone pickup point.
// Maps to: a schedules table (new — to be added to the backend schema)
// GET  /api/seller/schedule
// POST /api/seller/schedule
// DELETE /api/seller/schedule/{id}

import { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";

function FarmerSchedule() {
  const navItems = [
    { label: "Dashboard",  icon: "bi-speedometer2",   path: "/seller/dashboard",  active: false },
    { label: "Products",   icon: "bi-flower2",        path: "/seller/products",   active: false },
    { label: "Inventory",  icon: "bi-boxes",          path: "/seller/inventory",  active: false },
    { label: "Sales",      icon: "bi-receipt",        path: "/seller/sales",      active: false },
    { label: "Schedule",   icon: "bi-calendar-check", path: "/seller/schedule",   active: true  },
    { label: "Orders",     icon: "bi-box-seam",       path: "/seller/orders",     active: false },
    { label: "Profile",    icon: "bi-person-circle",  path: "/seller/profile",    active: false },
  ];

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  // New schedule form
  const [showForm, setShowForm]   = useState(false);
  const [formData, setFormData]   = useState({ day: "Monday", time: "08:00", notes: "" });
  const [saving, setSaving]       = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

  useEffect(() => {
    async function fetchSchedule() {
      try {
        setLoading(true);
        // TODO: const data = await apiRequest("/seller/schedule");
        await new Promise((r) => setTimeout(r, 400));
        setSchedules([
          { id: 1, day: "Tuesday",   time: "07:00", notes: "Fresh broccoli and kale available", zone: "Kiambu Zone" },
          { id: 2, day: "Friday",    time: "07:30", notes: "Avocados and tomatoes",              zone: "Kiambu Zone" },
          { id: 3, day: "Saturday",  time: "06:30", notes: "All produce — largest batch",        zone: "Kiambu Zone" },
        ]);
      } catch (err) {
        setError(err.message || "Failed to load schedule.");
      } finally {
        setLoading(false);
      }
    }
    fetchSchedule();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // TODO: await apiRequest("/seller/schedule", "POST", formData);
      await new Promise((r) => setTimeout(r, 700));
      const newEntry = {
        id: Date.now(),
        day: formData.day,
        time: formData.time,
        notes: formData.notes,
        zone: "Kiambu Zone", // would come from the user's saved zone
      };
      setSchedules((prev) => [...prev, newEntry].sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day)));
      setSuccessMsg("✅ Schedule entry added.");
      setFormData({ day: "Monday", time: "08:00", notes: "" });
      setShowForm(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert("Failed to add: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this schedule entry?")) return;
    setDeletingId(id);
    try {
      // TODO: await apiRequest(`/seller/schedule/${id}`, "DELETE");
      await new Promise((r) => setTimeout(r, 500));
      setSchedules((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert("Failed to remove: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout title="Collection schedule" navItems={navItems}>

      {/* Info callout */}
      <div className="alert d-flex gap-2 mb-4" style={{ background: "var(--sm-green-light)", border: "1px solid var(--sm-green-border)", color: "#27500A" }}>
        <i className="bi bi-info-circle-fill mt-1 flex-shrink-0"></i>
        <div style={{ fontSize: "0.875rem" }}>
          Your schedule tells buyers when your produce will be at the collection zone.
          Buyers see these days when browsing your listings.
        </div>
      </div>

      {successMsg && <div className="alert alert-success py-2 small mb-3">{successMsg}</div>}

      {/* Add button */}
      <div className="mb-3">
        <button
          className="btn btn-sm"
          style={{ background: "var(--sm-green)", color: "#fff", border: "none" }}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : <><i className="bi bi-plus me-1"></i>Add schedule entry</>}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="sm-card p-4 mb-4">
          <form onSubmit={handleAdd}>
            <div className="row g-3">
              <div className="col-12 col-md-3">
                <label className="form-label fw-semibold small">Day</label>
                <select className="form-select" value={formData.day} onChange={(e) => setFormData((p) => ({ ...p, day: e.target.value }))}>
                  {days.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label fw-semibold small">Arrival time</label>
                <input type="time" className="form-control" value={formData.time} onChange={(e) => setFormData((p) => ({ ...p, time: e.target.value }))} />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold small">Notes (optional)</label>
                <input className="form-control" placeholder="e.g. Tomatoes and broccoli available" value={formData.notes} onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-sm mt-3"
              style={{ background: "var(--sm-green)", color: "#fff", border: "none" }}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save entry"}
            </button>
          </form>
        </div>
      )}

      {loading && <div className="text-center text-muted py-5">Loading schedule…</div>}
      {error   && <div className="alert alert-danger">{error}</div>}

      {/* Schedule entries */}
      {!loading && !error && (
        schedules.length === 0 ? (
          <div className="text-center text-muted py-5">
            No schedule set yet. Add your first entry to let buyers know when to collect.
          </div>
        ) : (
          <div className="row g-3">
            {schedules.map((entry) => (
              <div className="col-12 col-md-6 col-lg-4" key={entry.id}>
                <div className="sm-card p-3 h-100">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div className="fw-bold" style={{ fontSize: "0.95rem" }}>{entry.day}</div>
                      <div className="text-muted small">
                        <i className="bi bi-clock me-1"></i>{entry.time}
                      </div>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-danger py-0 px-2"
                      onClick={() => handleDelete(entry.id)}
                      disabled={deletingId === entry.id}
                    >
                      {deletingId === entry.id ? "…" : <i className="bi bi-trash"></i>}
                    </button>
                  </div>
                  <div className="text-muted small mb-2">
                    <i className="bi bi-geo-alt me-1" style={{ color: "var(--sm-green)" }}></i>
                    {entry.zone}
                  </div>
                  {entry.notes && (
                    <div className="p-2 rounded" style={{ background: "var(--sm-green-light)", fontSize: "0.78rem", color: "#3B6D11" }}>
                      {entry.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

    </DashboardLayout>
  );
}

export default FarmerSchedule;
