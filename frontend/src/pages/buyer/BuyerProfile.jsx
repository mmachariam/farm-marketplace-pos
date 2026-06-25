// BuyerProfile — SokoMoja
// Fixed layout using Bootstrap form groups.
// Profile image upload with preview — falls back to name initial if no image set.

import { useState, useRef } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { getUser, setUser } from "../../utils/auth";

export default function BuyerProfile() {
  const navItems = [
    { label: "Browse",    icon: "bi-shop",          path: "/buyer/dashboard", active: false },
    { label: "My orders", icon: "bi-box-seam",      path: "/buyer/orders",    active: false },
    { label: "Cart",      icon: "bi-cart3",         path: "/buyer/dashboard", active: false },
    { label: "Profile",   icon: "bi-person-circle", path: "/buyer/profile",   active: true  },
  ];

  const currentUser = getUser() || { name: "", role: "buyer" };

  // ── Form state ──────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name:   currentUser.name || "",
    email:  "",
    phone:  "",
    region: "",
  });

  // ── Profile image state ─────────────────────────────────────────────
  // imagePreview = base64 data URL shown in the avatar circle.
  // null means "no image — show initial letter instead".
  const [imagePreview, setImagePreview] = useState(
    currentUser.avatarUrl || null
  );
  const fileInputRef = useRef(null);

  const [errors,     setErrors]     = useState({});
  const [saving,     setSaving]     = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // ── Handlers ────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // When user picks a file, convert to base64 and show as avatar preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, image: "Please select an image file." }));
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Full name is required";
    if (!formData.email)       errs.email = "Email address is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = "Enter a valid email address";
    if (formData.phone && !/^0[17]\d{8}$/.test(formData.phone.replace(/\s/g, "")))
      errs.phone = "Enter a valid Kenyan phone number (e.g. 0712345678)";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    if (!validate()) return;
    setSaving(true);
    try {
      // TODO: submit to PATCH /api/profile (include imagePreview as avatarUrl or upload file separately)
      await new Promise((r) => setTimeout(r, 800));
      setUser({ ...currentUser, name: formData.name, avatarUrl: imagePreview });
      setSuccessMsg("Profile updated successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setErrors({ general: err.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  // The initial letter to show when no image is uploaded
  const initial = formData.name ? formData.name.charAt(0).toUpperCase() : "?";

  return (
    <DashboardLayout title="Profile" navItems={navItems}>
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">

          {successMsg && (
            <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-4">
              <i className="bi bi-check-circle-fill"></i> {successMsg}
            </div>
          )}
          {errors.general && (
            <div className="alert alert-danger py-2 mb-4">{errors.general}</div>
          )}

          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">

              {/* ── Avatar section ─────────────────────────────────── */}
              <div className="d-flex align-items-center gap-4 mb-4 pb-4 border-bottom">

                {/* Avatar circle — image if uploaded, initial letter if not */}
                <div className="position-relative flex-shrink-0">
                  <div
                    className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center fw-bold text-white"
                    style={{
                      width: 80, height: 80,
                      background: imagePreview ? "transparent" : "#198754",
                      fontSize: "1.8rem",
                      border: "3px solid #d1e7dd",
                    }}
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      initial
                    )}
                  </div>

                  {/* Small camera button overlaid on avatar */}
                  <button
                    type="button"
                    className="btn btn-success btn-sm rounded-circle position-absolute d-flex align-items-center justify-content-center p-0 shadow"
                    style={{ width: 26, height: 26, bottom: 0, right: 0 }}
                    onClick={() => fileInputRef.current?.click()}
                    title="Change profile photo"
                  >
                    <i className="bi bi-camera-fill" style={{ fontSize: "0.65rem" }}></i>
                  </button>
                </div>

                {/* Name + role + image controls */}
                <div>
                  <h5 className="fw-bold mb-0">{formData.name || "Your name"}</h5>
                  <div className="text-muted small mb-2 text-capitalize">
                    {currentUser.role === "seller" ? "Farmer account" : "Buyer account"}
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      type="button"
                      className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <i className="bi bi-upload"></i>
                      {imagePreview ? "Change photo" : "Upload photo"}
                    </button>
                    {imagePreview && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={handleRemoveImage}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {errors.image && (
                    <div className="text-danger small mt-1">{errors.image}</div>
                  )}
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="d-none"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              {/* ── Profile form ───────────────────────────────────── */}
              <form onSubmit={handleSave} noValidate>

                <div className="mb-3">
                  <label htmlFor="bp-name" className="form-label fw-semibold small">
                    Full name
                  </label>
                  <input
                    id="bp-name"
                    name="name"
                    type="text"
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    placeholder="e.g. Jane Wambui"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="bp-email" className="form-label fw-semibold small">
                    Email address
                  </label>
                  <input
                    id="bp-email"
                    name="email"
                    type="email"
                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="bp-phone" className="form-label fw-semibold small">
                    Phone number
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-phone text-muted"></i>
                    </span>
                    <input
                      id="bp-phone"
                      name="phone"
                      type="tel"
                      className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                      placeholder="0712 345 678"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                  </div>
                  <div className="form-text">Used for M-Pesa payments and order notifications</div>
                </div>

                <div className="mb-4">
                  <label htmlFor="bp-region" className="form-label fw-semibold small">
                    Region
                  </label>
                  <select
                    id="bp-region"
                    name="region"
                    className="form-select"
                    value={formData.region}
                    onChange={handleChange}
                  >
                    <option value="">Select your region</option>
                    {["Nairobi", "Kiambu", "Nakuru", "Meru", "Eldoret", "Kisumu", "Mombasa"].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn btn-success w-100 fw-semibold py-2"
                  disabled={saving}
                >
                  {saving ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Saving…</>
                  ) : (
                    <><i className="bi bi-check-circle me-2"></i>Save changes</>
                  )}
                </button>

              </form>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
