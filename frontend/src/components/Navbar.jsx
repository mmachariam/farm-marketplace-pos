// Navbar — SokoMoja
// Added "Marketplace" link that takes anyone (logged in or not)
// to the public /marketplace page.

import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top shadow-sm">
      <div className="container">

        {/* Logo */}
        <Link to="/" className="navbar-brand sm-logo">
          Soko<span>Moja</span>
        </Link>

        {/* Mobile hamburger */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link to="/" className="nav-link text-muted">Home</Link>
            </li>
            {/* Public marketplace — accessible without login */}
            <li className="nav-item">
              <Link
                to="/marketplace"
                className="nav-link fw-semibold d-flex align-items-center gap-1"
                style={{ color: "#198754" }}
              >
                <i className="bi bi-shop"></i> Marketplace
              </Link>
            </li>
            <li className="nav-item">
              <a href="#how-it-works" className="nav-link text-muted">How it works</a>
            </li>
          </ul>

          {/* Auth buttons */}
          <div className="d-flex gap-2 align-items-center">
            <Link to="/login" className="btn btn-outline-secondary btn-sm px-3">
              Sign in
            </Link>
            <Link
              to="/register"
              className="btn btn-success btn-sm px-3 fw-semibold"
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
