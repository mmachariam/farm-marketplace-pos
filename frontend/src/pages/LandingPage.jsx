// LandingPage — SokoMoja
// Added a "Browse the marketplace" section showing 4 featured products
// with a "View all products →" button linking to /marketplace.
// Visitors can go directly to marketplace from the navbar OR from this section.

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import SearchBar from "../components/SearchBar";
import HowItWorks from "../components/HowItWorks";
import RoleCards from "../components/RoleCards";
import ZonesSection from "../components/ZonesSection";
import Footer from "../components/Footer";
import { apiRequest } from "../utils/api";

function categoryEmoji(name = "") {
  const n = name.toLowerCase();
  if (n.includes("vegetable"))  return "🥬";
  if (n.includes("fruit"))      return "🍎";
  if (n.includes("grain") || n.includes("cereal")) return "🌽";
  if (n.includes("dairy") || n.includes("egg"))    return "🥛";
  if (n.includes("root") || n.includes("tuber"))   return "🥔";
  if (n.includes("legume"))     return "🫘";
  return "🌿";
}

export default function LandingPage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    apiRequest("/products?per_page=4")
      .then((res) => setFeaturedProducts(res.data || []))
      .catch(() => {});
  }, []);

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
          <div className="row g-3 mb-4 sm-fade-in">
            {featuredProducts.map((p) => (
              <div key={p.product_id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div className="sm-product-card h-100">
                  {/* Image */}
                  <div className="sm-product-img position-relative" style={{ height: 160 }}>
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-100 h-100 object-fit-cover"
                        style={{ borderRadius: "12px 12px 0 0" }}
                        onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                      />
                    ) : null}
                    <div
                      className="w-100 h-100 d-flex align-items-center justify-content-center"
                      style={{ borderRadius: "12px 12px 0 0", fontSize: "2.5rem", display: p.image_url ? "none" : "flex" }}
                    >
                      {categoryEmoji(p.category?.name)}
                    </div>
                    {p.seller?.is_verified && (
                      <div className="position-absolute top-0 end-0 p-2">
                        <span className="badge bg-white text-success shadow-sm d-flex align-items-center gap-1" style={{ fontSize: "0.68rem" }}>
                          <i className="bi bi-patch-check-fill"></i> Verified
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="card-body d-flex flex-column p-3">
                    <h6 className="fw-bold mb-1" style={{ fontSize: "0.9rem" }}>{p.name}</h6>
                    <div className="d-flex align-items-center gap-1 mb-2">
                      <i className="bi bi-person-circle text-muted" style={{ fontSize: "0.72rem" }}></i>
                      <span className="text-muted" style={{ fontSize: "0.75rem" }}>{p.seller?.name}</span>
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
            className="rounded-4 p-4 d-flex flex-wrap align-items-center justify-content-between gap-3 bg-success-subtle border border-success-subtle"
          >
            <div>
              <div className="fw-bold text-success-emphasis">
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
