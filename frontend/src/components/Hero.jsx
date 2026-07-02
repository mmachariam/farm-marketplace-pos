// Hero — SokoMoja
// Replicates the reference design:
// - Left: headline, subtext, CTAs, stats
// - Right: large produce basket image that fades into the white background
//   using a gradient overlay on the left edge of the image container
// - The fade effect is achieved with a pseudo-element / overlay div that goes
//   from fully white (left) to transparent (right), blending the image in

import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section
      className="position-relative overflow-hidden"
      style={{
        background: "#fff",
        minHeight: 500,
      }}
    >
      <div className="container-fluid px-4 px-md-5">
        <div className="row align-items-center" style={{ minHeight: 500 }}>

          {/* ── LEFT COLUMN — text content ── */}
          <div
            className="col-12 col-lg-6 py-5"
            style={{ position: "relative", zIndex: 2 }}
          >
            {/* Badge */}
            <div
              className="d-inline-flex align-items-center gap-2 rounded-pill px-3 py-2 mb-4 bg-success-subtle border border-success-subtle text-success-emphasis"
              style={{ fontSize: "0.82rem" }}
            >
              <i className="bi bi-patch-check-fill text-success"></i>
              Direct from Kenyan farms
            </div>

            {/* Headline */}
            <h1
              className="fw-bold mb-3"
              style={{
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                color: "#1a1a1a",
              }}
            >
              Fresh produce,{" "}
              <span className="text-success">no middlemen</span>
            </h1>

            {/* Subtext */}
            <p
              className="mb-4"
              style={{
                fontSize: "1rem",
                color: "#555",
                lineHeight: 1.7,
                maxWidth: 460,
              }}
            >
              Connect directly with local farmers — get fresh, fair produce for
              buying, fair earnings for farmers — vegetables, cereals, and dairy
              delivered to your doorstep.
            </p>

            {/* CTAs */}
            <div className="d-flex flex-wrap gap-3 mb-5">
              <Link
                to="/register?role=buyer"
                className="btn btn-success fw-semibold px-4 py-2 d-flex align-items-center gap-2"
                style={{ fontSize: "0.95rem" }}
              >
                <i className="bi bi-cart3"></i> Start buying
              </Link>
              <Link
                to="/register?role=seller"
                className="btn btn-outline-secondary fw-semibold px-4 py-2 d-flex align-items-center gap-2"
                style={{ fontSize: "0.95rem" }}
              >
                <i className="bi bi-flower2"></i> Sell your produce
              </Link>
            </div>

            {/* Stats row */}
            <div className="d-flex flex-wrap gap-4">
              {[
                { icon: "bi-flower2",   value: "340+",  label: "Active farmers"         },
                { icon: "bi-geo-alt",   value: "8",     label: "Pickup zones"           },
                { icon: "bi-heart",     value: "KES 0", label: "Commission on first order" },
              ].map((stat) => (
                <div key={stat.label} className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center bg-success-subtle text-success"
                    style={{
                      width: 36, height: 36,
                      fontSize: "0.9rem",
                      flexShrink: 0,
                    }}
                  >
                    <i className={`bi ${stat.icon}`}></i>
                  </div>
                  <div>
                    <div className="fw-bold" style={{ fontSize: "1.1rem", lineHeight: 1.1, color: "#1a1a1a" }}>
                      {stat.value}
                    </div>
                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT COLUMN — fading produce image ── */}
          <div
            className="col-lg-6 d-none d-lg-block"
            style={{
              position: "relative",
              height: 500,
              overflow: "hidden",
            }}
          >
            {/* The actual image */}
            <img
              src="/src/assets/hero.png"
              alt="Fresh produce basket"
              className="sm-float"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",   // contain (not cover) since image has white bg
                objectPosition: "center right",
                display: "block",
              }}
            />

            {/* ── FADE OVERLAY ──
                Image already has a white background so we only need
                a gentle fade on the left edge to prevent a hard seam
                between the text column and the image column. */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "35%",
                height: "100%",
                background:
                  "linear-gradient(to right, #ffffff 0%, #ffffff 20%, rgba(255,255,255,0.85) 55%, transparent 100%)",
                pointerEvents: "none",
              }}
            />
          </div>

        </div>
      </div>
    </section>
  );
}
