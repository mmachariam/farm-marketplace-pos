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
          <div className="col-12 col-md-6">
            <div className="sm-role-card featured h-100 d-flex flex-column">
              <div className="sm-role-icon"><i className="bi bi-flower2"></i></div>
              <h5 className="fw-bold mb-2">Farmers</h5>
              <p className="text-muted flex-grow-1 small">
                List your produce, set your own prices, and sell directly to buyers —
                no broker cutting into your earnings. Manage your inventory and record
                offline sales from the same dashboard.
              </p>
              <ul className="list-unstyled mb-3 small text-success-emphasis">
                <li className="mb-1"><i className="bi bi-check-circle-fill me-2 text-success"></i>Manage listings &amp; inventory</li>
                <li className="mb-1"><i className="bi bi-check-circle-fill me-2 text-success"></i>Record offline farm-gate sales</li>
                <li className="mb-1"><i className="bi bi-check-circle-fill me-2 text-success"></i>View earnings reports</li>
                <li><i className="bi bi-check-circle-fill me-2 text-success"></i>Set collection schedules</li>
              </ul>
              <Link
                to="/register?role=seller"
                className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2"
              >
                Start selling <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>

          {/* BUYER CARD */}
          <div className="col-12 col-md-6">
            <div className="sm-role-card h-100 d-flex flex-column">
              <div className="sm-role-icon"><i className="bi bi-bag"></i></div>
              <h5 className="fw-bold mb-2">Buyers</h5>
              <p className="text-muted flex-grow-1 small">
                Order fresh produce at farm-gate prices from verified Kenyan farmers.
                Collect from a shared zone near you or get delivery arranged.
                Leave reviews to help the community.
              </p>
              <ul className="list-unstyled mb-3 small text-success-emphasis">
                <li className="mb-1"><i className="bi bi-check-circle-fill me-2 text-success"></i>Browse &amp; search verified farmers</li>
                <li className="mb-1"><i className="bi bi-check-circle-fill me-2 text-success"></i>Track orders in real time</li>
                <li className="mb-1"><i className="bi bi-check-circle-fill me-2 text-success"></i>Pay via M-Pesa or card</li>
                <li><i className="bi bi-check-circle-fill me-2 text-success"></i>Rate and review farmers</li>
              </ul>
              <Link
                to="/register?role=buyer"
                className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
              >
                Start buying <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default RoleCards;
