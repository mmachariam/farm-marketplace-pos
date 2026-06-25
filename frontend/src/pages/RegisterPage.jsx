// RegisterPage — SokoMoja
// Two roles only: buyer and seller (farmer).
// Grocery Shop role is REMOVED entirely.
// Uses Bootstrap 5 form components.

import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { setToken, setUser } from "../utils/auth";

function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedRole = searchParams.get("role") || "";

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: preselectedRole,
    region: "",
    zoneId: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [errors, setErrors]             = useState({});

  // Pickup zones — later from GET /api/pickup-zones
  const pickupZones = [
    { zone_id: 1, zone_name: "Kiambu Zone",  region: "Kiambu"  },
    { zone_id: 2, zone_name: "Nakuru Zone",  region: "Nakuru"  },
    { zone_id: 3, zone_name: "Meru Zone",    region: "Meru"    },
    { zone_id: 4, zone_name: "Nairobi CBD",  region: "Nairobi" },
    { zone_id: 5, zone_name: "Eldoret Zone", region: "Eldoret" },
    { zone_id: 6, zone_name: "Kisumu Zone",  region: "Kisumu"  },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateStep1 = () => {
    const errs = {};
    if (!formData.name.trim())     errs.name = "Full name is required";
    if (!formData.email)           errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = "Enter a valid email";
    if (!formData.password)        errs.password = "Password is required";
    else if (formData.password.length < 8) errs.password = "At least 8 characters";
    if (!formData.confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) errs.confirmPassword = "Passwords do not match";
    if (!formData.role)            errs.role = "Please select your account type";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!formData.phone.trim()) errs.phone = "Phone number is required";
    else if (!/^0[17]\d{8}$/.test(formData.phone)) errs.phone = "Enter a valid Kenyan phone (e.g. 0712345678)";
    if (formData.role === "seller") {
      if (!formData.region) errs.region = "Please select your region";
      if (!formData.zoneId) errs.zoneId  = "Please select your collection zone";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => { if (validateStep1()) setStep(2); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    if (!validateStep2()) return;
    setLoading(true);
    try {
      // TODO: real API call once backend ready
      // const res = await apiRequest("/auth/register", "POST", { ... });
      await new Promise((r) => setTimeout(r, 1200));
      setToken("fake-jwt-token");
      setUser({ name: formData.name, role: formData.role });
      navigate(formData.role === "seller" ? "/seller/dashboard" : "/buyer/dashboard");
    } catch (err) {
      setGeneralError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Only two roles — buyer and seller
  const roles = [
    { value: "buyer",  icon: "bi-bag",     label: "Buyer",           desc: "I want to buy fresh produce" },
    { value: "seller", icon: "bi-flower2", label: "Farmer / Seller", desc: "I want to list and sell my produce" },
  ];

  return (
    <AuthLayout>
      <h2 className="fw-bold mb-1">Create your account</h2>
      <p className="text-muted mb-4" style={{ fontSize: "0.875rem" }}>
        Join thousands of Kenyan farmers and buyers on SokoMoja
      </p>

      {/* Step indicator */}
      <div className="d-flex align-items-center gap-2 mb-4">
        <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
          style={{ width: 28, height: 28, fontSize: 13, background: step >= 1 ? "var(--sm-green)" : "#e0ded5", color: step >= 1 ? "#fff" : "#73726c" }}>
          {step > 1 ? <i className="bi bi-check"></i> : "1"}
        </div>
        <div style={{ flex: 1, height: 2, background: step >= 2 ? "var(--sm-green)" : "#e0ded5", maxWidth: 60 }} />
        <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
          style={{ width: 28, height: 28, fontSize: 13, background: step >= 2 ? "var(--sm-green)" : "#e0ded5", color: step >= 2 ? "#fff" : "#73726c" }}>
          2
        </div>
        <span className="text-muted ms-2" style={{ fontSize: "0.78rem" }}>
          {step === 1 ? "Basic information" : "Contact & location"}
        </span>
      </div>

      {generalError && <div className="alert alert-danger py-2 small">{generalError}</div>}

      {/* STEP 1 */}
      {step === 1 && (
        <div>
          {/* Role selector */}
          <div className="mb-3">
            <label className="form-label fw-semibold small">I am signing up as a</label>
            <div className="d-flex flex-column gap-2">
              {roles.map((r) => (
                <div
                  key={r.value}
                  onClick={() => { setFormData((p) => ({ ...p, role: r.value })); if (errors.role) setErrors((p) => ({ ...p, role: "" })); }}
                  className="rounded-3 p-3"
                  style={{
                    border: formData.role === r.value ? "2px solid var(--sm-green)" : "1px solid #e0ded5",
                    background: formData.role === r.value ? "var(--sm-green-light)" : "#fff",
                    cursor: "pointer"
                  }}
                >
                  <div className="fw-semibold" style={{ fontSize: "0.875rem" }}>
                    <i className={`bi ${r.icon} me-2`}></i>{r.label}
                  </div>
                  <div className="text-muted" style={{ fontSize: "0.78rem" }}>{r.desc}</div>
                </div>
              ))}
            </div>
            {errors.role && <div className="text-danger small mt-1">{errors.role}</div>}
          </div>

          {/* Name */}
          <div className="mb-3">
            <label className="form-label fw-semibold small">Full name</label>
            <input className={`form-control ${errors.name ? "is-invalid" : ""}`} name="name" placeholder="e.g. Jane Wambui" value={formData.name} onChange={handleChange} />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>

          {/* Email */}
          <div className="mb-3">
            <label className="form-label fw-semibold small">Email address</label>
            <input className={`form-control ${errors.email ? "is-invalid" : ""}`} name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="form-label fw-semibold small">Password</label>
            <div className="input-group">
              <input className={`form-control ${errors.password ? "is-invalid" : ""}`} name="password" type={showPassword ? "text" : "password"} placeholder="At least 8 characters" value={formData.password} onChange={handleChange} />
              <button className="btn btn-outline-secondary" type="button" onClick={() => setShowPassword(!showPassword)}>
                <i className={`bi bi-${showPassword ? "eye-slash" : "eye"}`}></i>
              </button>
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>
          </div>

          {/* Confirm password */}
          <div className="mb-4">
            <label className="form-label fw-semibold small">Confirm password</label>
            <div className="input-group">
              <input className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`} name="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="Repeat your password" value={formData.confirmPassword} onChange={handleChange} />
              <button className="btn btn-outline-secondary" type="button" onClick={() => setShowConfirm(!showConfirm)}>
                <i className={`bi bi-${showConfirm ? "eye-slash" : "eye"}`}></i>
              </button>
              {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
            </div>
          </div>

          <button className="btn w-100 fw-semibold py-2" style={{ background: "var(--sm-green)", color: "#fff", border: "none" }} onClick={handleNext}>
            Next →
          </button>

          <p className="text-center text-muted mt-3" style={{ fontSize: "0.875rem" }}>
            Already have an account? <Link to="/login" style={{ color: "var(--sm-green)" }}>Sign in</Link>
          </p>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <form onSubmit={handleSubmit} noValidate>
          {/* Phone */}
          <div className="mb-3">
            <label className="form-label fw-semibold small">Phone number</label>
            <input className={`form-control ${errors.phone ? "is-invalid" : ""}`} name="phone" type="tel" placeholder="e.g. 0712 345 678" value={formData.phone} onChange={handleChange} />
            <div className="form-text">Used for M-Pesa payments and order notifications</div>
            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
          </div>

          {/* Region + Zone (sellers only) */}
          {formData.role === "seller" && (
            <>
              <div className="mb-3">
                <label className="form-label fw-semibold small">Your region</label>
                <select className={`form-select ${errors.region ? "is-invalid" : ""}`} name="region" value={formData.region} onChange={handleChange}>
                  <option value="">Select your county / region</option>
                  {["Kiambu","Nakuru","Meru","Nairobi","Eldoret","Kisumu"].map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                {errors.region && <div className="invalid-feedback">{errors.region}</div>}
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold small">Collection zone</label>
                <select className={`form-select ${errors.zoneId ? "is-invalid" : ""}`} name="zoneId" value={formData.zoneId} onChange={handleChange}>
                  <option value="">Select your collection zone</option>
                  {pickupZones.filter((z) => !formData.region || z.region === formData.region).map((zone) => (
                    <option key={zone.zone_id} value={zone.zone_id}>{zone.zone_name}</option>
                  ))}
                </select>
                <div className="form-text">Where buyers in your area collect their orders</div>
                {errors.zoneId && <div className="invalid-feedback">{errors.zoneId}</div>}
              </div>
            </>
          )}

          <p className="text-muted mb-3" style={{ fontSize: "0.78rem" }}>
            By creating an account you agree to our <span style={{ color: "var(--sm-green)", cursor: "pointer" }}>Terms</span> and{" "}
            <span style={{ color: "var(--sm-green)", cursor: "pointer" }}>Privacy Policy</span>.
          </p>

          <div className="d-flex gap-2">
            <button type="button" className="btn btn-outline-secondary flex-shrink-0" onClick={() => setStep(1)}>
              ← Back
            </button>
            <button type="submit" className="btn flex-grow-1 fw-semibold py-2" style={{ background: "var(--sm-green)", color: "#fff", border: "none" }} disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}

export default RegisterPage;
