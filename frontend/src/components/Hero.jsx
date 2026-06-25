// Hero — SokoMoja
// Focuses on direct farmer-to-buyer trade, verified farmers,
// fresh produce, and collection points. No grocery POS mentions.

import { Link } from "react-router-dom";

function Hero() {
  return (
    <div className="sm-hero container-fluid px-4">
      <div className="row align-items-center">
        <div className="col-lg-7">

          {/* Badge */}
          <div className="sm-badge mb-3">
            <i className="bi bi-patch-check-fill"></i>
            Verified Kenyan farmers only
          </div>

          {/* Headline */}
          <h1 className="mb-3">
            Fresh produce, <span>directly</span> from the farm
          </h1>

          {/* Subtext */}
          <p className="mb-4">
            SokoMoja cuts out the middlemen. Buy directly from verified small-scale
            Kenyan farmers — better prices for you, fair earnings for them.
            Collect from a point near you or get it delivered.
          </p>

          {/* CTAs */}
          <div className="d-flex flex-wrap gap-3 mb-5">
            <Link
              to="/register?role=buyer"
              className="btn btn-lg px-4 py-2"
              style={{ background: "var(--sm-green)", color: "#fff", border: "none", fontWeight: 600 }}
            >
              <i className="bi bi-bag me-2"></i>Start buying
            </Link>
            <Link
              to="/register?role=seller"
              className="btn btn-lg btn-outline-secondary px-4 py-2"
            >
              <i className="bi bi-flower2 me-2"></i>Sell your produce
            </Link>
          </div>

          {/* Stats */}
          <div className="d-flex flex-wrap gap-4">
            <div>
              <span className="sm-stat-num">340+</span>
              <span className="sm-stat-lbl">Verified farmers</span>
            </div>
            <div>
              <span className="sm-stat-num">12</span>
              <span className="sm-stat-lbl">Collection zones</span>
            </div>
            <div>
              <span className="sm-stat-num">4.8 ★</span>
              <span className="sm-stat-lbl">Average rating</span>
            </div>
            <div>
              <span className="sm-stat-num">KES 0</span>
              <span className="sm-stat-lbl">Commission on first order</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Hero;
