// ForgotPassword — SokoMoja

import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { apiRequest } from "../utils/api";

function ForgotPassword() {
  const [email, setEmail]               = useState("");
  const [error, setError]               = useState("");
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading]           = useState(false);
  const [submitted, setSubmitted]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError("Email address is required"); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email address"); return; }
    setError("");
    setGeneralError("");
    setLoading(true);
    try {
      await apiRequest("/auth/forgot-password", "POST", { email });
      setSubmitted(true);
    } catch (err) {
      setGeneralError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {!submitted ? (
        <>
          <h2 className="fw-bold mb-1">Forgot your password?</h2>
          <p className="text-muted mb-4" style={{ fontSize: "0.875rem" }}>
            Enter your email and we'll send you a reset link.
          </p>
          {generalError && (
            <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small mb-3">
              <i className="bi bi-exclamation-triangle-fill"></i>
              {generalError}
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label htmlFor="email" className="form-label fw-semibold small">
                Email address <span className="text-danger">*</span>
              </label>
              <input
                id="email" type="email"
                className={`form-control ${error ? "is-invalid" : ""}`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
              />
              {error && (
                <div className="invalid-feedback d-block">
                  <i className="bi bi-exclamation-circle me-1"></i>{error}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-success w-100 fw-semibold py-2 mb-3"
              disabled={loading}
            >
              {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Sending...</> : "Send reset link"}
            </button>
          </form>
          <p className="text-center text-muted" style={{ fontSize: "0.875rem" }}>
            Remembered it? <Link to="/login" className="text-success">Back to sign in</Link>
          </p>
        </>
      ) : (
        <>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📩</div>
          <h2 className="fw-bold mb-2">Check your email</h2>
          <p className="text-muted mb-4" style={{ fontSize: "0.875rem" }}>
            If an account exists for <strong>{email}</strong>, we've sent a password reset link.
            It expires in 60 minutes.
          </p>
          <Link to="/login" className="btn btn-success w-100 fw-semibold py-2">
            Back to sign in
          </Link>
        </>
      )}
    </AuthLayout>
  );
}

export default ForgotPassword;
