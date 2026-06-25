// RoleCards — SokoMoja
// Two roles only: Farmer (seller) and Buyer.
// Grocery shop card is REMOVED — replaced with buyer reviews feature highlight.

import { Link } from "react-router-dom";

function RoleCards() {
  return (
    <section className="py-5 border-top">
      <div className="container-fluid px-4">

        <div className="sm-section-label">Who is this for</div>
        <h2 className="fw-bold mb-2">Choose your role</h2>
        <p className="text-muted mb-4">One platform, two ways to participate</p>

        <div className="row g-3">

          {/* FARMER CARD — featured/highlighted */}
          <div className="col-md-6">
            <div className="sm-role-card featured h-100 d-flex flex-column">
              <div className="sm-role-icon"><i className="bi bi-flower2"></i></div>
              <h5 className="fw-bold mb-2">Farmers</h5>
              <p className="text-muted flex-grow-1" style={{ fontSize: "0.875rem" }}>
                List your produce, set your own prices, and sell directly to buyers —
                no broker cutting into your earnings. Manage your inventory and record
                offline sales from the same dashboard.
              </p>
              <ul className="list-unstyled mb-3" style={{ fontSize: "0.82rem", color: "#3B6D11" }}>
                <li className="mb-1"><i className="bi bi-check-circle-fill me-2" style={{ color: "var(--sm-green)" }}></i>Manage listings & inventory</li>
                <li className="mb-1"><i className="bi bi-check-circle-fill me-2" style={{ color: "var(--sm-green)" }}></i>Record offline farm-gate sales</li>
                <li className="mb-1"><i className="bi bi-check-circle-fill me-2" style={{ color: "var(--sm-green)" }}></i>View earnings reports</li>
                <li><i className="bi bi-check-circle-fill me-2" style={{ color: "var(--sm-green)" }}></i>Set collection schedules</li>
              </ul>
              <Link
                to="/register?role=seller"
                className="btn w-100"
                style={{ background: "var(--sm-green)", color: "#fff", border: "none" }}
              >
                Start selling ↗
              </Link>
            </div>
          </div>

          {/* BUYER CARD */}
          <div className="col-md-6">
            <div className="sm-role-card h-100 d-flex flex-column">
              <div className="sm-role-icon"><i className="bi bi-bag"></i></div>
              <h5 className="fw-bold mb-2">Buyers</h5>
              <p className="text-muted flex-grow-1" style={{ fontSize: "0.875rem" }}>
                Order fresh produce at farm-gate prices from verified Kenyan farmers.
                Collect from a shared zone near you or get delivery arranged.
                Leave reviews to help the community.
              </p>
              <ul className="list-unstyled mb-3" style={{ fontSize: "0.82rem", color: "#27500A" }}>
                <li className="mb-1"><i className="bi bi-check-circle-fill me-2" style={{ color: "var(--sm-green)" }}></i>Browse & search verified farmers</li>
                <li className="mb-1"><i className="bi bi-check-circle-fill me-2" style={{ color: "var(--sm-green)" }}></i>Track orders in real time</li>
                <li className="mb-1"><i className="bi bi-check-circle-fill me-2" style={{ color: "var(--sm-green)" }}></i>Pay via M-Pesa or card</li>
                <li><i className="bi bi-check-circle-fill me-2" style={{ color: "var(--sm-green)" }}></i>Rate and review farmers</li>
              </ul>
              <Link
                to="/register?role=buyer"
                className="btn btn-outline-secondary w-100"
              >
                Start buying ↗
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default RoleCards;
