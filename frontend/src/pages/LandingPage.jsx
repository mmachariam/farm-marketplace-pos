// LandingPage — SokoMoja
// Added a "Browse the marketplace" section showing 4 featured products
// with a "View all products →" button linking to /marketplace.
// Visitors can go directly to marketplace from the navbar OR from this section.

import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import SearchBar from "../components/SearchBar";
import HowItWorks from "../components/HowItWorks";
import RoleCards from "../components/RoleCards";
import ZonesSection from "../components/ZonesSection";
import Footer from "../components/Footer";

// Four featured products shown as a preview teaser on the landing page
const featuredProducts = [
  { id: 1, name: "Fresh Tomatoes",  farmer: "John Kamau",   price: 120, unit: "kg",    rating: 4.8, reviews: 24, is_organic: true,  is_verified: true,  image: "https://images.unsplash.com/photo-1546470427-227c7369a9b9?w=400&h=300&fit=crop" },
  { id: 2, name: "Fresh Avocados",  farmer: "John Kamau",   price: 180, unit: "kg",    rating: 4.9, reviews: 45, is_organic: true,  is_verified: true,  image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b5a8?w=400&h=300&fit=crop" },
  { id: 3, name: "Free Range Eggs", farmer: "Mary Wanjiku", price: 15,  unit: "piece", rating: 5.0, reviews: 67, is_organic: true,  is_verified: true,  image: "https://images.unsplash.com/photo-1598965675045-45c5e72c7d05?w=400&h=300&fit=crop" },
  { id: 4, name: "Passion Fruits",  farmer: "John Kamau",   price: 200, unit: "kg",    rating: 4.7, reviews: 19, is_organic: true,  is_verified: true,  image: "https://images.unsplash.com/photo-1559181567-c3190ca9951b?w=400&h=300&fit=crop" },
];

function Stars({ rating }) {
  const full = Math.round(rating);
  return (
    <span style={{ color: "#ffc107", fontSize: "0.78rem", letterSpacing: 1 }}>
      {"★".repeat(full)}
      <span style={{ color: "#dee2e6" }}>{"★".repeat(5 - full)}</span>
    </span>
  );
}

export default function LandingPage() {
  return (
    <div>
      <Navbar />
      <Hero />
      <SearchBar />

      {/* ════════════════════════════════════════════════════════
          MARKETPLACE PREVIEW SECTION
          Shows 4 featured products + CTA to /marketplace
      ════════════════════════════════════════════════════════ */}
      <section className="py-5 border-top">
        <div className="container">

          {/* Section header */}
          <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-3">
            <div>
              <div className="sm-section-label">Fresh today</div>
              <h2 className="fw-bold mb-1">Browse the marketplace</h2>
              <p className="text-muted small mb-0">
                Listed directly by verified farmers — no account required to browse
              </p>
            </div>
            <Link
              to="/marketplace"
              className="btn btn-success d-flex align-items-center gap-2 fw-semibold"
            >
              <i className="bi bi-shop"></i>
              View all products
              <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>

          {/* Featured product cards */}
          <div className="row g-3 mb-4">
            {featuredProducts.map((p) => (
              <div key={p.id} className="col-sm-6 col-lg-3">
                <div className="card border-0 shadow-sm h-100 product-card">
                  {/* Image */}
                  <div className="position-relative" style={{ height: 160, overflow: "hidden" }}>
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-100 h-100 object-fit-cover"
                      style={{ borderRadius: "12px 12px 0 0" }}
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                    {/* Badges */}
                    <div className="position-absolute top-0 start-0 p-2">
                      {p.is_organic && (
                        <span className="badge bg-success d-flex align-items-center gap-1" style={{ fontSize: "0.68rem" }}>
                          <i className="bi bi-flower2"></i> Organic
                        </span>
                      )}
                    </div>
                    {p.is_verified && (
                      <div className="position-absolute top-0 end-0 p-2">
                        <span className="badge bg-white text-success shadow-sm d-flex align-items-center gap-1" style={{ fontSize: "0.68rem" }}>
                          <i className="bi bi-patch-check-fill"></i> Verified
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="card-body d-flex flex-column p-3">
                    <h6 className="fw-bold mb-1" style={{ fontSize: "0.9rem" }}>{p.name}</h6>
                    <div className="d-flex align-items-center gap-1 mb-1">
                      <i className="bi bi-person-circle text-muted" style={{ fontSize: "0.72rem" }}></i>
                      <span className="text-muted" style={{ fontSize: "0.75rem" }}>{p.farmer}</span>
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-2">
                      <Stars rating={p.rating} />
                      <span className="text-muted" style={{ fontSize: "0.72rem" }}>({p.reviews})</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      <span className="fw-bold text-success" style={{ fontSize: "1rem" }}>
                        KES {p.price}
                        <span className="text-muted fw-normal" style={{ fontSize: "0.72rem" }}>/{p.unit}</span>
                      </span>
                      <Link
                        to="/marketplace"
                        className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
                        style={{ fontSize: "0.75rem" }}
                      >
                        <i className="bi bi-eye"></i> View
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA bar */}
          <div
            className="rounded-4 p-4 d-flex flex-wrap align-items-center justify-content-between gap-3"
            style={{ background: "#d1e7dd", border: "1px solid #a3cfbb" }}
          >
            <div>
              <div className="fw-bold" style={{ color: "#0a3622" }}>
                <i className="bi bi-basket2 me-2 text-success"></i>
                12 products available from verified farmers
              </div>
              <div className="text-muted small mt-1">
                Browse freely — sign in only when you're ready to order
              </div>
            </div>
            <Link
              to="/marketplace"
              className="btn btn-success fw-semibold px-4"
            >
              <i className="bi bi-shop me-2"></i>Open marketplace
            </Link>
          </div>

        </div>
      </section>

      <HowItWorks />
      <RoleCards />
      <ZonesSection />
      <Footer />
    </div>
  );
}
