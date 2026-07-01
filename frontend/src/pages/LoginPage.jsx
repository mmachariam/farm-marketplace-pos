// LoginPage — SokoMoja
// Wired to real backend: POST /api/auth/login

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { apiRequest } from "../utils/api";
import { setToken, setUser } from "../utils/auth";

export default function LoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const redirectMessage = location.state?.message || null;
  const returnTo        = location.state?.returnTo || null;

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [rememberMe,   setRememberMe]   = useState(false);
  const [showPass,     setShowPass]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [errors,       setErrors]       = useState({ email: "", password: "" });

  const validate = () => {
    const errs = { email: "", password: "" };
    let ok = true;
    if (!email) { errs.email = "Email address is required"; ok = false; }
    else if (!/\S+@\S+\.\S+/.test(email)) { errs.email = "Enter a valid email address"; ok = false; }
    if (!password) { errs.password = "Password is required"; ok = false; }
    else if (password.length < 8) { errs.password = "Password must be at least 8 characters"; ok = false; }
    setErrors(errs);
    return ok;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setGeneralError("");
    if (!validate()) return;

    setLoading(true);
    try {
      // POST /api/auth/login
      const data = await apiRequest("/auth/login", "POST", { email, password });

      // Store JWT token and user info in localStorage
      setToken(data.token);
      setUser(data.user);

      // Return to where the user came from (e.g. the public marketplace),
      // otherwise redirect based on role returned from backend
      if (returnTo) {
        navigate(returnTo);
        return;
      }
      const role = data.user.role;
      if (role === "admin")  navigate("/admin/overview");
      else if (role === "seller") navigate("/seller/dashboard");
      else navigate("/buyer/dashboard");

    } catch (err) {
      // Show field-level errors if Laravel returned them
      if (err.errors?.email)    setErrors((p) => ({ ...p, email:    err.errors.email[0] }));
      if (err.errors?.password) setErrors((p) => ({ ...p, password: err.errors.password[0] }));
      if (!err.errors || Object.keys(err.errors).length === 0)
        setGeneralError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>

      {/* Banner shown when redirected from public marketplace */}
      {redirectMessage && (
        <div className="rounded-3 p-3 mb-4 d-flex align-items-start gap-3"
          style={{ background: "#d1e7dd", border: "1px solid #a3cfbb" }}>
          <i className="bi bi-cart3 text-success mt-1 flex-shrink-0" style={{ fontSize: "1.1rem" }}></i>
          <div>
            <div className="fw-semibold text-success" style={{ fontSize: "0.875rem" }}>Almost there!</div>
            <div style={{ fontSize: "0.82rem", color: "#0a3622" }}>{redirectMessage}</div>
            <div className="mt-2" style={{ fontSize: "0.82rem" }}>
              No account yet?{" "}
              <Link to="/register?role=buyer" className="fw-semibold" style={{ color: "#198754" }}>
                Create one free — it only takes a minute
              </Link>
            </div>
          </div>
        </div>
      )}

      <h2 className="fw-bold mb-1">Sign in</h2>
      <p className="text-muted mb-4" style={{ fontSize: "0.875rem" }}>
        Enter your credentials to access your account
      </p>

      {generalError && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small">
          <i className="bi bi-exclamation-triangle-fill"></i> {generalError}
        </div>
      )}

      <form onSubmit={handleLogin} noValidate>
        <div className="mb-3">
          <label htmlFor="login-email" className="form-label fw-semibold small">Email address</label>
          <input
            id="login-email" type="email"
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: "" })); }}
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>

        <div className="mb-3">
          <label htmlFor="login-password" className="form-label fw-semibold small">Password</label>
          <div className="input-group">
            <input
              id="login-password"
              type={showPass ? "text" : "password"}
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => ({ ...p, password: "" })); }}
            />
            <button type="button" className="btn btn-outline-secondary"
              onClick={() => setShowPass(!showPass)}>
              <i className={`bi bi-${showPass ? "eye-slash" : "eye"}`}></i>
            </button>
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="form-check">
            <input className="form-check-input" type="checkbox" id="rememberMe"
              checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
            <label className="form-check-label small text-muted" htmlFor="rememberMe">
              Remember me
            </label>
          </div>
          <Link to="/forgot-password"
            style={{ fontSize: "0.82rem", color: "#198754", textDecoration: "none" }}>
            Forgot password?
          </Link>
        </div>

        <button type="submit" className="btn btn-success w-100 fw-semibold py-2 mb-3"
          disabled={loading}>
          {loading
            ? <><span className="spinner-border spinner-border-sm me-2"></span>Signing in…</>
            : <><i className="bi bi-box-arrow-in-right me-2"></i>Sign in</>}
        </button>
      </form>

      <div className="d-flex align-items-center gap-2 mb-3">
        <hr className="flex-grow-1 m-0" />
        <span className="text-muted small px-1">or</span>
        <hr className="flex-grow-1 m-0" />
      </div>

      <button className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2 mb-4">
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        Continue with Google
      </button>

      <p className="text-center text-muted" style={{ fontSize: "0.875rem" }}>
        New to SokoMoja?{" "}
        <Link to="/register" style={{ color: "#198754", fontWeight: 600 }}>Create a free account</Link>
      </p>
    </AuthLayout>
  );
}
