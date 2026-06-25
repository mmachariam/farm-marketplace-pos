// NotFound — SokoMoja 404 page

import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center text-center"
      style={{ minHeight: "100vh", padding: 24 }}>
      <div style={{ fontSize: 64, marginBottom: 8 }}>🌾</div>
      <div className="fw-bold" style={{ fontSize: 56, color: "var(--sm-green)", lineHeight: 1 }}>404</div>
      <h4 className="fw-bold mt-2 mb-2">This page wandered off the farm</h4>
      <p className="text-muted mb-4" style={{ maxWidth: 360, fontSize: "0.9rem", lineHeight: 1.7 }}>
        The page you're looking for doesn't exist or may have been moved.
        Let's get you back to familiar ground.
      </p>
      <div className="d-flex gap-2">
        <Link to="/" className="btn fw-semibold px-4" style={{ background: "var(--sm-green)", color: "#fff", border: "none" }}>
          Back to home
        </Link>
        <Link to="/login" className="btn btn-outline-secondary px-4">Sign in</Link>
      </div>
    </div>
  );
}

export default NotFound;
