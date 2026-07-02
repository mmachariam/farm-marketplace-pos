// PublicMarketplace — SokoMoja
// Wired to GET /api/products and GET /api/categories (no auth required)

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PaginationBar from "../components/PaginationBar";
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

function Stars({ rating }) {
  if (!rating) return null;
  const full = Math.round(rating);
  return (
    <span style={{ color: "#ffc107", fontSize: "0.78rem", letterSpacing: 1 }}>
      {"★".repeat(full)}
      <span style={{ color: "#dee2e6" }}>{"★".repeat(5 - full)}</span>
    </span>
  );
}

export default function PublicMarketplace() {
  const navigate    = useNavigate();
  const [urlParams] = useSearchParams();

  const [search,     setSearch]     = useState(urlParams.get("search")   || "");
  const [categoryId, setCategoryId] = useState(urlParams.get("category") || "");
  const [minPrice,   setMinPrice]   = useState("");
  const [maxPrice,   setMaxPrice]   = useState("");
  const [sortBy,     setSortBy]     = useState("newest");
  const [showFilters,setShowFilters]= useState(false);

  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta,       setMeta]       = useState({ total: 0, current_page: 1, last_page: 1, per_page: 12 });
  const [page,       setPage]       = useState(1);
  const [loading,    setLoading]    = useState(true);
  const [showToast,  setShowToast]  = useState(false);

  // Load categories once on mount
  useEffect(() => {
    apiRequest("/categories")
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  // Fetch products whenever filters, sort, or page changes.
  // Search changes debounce 300 ms; all other changes fire immediately.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const params = new URLSearchParams({ per_page: "12", page: String(page) });
      if (search)     params.set("search",      search);
      if (categoryId) params.set("category_id", categoryId);
      if (minPrice)   params.set("min_price",   minPrice);
      if (maxPrice)   params.set("max_price",   maxPrice);
      if (sortBy !== "newest") params.set("sort", sortBy);

      try {
        setLoading(true);
        const res = await apiRequest(`/products?${params.toString()}`);
        if (!cancelled) {
          setProducts(res.data || []);
          setMeta(res.meta || { total: 0, current_page: 1, last_page: 1, per_page: 12 });
        }
      } catch {
        // silently retain previous results
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const timer = setTimeout(load, search ? 300 : 0);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [search, categoryId, minPrice, maxPrice, sortBy, page]);

  // Reset to page 1 when any filter or sort changes
  const setFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch(""); setCategoryId(""); setMinPrice(""); setMaxPrice(""); setSortBy("newest");
    setPage(1);
  };

  const handleAddToCart = () => {
    setShowToast(true);
    setTimeout(() => {
      navigate("/login", {
        state: {
          message: "Sign in or create a free account to add items to your cart.",
          returnTo: "/marketplace",
        },
      });
    }, 1800);
  };

  const activeFilterCount = [search, categoryId, minPrice, maxPrice].filter(Boolean).length;

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Navbar />

      {/* ── Toast ─────────────────────────────────────────────────── */}
      {showToast && (
        <div className="position-fixed top-0 start-50 translate-middle-x mt-3" style={{ zIndex: 9999 }}>
          <div className="toast show text-bg-success border-0 shadow" role="alert">
            <div className="toast-body d-flex align-items-center gap-2">
              <i className="bi bi-person-check-fill fs-5"></i>
              <span>Please sign in to add items to your cart…</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section
        className="text-white py-5"
        style={{ background: "linear-gradient(135deg,#198754 0%,#20c997 100%)" }}
      >
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-5">
              <span
                className="badge mb-3 px-3 py-2"
                style={{ background: "rgba(255,255,255,0.2)", fontSize: "0.8rem" }}
              >
                <i className="bi bi-patch-check-fill me-1"></i>Verified Farmers Only
              </span>
              <h1 className="fw-bold mb-2" style={{ fontSize: "2rem" }}>Fresh Marketplace</h1>
              <p className="mb-4" style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95rem", lineHeight: 1.7 }}>
                Discover fresh produce directly from verified Kenyan farmers. Quality guaranteed, no middlemen.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2 rounded-3 px-3 py-2"
                  style={{ background: "rgba(255,255,255,0.15)", fontSize: "0.85rem" }}>
                  <i className="bi bi-basket2"></i>
                  <span>{meta.total} Products</span>
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="bg-white rounded-4 p-3 shadow">
                <div className="input-group">
                  <span className="input-group-text bg-light border-0">
                    <i className="bi bi-search text-success"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-0 bg-light py-3"
                    placeholder="Search tomatoes, spinach, eggs…"
                    value={search}
                    onChange={(e) => setFilter(setSearch)(e.target.value)}
                  />
                  {search && (
                    <button className="btn btn-light border-0" onClick={() => setFilter(setSearch)("")}>
                      <i className="bi bi-x-lg"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Products ──────────────────────────────────────────────── */}
      <main className="container py-4 flex-grow-1">

        {/* Controls bar */}
        <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3 flex-wrap gap-2">
          <span className="text-muted small">
            Showing <strong>{products.length}</strong> of {meta.total} products
          </span>
          <div className="d-flex gap-2 align-items-center">
            <select
              className="form-select form-select-sm border-0 bg-white shadow-sm"
              style={{ width: "auto" }}
              value={sortBy}
              onChange={(e) => setFilter(setSortBy)(e.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
            <button
              className={`btn btn-sm d-flex align-items-center gap-2 ${activeFilterCount > 0 ? "btn-success" : "btn-outline-secondary"}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <i className="bi bi-funnel"></i>
              Filters
              {activeFilterCount > 0 && (
                <span className="badge bg-white text-success">{activeFilterCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible filters */}
        {showFilters && (
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Category</label>
                  <select className="form-select" value={categoryId} onChange={(e) => setFilter(setCategoryId)(e.target.value)}>
                    <option value="">All categories</option>
                    {categories.map((c) => (
                      <option key={c.category_id} value={c.category_id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Min price (KES)</label>
                  <input type="number" className="form-control" placeholder="Min"
                    value={minPrice} onChange={(e) => setFilter(setMinPrice)(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Max price (KES)</label>
                  <input type="number" className="form-control" placeholder="Max"
                    value={maxPrice} onChange={(e) => setFilter(setMaxPrice)(e.target.value)} />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button className="btn btn-outline-danger btn-sm w-100" onClick={clearFilters}>
                    Clear all
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category pills */}
        <div className="d-flex flex-wrap gap-2 mb-4">
          <button
            className={`btn btn-sm px-3 ${!categoryId ? "btn-success" : "btn-outline-secondary bg-white"}`}
            onClick={() => setFilter(setCategoryId)("")}
          >
            All products
          </button>
          {categories.map((c) => (
            <button
              key={c.category_id}
              className={`btn btn-sm px-3 ${String(categoryId) === String(c.category_id) ? "btn-success" : "btn-outline-secondary bg-white"}`}
              onClick={() => setFilter(setCategoryId)(String(c.category_id))}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border spinner-border-sm me-2 text-success" role="status"></div>
            Loading products…
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 shadow-sm">
            <div
              className="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: 80, height: 80 }}
            >
              <i className="bi bi-search text-success" style={{ fontSize: "2rem" }}></i>
            </div>
            <h5 className="fw-bold mb-1">No products found</h5>
            <p className="text-muted small mb-3">Try adjusting your search or filters</p>
            <button className="btn btn-success btn-sm" onClick={clearFilters}>Clear all filters</button>
          </div>
        ) : (
          <>
            <div className="row g-3">
              {products.map((p) => {
                const qty        = p.inventory?.quantity_available ?? 0;
                const outOfStock = qty === 0;
                const imgSrc     = p.image_url;

                return (
                  <div key={p.product_id} className="col-sm-6 col-md-4 col-lg-3">
                    <div className="card border-0 shadow-sm h-100 product-card">
                      {/* Image */}
                      <div className="position-relative bg-light" style={{ height: 180, overflow: "hidden" }}>
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={p.name}
                            className="w-100 h-100 object-fit-cover"
                            style={{ borderRadius: "12px 12px 0 0" }}
                            onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                          />
                        ) : null}
                        <div
                          className="w-100 h-100 d-flex align-items-center justify-content-center"
                          style={{ borderRadius: "12px 12px 0 0", fontSize: "3rem", display: imgSrc ? "none" : "flex" }}
                        >
                          {categoryEmoji(p.category?.name)}
                        </div>
                        <div className="position-absolute top-0 start-0 p-2 d-flex flex-column gap-1">
                          {outOfStock && (
                            <span className="badge bg-secondary" style={{ fontSize: "0.68rem" }}>Out of stock</span>
                          )}
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
                        <span className="text-muted" style={{ fontSize: "0.72rem" }}>{p.category?.name}</span>
                        <h6 className="fw-bold mb-1 mt-1" style={{ fontSize: "0.9rem", lineHeight: 1.3 }}>{p.name}</h6>
                        <p className="text-muted mb-2" style={{
                          fontSize: "0.78rem", lineHeight: 1.5,
                          display: "-webkit-box", WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical", overflow: "hidden",
                        }}>
                          {p.description}
                        </p>
                        <div className="d-flex align-items-center gap-1 mb-2">
                          <i className="bi bi-person-circle text-muted" style={{ fontSize: "0.75rem" }}></i>
                          <span className="text-muted" style={{ fontSize: "0.75rem" }}>{p.seller?.name}</span>
                        </div>
                        {p.zone && (
                          <div className="d-flex align-items-center gap-1 mb-2">
                            <i className="bi bi-geo-alt text-muted" style={{ fontSize: "0.72rem" }}></i>
                            <span className="text-muted" style={{ fontSize: "0.72rem" }}>{p.zone.zone_name}</span>
                          </div>
                        )}

                        <div className="mt-auto">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fw-bold text-success" style={{ fontSize: "1rem" }}>
                              KES {p.price}
                              <span className="text-muted fw-normal" style={{ fontSize: "0.75rem" }}>/{p.unit || "kg"}</span>
                            </span>
                            {!outOfStock && (
                              <span className="text-muted" style={{ fontSize: "0.72rem" }}>{qty} left</span>
                            )}
                          </div>
                          {p.bunch_contains && (
                            <div className="text-muted mb-2" style={{ fontSize: "0.7rem" }}>
                              Per {p.unit}: {p.bunch_contains}
                            </div>
                          )}

                          {outOfStock ? (
                            <button className="btn btn-outline-secondary btn-sm w-100" disabled>
                              Out of stock
                            </button>
                          ) : (
                            <button
                              className="btn btn-success btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
                              onClick={handleAddToCart}
                            >
                              <i className="bi bi-cart-plus"></i> Add to cart
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {meta.total > 0 && (
              <PaginationBar
                page={page}
                lastPage={meta.last_page}
                total={meta.total}
                perPage={meta.per_page ?? 12}
                loading={loading}
                onChange={(p) => setPage(p)}
              />
            )}
          </>
        )}

        {/* Sign-in CTA */}
        <div
          className="mt-5 rounded-4 p-4 p-md-5 text-center"
          style={{ background: "linear-gradient(135deg,#198754 0%,#20c997 100%)" }}
        >
          <h5 className="fw-bold text-white mb-2">Ready to order?</h5>
          <p className="mb-4" style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.9rem" }}>
            Create a free account or sign in to place orders and track deliveries.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <button
              className="btn fw-semibold px-4 py-2"
              style={{ background: "#fff", color: "#198754", border: "none" }}
              onClick={() => navigate("/register?role=buyer")}
            >
              <i className="bi bi-person-plus me-2"></i>Create free account
            </button>
            <button
              className="btn btn-outline-light fw-semibold px-4 py-2"
              onClick={() => navigate("/login")}
            >
              <i className="bi bi-box-arrow-in-right me-2"></i>Sign in
            </button>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
