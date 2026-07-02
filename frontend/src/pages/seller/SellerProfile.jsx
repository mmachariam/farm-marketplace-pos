// SellerProfile — SokoMoja
// Wired to real backend: GET /api/profile, PATCH /api/profile,
// POST /api/profile/avatar, DELETE /api/profile/avatar

import { useState, useRef, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Toast from "../../components/Toast";
import { apiRequest, apiUpload } from "../../utils/api";
import { getUser, setUser } from "../../utils/auth";

export default function SellerProfile() {
  const navItems = [
    { label: "Dashboard",  icon: "bi-speedometer2",   path: "/seller/dashboard",  active: false },
    { label: "Products",   icon: "bi-flower2",        path: "/seller/products",   active: false },
    { label: "Inventory",  icon: "bi-boxes",          path: "/seller/inventory",  active: false },
    { label: "Sales",      icon: "bi-receipt",        path: "/seller/sales",      active: false },
    { label: "Schedule",   icon: "bi-calendar-check", path: "/seller/schedule",   active: false },
    { label: "Orders",     icon: "bi-box-seam",       path: "/seller/orders",     active: false },
    { label: "Profile",    icon: "bi-person-circle",  path: "/seller/profile",    active: true  },
  ];

  const currentUser = getUser() || { name: "", role: "seller" };

  const [formData, setFormData] = useState({
    name:   currentUser.name  || "",
    email:  currentUser.email || "",
    phone:  "",
    region: "",
    zoneId: "",
  });

  const [zones,        setZones]        = useState([]);
  const [imagePreview, setImagePreview] = useState(currentUser.avatar_url || currentUser.avatarUrl || null);
  const [imageFile,    setImageFile]    = useState(null);
  const fileInputRef = useRef(null);

  const [errors,     setErrors]     = useState({});
  const [saving,     setSaving]     = useState(false);
  const [toast,      setToast]      = useState(null);

  // Load profile + pickup zones from backend on mount
  useEffect(() => {
    async function loadData() {
      try {
        // Load profile
        const profileData = await apiRequest("/profile");
        const u = profileData.data;
        setFormData({
          name:   u.name         || "",
          email:  u.email        || "",
          phone:  u.phone_number || "",
          region: u.region       || "",
          zoneId: u.zone_id ? String(u.zone_id) : "",
        });
        if (u.avatar_url) setImagePreview(u.avatar_url);
      } catch {
        // Fall back to cached localStorage values silently
      }

      try {
        // Load pickup zones for the dropdown
        const zonesData = await apiRequest("/pickup-zones");
        setZones(zonesData.data);
      } catch {
        // Fall back to hardcoded zones if API not ready
        setZones([
          { zone_id: 1, zone_name: "Kiambu Zone",  region: "Kiambu"  },
          { zone_id: 2, zone_name: "Nakuru Zone",  region: "Nakuru"  },
          { zone_id: 3, zone_name: "Meru Zone",    region: "Meru"    },
          { zone_id: 4, zone_name: "Nairobi CBD",  region: "Nairobi" },
          { zone_id: 5, zone_name: "Eldoret Zone", region: "Eldoret" },
          { zone_id: 6, zone_name: "Kisumu Zone",  region: "Kisumu"  },
        ]);
      }
    }
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((p) => ({ ...p, image: "Please select an image file." }));
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
    setErrors((p) => ({ ...p, image: "" }));
  };

  const handleRemoveImage = async () => {
    try { await apiRequest("/profile/avatar", "DELETE"); } catch { /* ignore */ }
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name  = "Full name is required";
    if (!formData.email)       errs.email = "Email address is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = "Enter a valid email address";
    if (formData.phone && !/^0[17]\d{8}$/.test(formData.phone.replace(/\s/g, "")))
      errs.phone = "Enter a valid Kenyan phone number (e.g. 0712345678)";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    try {
      // 1. Update text fields
      const data = await apiRequest("/profile", "PATCH", {
        name:         formData.name,
        email:        formData.email,
        phone_number: formData.phone  || null,
        region:       formData.region || null,
        zone_id:      formData.zoneId || null,
      });

      // 2. Upload new avatar if a file was selected
      if (imageFile) {
        const form = new FormData();
        form.append("avatar", imageFile);
        const avatarData = await apiUpload("/profile/avatar", form);
        data.data.avatar_url = avatarData.avatar_url;
      }

      // Update localStorage so topbar reflects changes immediately
      setUser({
        ...currentUser,
        name:      data.data.name,
        email:     data.data.email,
        avatarUrl: data.data.avatar_url || imagePreview,
      });

      setImageFile(null);
      setToast({ message: "Profile updated successfully.", type: "success" });

    } catch (err) {
      if (err.errors) {
        const mapped = {};
        if (err.errors.name)         mapped.name   = err.errors.name[0];
        if (err.errors.email)        mapped.email  = err.errors.email[0];
        if (err.errors.phone_number) mapped.phone  = err.errors.phone_number[0];
        if (err.errors.zone_id)      mapped.zoneId = err.errors.zone_id[0];
        setErrors(mapped);
      } else {
        setToast({ message: err.message || "Failed to update profile.", type: "error" });
      }
    } finally {
      setSaving(false);
    }
  };

  const initial        = formData.name ? formData.name.charAt(0).toUpperCase() : "?";
  const filteredZones  = zones.filter((z) => !formData.region || z.region === formData.region);

  return (
    <DashboardLayout title="Profile" navItems={navItems}>
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-7">

          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">

              {/* Avatar section */}
              <div className="d-flex align-items-center gap-4 mb-4 pb-4 border-bottom">
                <div className="position-relative flex-shrink-0">
                  <div className="sm-avatar-lg">
                    {imagePreview
                      ? <img src={imagePreview} alt={formData.name || "Profile"} />
                      : initial}
                  </div>
                  <button type="button"
                    className="sm-avatar-camera shadow-sm border-0"
                    onClick={() => fileInputRef.current?.click()}
                    title="Change profile photo"
                    aria-label="Change profile photo">
                    <i className="bi bi-camera-fill"></i>
                  </button>
                </div>

                <div>
                  <h5 className="fw-bold mb-0">{formData.name || "Your name"}</h5>
                  <div className="text-muted small mb-2">Farmer account</div>
                  <div className="d-flex gap-2 flex-wrap">
                    <button type="button"
                      className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
                      onClick={() => fileInputRef.current?.click()}>
                      <i className="bi bi-upload"></i>
                      {imagePreview ? "Change photo" : "Upload photo"}
                    </button>
                    {imagePreview && (
                      <button type="button" className="btn btn-outline-danger btn-sm"
                        onClick={handleRemoveImage}>Remove</button>
                    )}
                  </div>
                  {errors.image && <div className="text-danger small mt-1">{errors.image}</div>}
                  <input ref={fileInputRef} type="file" accept="image/*"
                    className="d-none" onChange={handleImageChange} />
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSave} noValidate>

                <div className="mb-3">
                  <label htmlFor="sp-name" className="form-label fw-semibold small">
                    Full name <span className="text-danger">*</span>
                  </label>
                  <input id="sp-name" name="name" type="text"
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    placeholder="e.g. John Kamau"
                    value={formData.name} onChange={handleChange} />
                  {errors.name && (
                    <div className="invalid-feedback d-block">
                      <i className="bi bi-exclamation-circle me-1"></i>{errors.name}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="sp-email" className="form-label fw-semibold small">
                    Email address <span className="text-danger">*</span>
                  </label>
                  <input id="sp-email" name="email" type="email"
                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    placeholder="you@example.com"
                    value={formData.email} onChange={handleChange} />
                  {errors.email && (
                    <div className="invalid-feedback d-block">
                      <i className="bi bi-exclamation-circle me-1"></i>{errors.email}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="sp-phone" className="form-label fw-semibold small">Phone number</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-phone text-muted"></i>
                    </span>
                    <input id="sp-phone" name="phone" type="tel"
                      className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                      placeholder="0712 345 678"
                      value={formData.phone} onChange={handleChange} />
                    {errors.phone && (
                      <div className="invalid-feedback d-block">
                        <i className="bi bi-exclamation-circle me-1"></i>{errors.phone}
                      </div>
                    )}
                  </div>
                  <div className="form-text text-muted">Used for M-Pesa payments and order notifications</div>
                </div>

                <div className="mb-3">
                  <label htmlFor="sp-region" className="form-label fw-semibold small">Region</label>
                  <select id="sp-region" name="region" className="form-select"
                    value={formData.region} onChange={handleChange}>
                    <option value="">Select your region</option>
                    {["Kiambu","Nakuru","Meru","Nairobi","Eldoret","Kisumu"].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="sp-zone" className="form-label fw-semibold small">
                    Collection zone
                  </label>
                  <select id="sp-zone" name="zoneId" className="form-select"
                    value={formData.zoneId} onChange={handleChange}>
                    <option value="">Select your collection zone</option>
                    {filteredZones.map((z) => (
                      <option key={z.zone_id} value={String(z.zone_id)}>
                        {z.zone_name}
                      </option>
                    ))}
                  </select>
                  <div className="form-text text-muted">Where buyers in your area collect their orders</div>
                  {errors.zoneId && (
                    <div className="text-danger small mt-1">
                      <i className="bi bi-exclamation-circle me-1"></i>{errors.zoneId}
                    </div>
                  )}
                </div>

                <button type="submit" className="btn btn-success w-100 fw-semibold py-2"
                  disabled={saving}>
                  {saving
                    ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                    : <><i className="bi bi-check-circle me-2"></i>Save changes</>}
                </button>

              </form>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
