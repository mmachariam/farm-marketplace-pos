// ResetPassword — SokoMoja
// Reached via the link emailed by /forgot-password:
//   /reset-password?token=xxx&email=yyy

import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { apiRequest } from "../utils/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword]         = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPass, setShowPass]         = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [success, setSuccess]           = useState(false);
  const [errors, setErrors]             = useState({});
  const [generalError, setGeneralError] = useState("");

  // If no token in URL — show invalid link message
  if (!token || !email) {
    return (
      <AuthLayout>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48 }}>🔗</div>
          <h4 className="fw-bold mt-3 mb-2">Invalid reset link</h4>
          <p className="text-muted small mb-4">
            This password reset link is invalid or has already been used.
          </p>
          <Link to="/forgot-password" className="btn btn-success w-100">
            Request a new reset link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  const validate = () => {
    const errs = {};
    if (!password) errs.password = "Password is required";
    else if (password.length < 8) errs.password = "At least 8 characters";
    if (!confirmation) errs.confirmation = "Please confirm your password";
    else if (password !== confirmation) errs.confirmation = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await apiRequest("/auth/reset-password", "POST", {
        email,
        token,
        password,
        password_confirmation: confirmation,
      });
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      if (err.errors?.password) {
        setErrors({ password: err.errors.password[0] });
      } else {
        setGeneralError(err.message || "Invalid or expired reset link.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48 }}>✅</div>
          <h4 className="fw-bold mt-3 mb-2">Password reset successfully</h4>
          <p className="text-muted small mb-4">
            Your password has been updated. Redirecting you to sign in...
          </p>
          <Link to="/login" className="btn btn-success w-100">
            Sign in now
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h2 className="fw-bold mb-1">Set new password</h2>
      <p className="text-muted mb-4" style={{ fontSize: "0.875rem" }}>
        Enter a new password for <strong>{email}</strong>
      </p>

      {generalError && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small mb-3">
          <i className="bi bi-exclamation-triangle-fill"></i>
          {generalError}
          {generalError.toLowerCase().includes("expired") && (
            <span> — <Link to="/forgot-password" style={{ color: "#198754" }}>
              Request a new link
            </Link></span>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label className="form-label fw-semibold small">
            New password <span className="text-danger">*</span>
          </label>
          <div className="input-group">
            <input
              type={showPass ? "text" : "password"}
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((p) => ({ ...p, password: "" }));
              }}
            />
            <button type="button" className="btn btn-outline-secondary"
              onClick={() => setShowPass(!showPass)}>
              <i className={`bi bi-${showPass ? "eye-slash" : "eye"}`}></i>
            </button>
            {errors.password && (
              <div className="invalid-feedback">{errors.password}</div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold small">
            Confirm new password <span className="text-danger">*</span>
          </label>
          <div className="input-group">
            <input
              type={showConfirm ? "text" : "password"}
              className={`form-control ${errors.confirmation ? "is-invalid" : ""}`}
              placeholder="Repeat your new password"
              value={confirmation}
              onChange={(e) => {
                setConfirmation(e.target.value);
                if (errors.confirmation) setErrors((p) => ({ ...p, confirmation: "" }));
              }}
            />
            <button type="button" className="btn btn-outline-secondary"
              onClick={() => setShowConfirm(!showConfirm)}>
              <i className={`bi bi-${showConfirm ? "eye-slash" : "eye"}`}></i>
            </button>
            {errors.confirmation && (
              <div className="invalid-feedback">{errors.confirmation}</div>
            )}
          </div>
        </div>

        <button type="submit" className="btn btn-success w-100 fw-semibold py-2"
          disabled={loading}>
          {loading
            ? <><span className="spinner-border spinner-border-sm me-2"></span>Resetting...</>
            : <><i className="bi bi-lock me-2"></i>Reset password</>
          }
        </button>
      </form>

      <p className="text-center text-muted mt-3" style={{ fontSize: "0.875rem" }}>
        Remembered it? <Link to="/login" style={{ color: "#198754" }}>Back to sign in</Link>
      </p>
    </AuthLayout>
  );
}
