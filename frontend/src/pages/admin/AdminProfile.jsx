// AdminProfile — SokoMoja
// Wired to real backend:
// GET    /api/admin/profile
// PATCH  /api/admin/profile
// POST   /api/admin/profile/avatar
// POST   /api/admin/profile/password

import { useState, useRef, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Toast from "../../components/Toast";
import { apiRequest, apiUpload } from "../../utils/api";
import { getUser, setUser } from "../../utils/auth";

export default function AdminProfile() {
  const navItems = [
    { label: "Overview",  icon: "bi-grid-1x2",          path: "/admin/overview",  active: false },
    { label: "Users",     icon: "bi-people",            path: "/admin/users",     active: false },
    { label: "Zones",     icon: "bi-geo-alt",           path: "/admin/zones",     active: false },
    { label: "Reports",   icon: "bi-file-earmark-text", path: "/admin/reports",   active: false },
    { label: "Profile",   icon: "bi-person-circle",     path: "/admin/profile",   active: true  },
  ];

  const currentUser = getUser() || { name: "", role: "admin" };

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [account, setAccount] = useState(null);

  const [formData, setFormData] = useState({
    name:  currentUser.name  || "",
    email: currentUser.email || "",
    phone: "",
  });

  const [imagePreview, setImagePreview] = useState(currentUser.avatar_url || currentUser.avatarUrl || null);
  const [imageFile,    setImageFile]    = useState(null);
  const fileInputRef = useRef(null);

  const [errors,     setErrors]     = useState({});
  const [saving,     setSaving]     = useState(false);
  const [toast,      setToast]      = useState(null);

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [passwordErrors,  setPasswordErrors]  = useState({});
  const [passwordSaving,  setPasswordSaving]  = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword,     setShowNewPassword]     = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load full profile from backend on mount
  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setLoadError("");
      try {
        const data = await apiRequest("/admin/profile");
        const u = data.data;
        setAccount(u);
        setFormData({
          name:  u.name          || "",
          email: u.email         || "",
          phone: u.phone_number  || "",
        });
        if (u.avatar_url) setImagePreview(u.avatar_url);
      } catch (err) {
        setLoadError(err.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
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
      const data = await apiRequest("/admin/profile", "PATCH", {
        name:         formData.name,
        email:        formData.email,
        phone_number: formData.phone || null,
      });

      let avatarUrl = data.data.avatar_url;
      if (imageFile) {
        const form = new FormData();
        form.append("avatar", imageFile);
        const avatarData = await apiUpload("/admin/profile/avatar", form);
        avatarUrl = avatarData.avatar_url;
      }

      setAccount((prev) => ({ ...prev, ...data.data, avatar_url: avatarUrl }));

      setUser({
        ...currentUser,
        name:      data.data.name,
        email:     data.data.email,
        avatarUrl: avatarUrl || imagePreview,
      });

      setImageFile(null);
      setToast({ message: "Profile updated successfully.", type: "success" });

    } catch (err) {
      if (err.errors) {
        const mapped = {};
        if (err.errors.name)         mapped.name  = err.errors.name[0];
        if (err.errors.email)        mapped.email = err.errors.email[0];
        if (err.errors.phone_number) mapped.phone = err.errors.phone_number[0];
        setErrors(mapped);
      } else {
        setToast({ message: err.message || "Failed to update profile.", type: "error" });
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((p) => ({ ...p, [name]: value }));
    if (passwordErrors[name]) setPasswordErrors((p) => ({ ...p, [name]: "" }));
  };

  const validatePassword = () => {
    const errs = {};
    if (!passwordData.current_password) errs.current_password = "Current password is required";
    if (!passwordData.new_password) errs.new_password = "New password is required";
    else if (passwordData.new_password.length < 8) errs.new_password = "New password must be at least 8 characters";
    if (passwordData.new_password !== passwordData.new_password_confirmation)
      errs.new_password_confirmation = "Passwords do not match";
    setPasswordErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setPasswordSaving(true);
    try {
      await apiRequest("/admin/profile/password", "POST", passwordData);
      setPasswordData({ current_password: "", new_password: "", new_password_confirmation: "" });
      setToast({ message: "Password updated successfully.", type: "success" });
    } catch (err) {
      if (err.errors) {
        const mapped = {};
        if (err.errors.current_password) mapped.current_password = err.errors.current_password[0];
        if (err.errors.new_password)     mapped.new_password     = err.errors.new_password[0];
        setPasswordErrors(mapped);
      } else {
        setToast({ message: err.message || "Failed to update password.", type: "error" });
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  const initial = formData.name ? formData.name.charAt(0).toUpperCase() : "?";

  if (loading) {
    return (
      <DashboardLayout title="Profile" navItems={navItems}>
        <div className="text-center py-5">
          <span className="spinner-border text-success"></span>
          <div className="text-muted small mt-2">Loading profile…</div>
        </div>
      </DashboardLayout>
    );
  }

  if (loadError) {
    return (
      <DashboardLayout title="Profile" navItems={navItems}>
        <div className="alert alert-danger">{loadError}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Profile" navItems={navItems}>
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">

          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

          {/* Avatar + profile form */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">

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
                  <div className="text-muted small mb-2">Administrator account</div>
                  <div className="d-flex gap-2 flex-wrap">
                    <button type="button"
                      className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
                      onClick={() => fileInputRef.current?.click()}>
                      <i className="bi bi-upload"></i>
                      {imagePreview ? "Change photo" : "Upload photo"}
                    </button>
                  </div>
                  {errors.image && <div className="text-danger small mt-1">{errors.image}</div>}
                  <input ref={fileInputRef} type="file" accept="image/*"
                    className="d-none" onChange={handleImageChange} />
                </div>
              </div>

              <form onSubmit={handleSave} noValidate>
                <div className="mb-3">
                  <label htmlFor="ap-name" className="form-label fw-semibold small">
                    Full name <span className="text-danger">*</span>
                  </label>
                  <input id="ap-name" name="name" type="text"
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    placeholder="e.g. Jane Wambui"
                    value={formData.name} onChange={handleChange} />
                  {errors.name && (
                    <div className="invalid-feedback d-block">
                      <i className="bi bi-exclamation-circle me-1"></i>{errors.name}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="ap-email" className="form-label fw-semibold small">
                    Email address <span className="text-danger">*</span>
                  </label>
                  <input id="ap-email" name="email" type="email"
                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    placeholder="you@example.com"
                    value={formData.email} onChange={handleChange} />
                  {errors.email && (
                    <div className="invalid-feedback d-block">
                      <i className="bi bi-exclamation-circle me-1"></i>{errors.email}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="ap-phone" className="form-label fw-semibold small">Phone number</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="bi bi-phone text-muted"></i></span>
                    <input id="ap-phone" name="phone" type="tel"
                      className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                      placeholder="0712 345 678"
                      value={formData.phone} onChange={handleChange} />
                    {errors.phone && (
                      <div className="invalid-feedback d-block">
                        <i className="bi bi-exclamation-circle me-1"></i>{errors.phone}
                      </div>
                    )}
                  </div>
                </div>

                <button type="submit" className="btn btn-success w-100 fw-semibold py-2" disabled={saving}>
                  {saving
                    ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                    : <><i className="bi bi-check-circle me-2"></i>Save changes</>}
                </button>
              </form>

            </div>
          </div>

          {/* Password form */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3">Change password</h6>

              <form onSubmit={handlePasswordSave} noValidate>
                <div className="mb-3">
                  <label htmlFor="ap-current-password" className="form-label fw-semibold small">
                    Current password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <input id="ap-current-password" name="current_password" type={showCurrentPassword ? "text" : "password"}
                      className={`form-control ${passwordErrors.current_password ? "is-invalid" : ""}`}
                      value={passwordData.current_password} onChange={handlePasswordChange} />
                    <button type="button" className="btn btn-outline-secondary" aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                      <i className={`bi bi-${showCurrentPassword ? "eye-slash" : "eye"}`}></i>
                    </button>
                    {passwordErrors.current_password && (
                      <div className="invalid-feedback d-block">
                        <i className="bi bi-exclamation-circle me-1"></i>{passwordErrors.current_password}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="ap-new-password" className="form-label fw-semibold small">
                    New password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <input id="ap-new-password" name="new_password" type={showNewPassword ? "text" : "password"}
                      className={`form-control ${passwordErrors.new_password ? "is-invalid" : ""}`}
                      value={passwordData.new_password} onChange={handlePasswordChange} />
                    <button type="button" className="btn btn-outline-secondary" aria-label={showNewPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowNewPassword(!showNewPassword)}>
                      <i className={`bi bi-${showNewPassword ? "eye-slash" : "eye"}`}></i>
                    </button>
                    {passwordErrors.new_password && (
                      <div className="invalid-feedback d-block">
                        <i className="bi bi-exclamation-circle me-1"></i>{passwordErrors.new_password}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="ap-confirm-password" className="form-label fw-semibold small">
                    Confirm new password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <input id="ap-confirm-password" name="new_password_confirmation" type={showConfirmPassword ? "text" : "password"}
                      className={`form-control ${passwordErrors.new_password_confirmation ? "is-invalid" : ""}`}
                      value={passwordData.new_password_confirmation} onChange={handlePasswordChange} />
                    <button type="button" className="btn btn-outline-secondary" aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <i className={`bi bi-${showConfirmPassword ? "eye-slash" : "eye"}`}></i>
                    </button>
                    {passwordErrors.new_password_confirmation && (
                      <div className="invalid-feedback d-block">
                        <i className="bi bi-exclamation-circle me-1"></i>{passwordErrors.new_password_confirmation}
                      </div>
                    )}
                  </div>
                </div>

                <button type="submit" className="btn btn-outline-success w-100 fw-semibold py-2" disabled={passwordSaving}>
                  {passwordSaving
                    ? <><span className="spinner-border spinner-border-sm me-2"></span>Updating...</>
                    : <><i className="bi bi-shield-lock me-2"></i>Update password</>}
                </button>
              </form>
            </div>
          </div>

          {/* Read-only account information */}
          {account && (
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3">Account information</h6>
                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted small">Status</span>
                  <span className={`badge rounded-pill ${account.status === "active" ? "badge-delivered" : "badge-cancelled"}`}>
                    {account.status === "active" ? "Active" : "Suspended"}
                  </span>
                </div>
                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted small">Account created</span>
                  <span className="small">{account.created_at ? new Date(account.created_at).toLocaleDateString() : "—"}</span>
                </div>
                <div className="d-flex justify-content-between py-2">
                  <span className="text-muted small">Last login</span>
                  <span className="small">{account.last_login_at ? new Date(account.last_login_at).toLocaleString() : "—"}</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}
