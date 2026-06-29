// ForgotPassword — SokoMoja

import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

function ForgotPassword() {
  const [email, setEmail]         = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError("Email address is required"); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email address"); return; }
    setError("");
    setLoading(true);
    try {
      // TODO: await apiRequest("/auth/forgot-password", "POST", { email });
      await new Promise((r) => setTimeout(r, 1000));
      setSubmitted(true);
    } catch {
      setSubmitted(true); // still show success to avoid email enumeration
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
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold small">Email address</label>
              <input
                id="email" type="email"
                className={`form-control ${error ? "is-invalid" : ""}`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
              />
              {error && <div className="invalid-feedback">{error}</div>}
            </div>
            <button
              type="submit"
              className="btn w-100 fw-semibold py-2 mb-3"
              style={{ background: "var(--sm-green)", color: "#fff", border: "none" }}
              disabled={loading}
            >
              {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Sending…</> : "Send reset link"}
            </button>
          </form>
          <p className="text-center text-muted" style={{ fontSize: "0.875rem" }}>
            Remembered it? <Link to="/login" style={{ color: "var(--sm-green)" }}>Back to sign in</Link>
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
          <Link to="/login" className="btn w-100 fw-semibold py-2" style={{ background: "var(--sm-green)", color: "#fff", border: "none" }}>
            Back to sign in
          </Link>
        </>
      )}
    </AuthLayout>
  );
}

export default ForgotPassword;
