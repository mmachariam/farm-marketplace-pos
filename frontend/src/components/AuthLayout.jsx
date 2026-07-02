// AuthLayout — SokoMoja
// Shared two-column wrapper for Login and Register pages.
// Left = branding panel. Right = {children} (the form).
// Grocery POS reference removed. Updated to Bootstrap layout.

import Navbar from "./Navbar";

function AuthLayout({ children }) {
  return (
    <div>
      <Navbar />

      <div className="row g-0" style={{ minHeight: "calc(100vh - 57px)" }}>

        {/* ---- LEFT PANEL — branding ---- */}
        <div className="col-lg-5 sm-auth-left d-none d-lg-flex flex-column justify-content-center p-5">
          <div className="sm-badge mb-4">
            <i className="bi bi-patch-check-fill"></i> Verified Kenyan Farmers
          </div>

          <div className="sm-auth-tagline mb-3">
            Welcome to the farm network
          </div>
          <div className="sm-auth-sub mb-4">
            Connecting small-scale Kenyan farmers directly with buyers —
            fair prices, no middlemen, fresh produce.
          </div>

          <div className="d-flex flex-column gap-3">
            <div className="d-flex align-items-start gap-3">
              <div className="sm-feature-dot"><i className="bi bi-flower2"></i></div>
              <div className="pt-1 small text-success-emphasis">
                Farmers earn more selling directly at farm-gate prices
              </div>
            </div>
            <div className="d-flex align-items-start gap-3">
              <div className="sm-feature-dot"><i className="bi bi-geo-alt"></i></div>
              <div className="pt-1 small text-success-emphasis">
                Regional collection zones make pickup fast and affordable
              </div>
            </div>
            <div className="d-flex align-items-start gap-3">
              <div className="sm-feature-dot"><i className="bi bi-star"></i></div>
              <div className="pt-1 small text-success-emphasis">
                Verified farmers with real buyer reviews and ratings
              </div>
            </div>
          </div>
        </div>

        {/* ---- RIGHT PANEL — the form ---- */}
        <div className="col-12 col-lg-7 d-flex align-items-center justify-content-center p-4 p-md-5">
          <div style={{ width: "100%", maxWidth: "440px" }}>
            {children}
          </div>
        </div>

      </div>
    </div>
  );
}

export default AuthLayout;
