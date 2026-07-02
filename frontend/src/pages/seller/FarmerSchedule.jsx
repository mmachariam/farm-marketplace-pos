// FarmerSchedule — SokoMoja
// Farmer sets and manages their collection schedule.
// GET    /api/seller/schedule
// POST   /api/seller/schedule
// DELETE /api/seller/schedule/{id}

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

  const [showForm, setShowForm]     = useState(false);
  const [formData, setFormData]     = useState({ day: "Monday", arrival_time: "08:00", notes: "" });
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

  useEffect(() => {
    fetchSchedule();
  }, []);

  async function fetchSchedule() {
    try {
      setLoading(true);
      setError("");
      const res = await apiRequest("/seller/schedule");
      setSchedules(res.data ?? []);
    } catch (err) {
      setError(err.message || "Failed to load schedule.");
    } finally {
      setLoading(false);
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiRequest("/seller/schedule", "POST", {
        day:          formData.day,
        arrival_time: formData.arrival_time,
        notes:        formData.notes || null,
      });
      setSchedules((prev) =>
        [...prev, res.data].sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day))
      );
      setToast({ message: "Schedule entry added.", type: "success" });
      setFormData({ day: "Monday", arrival_time: "08:00", notes: "" });
      setShowForm(false);
    } catch (err) {
      setToast({ message: "Failed to add: " + err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this schedule entry?")) return;
    setDeletingId(id);
    try {
      await apiRequest(`/seller/schedule/${id}`, "DELETE");
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      setToast({ message: "Schedule entry removed.", type: "success" });
    } catch (err) {
      setToast({ message: "Failed to remove: " + err.message, type: "error" });
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

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Add button */}
      <div className="mb-3">
        <button
          className="btn btn-success btn-sm"
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
                <label htmlFor="schedule-day" className="form-label fw-semibold small">
                  Day <span className="text-danger">*</span>
                </label>
                <select
                  id="schedule-day"
                  className="form-select"
                  value={formData.day}
                  onChange={(e) => setFormData((p) => ({ ...p, day: e.target.value }))}
                >
                  {days.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="col-12 col-md-3">
                <label htmlFor="schedule-time" className="form-label fw-semibold small">
                  Arrival time <span className="text-danger">*</span>
                </label>
                <input
                  id="schedule-time"
                  type="time"
                  className="form-control"
                  value={formData.arrival_time}
                  onChange={(e) => setFormData((p) => ({ ...p, arrival_time: e.target.value }))}
                />
              </div>
              <div className="col-12 col-md-6">
                <label htmlFor="schedule-notes" className="form-label fw-semibold small">Notes (optional)</label>
                <input
                  id="schedule-notes"
                  className="form-control"
                  placeholder="e.g. Tomatoes and broccoli available"
                  value={formData.notes}
                  onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-success btn-sm mt-3"
              disabled={saving}
            >
              {saving
                ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                : <>Save entry</>
              }
            </button>
          </form>
        </div>
      )}

      {loading && <PageLoader text="Loading your schedule..." />}
      {error   && <div className="alert alert-danger">{error}</div>}

      {/* Schedule entries */}
      {!loading && !error && (
        schedules.length === 0 ? (
          <EmptyState
            icon="bi-calendar-x"
            title="No schedule set"
            text="Add your first collection schedule so buyers know when your produce will be ready."
            btnLabel="Add schedule entry"
            btnAction={() => setShowForm(true)}
          />
        ) : (
          <div className="row g-3">
            {schedules.map((entry) => (
              <div className="col-12 col-md-6 col-lg-4" key={entry.id}>
                <div className="sm-card p-3 h-100">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div className="fw-bold" style={{ fontSize: "0.95rem" }}>{entry.day}</div>
                      <div className="text-muted small">
                        <i className="bi bi-clock me-1"></i>{entry.arrival_time}
                      </div>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-danger py-0 px-2"
                      aria-label="Delete schedule entry"
                      onClick={() => handleDelete(entry.id)}
                      disabled={deletingId === entry.id}
                    >
                      {deletingId === entry.id
                        ? <span className="spinner-border spinner-border-sm" role="status"><span className="visually-hidden">Deleting...</span></span>
                        : <i className="bi bi-trash"></i>}
                    </button>
                  </div>
                  {entry.zone && (
                    <div className="text-muted small mb-2">
                      <i className="bi bi-geo-alt me-1" style={{ color: "var(--sm-green)" }}></i>
                      {entry.zone.zone_name}
                    </div>
                  )}
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
