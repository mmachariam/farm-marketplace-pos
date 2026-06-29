// BuyerDashboard — SokoMoja Marketplace
// - Green hero section with embedded search bar
// - Product count + sort dropdown bar
// - Collapsible filters panel (category, price range)
// - Category quick-filter pills
// - Product card grid with verified badge
// - Cart panel (sticky sidebar on large screens)

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { useCart } from "../../context/CartContext";
import { apiRequest } from "../../utils/api";

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart, cartTotal } = useCart();

  const navItems = [
    { label: "Browse",    icon: "bi-shop",          path: "/buyer/dashboard", active: true  },
    { label: "My orders", icon: "bi-box-seam",      path: "/buyer/orders",    active: false },
    { label: "Cart",      icon: "bi-cart3",         path: "/buyer/dashboard", active: false },
    { label: "Profile",   icon: "bi-person-circle", path: "/buyer/profile",   active: false },
  ];

  // ── Filter state ────────────────────────────────────────────────────
  const [search,      setSearch]      = useState("");
  const [categoryId,  setCategoryId]  = useState("");
  const [minPrice,    setMinPrice]    = useState("");
  const [maxPrice,    setMaxPrice]    = useState("");
  const [sortBy,      setSortBy]      = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // ── Data state ──────────────────────────────────────────────────────
  const [products,       setProducts]       = useState([]);
  const [categories,     setCategories]     = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState("");
  const [totalProducts,  setTotalProducts]  = useState(0);
  const [lastPage,       setLastPage]       = useState(1);

  // Load categories once on mount
  useEffect(() => {
    apiRequest("/categories")
      .then((res) => setCategories(res.data ?? []))
      .catch(() => {});
  }, []);

  // Fetch products whenever filters, sort, or page changes.
  // Search changes are debounced 300ms; all other changes fire immediately.
  useEffect(() => {
    let cancelled = false;
    const sortParam = sortBy === "price_low" ? "price_asc"
                    : sortBy === "price_high" ? "price_desc"
                    : "newest";

    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");
        const params = new URLSearchParams({ page: currentPage });
        if (search)     params.set("search",      search);
        if (categoryId) params.set("category_id", categoryId);
        if (minPrice)   params.set("min_price",   minPrice);
        if (maxPrice)   params.set("max_price",   maxPrice);
        params.set("sort", sortParam);

        const res = await apiRequest(`/products?${params.toString()}`);
        if (!cancelled) {
          setProducts(res.data ?? []);
          setTotalProducts(res.meta?.total ?? 0);
          setLastPage(res.meta?.last_page ?? 1);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load products.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const timer = setTimeout(fetchProducts, search ? 300 : 0);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [search, categoryId, minPrice, maxPrice, sortBy, currentPage]);

  // Reset to page 1 whenever a filter or sort changes
  const setFilter = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch(""); setCategoryId(""); setMinPrice(""); setMaxPrice("");
    setSortBy("newest"); setCurrentPage(1);
  };

  const activeFilterCount = [search, categoryId, minPrice, maxPrice].filter(Boolean).length;

  // ── Cart helpers ────────────────────────────────────────────────────
  const cartQty = (id) => cart.find((i) => i.product_id === id)?.quantity || 0;

  return (
    <DashboardLayout title="Marketplace" navItems={navItems}>

      {/* ════════════════════════════════════════════════════════════
          HERO — green banner with embedded search
      ════════════════════════════════════════════════════════════ */}
      <div
        className="rounded-4 text-white mb-4 p-4 p-md-5"
        style={{ background: "linear-gradient(135deg,#198754 0%,#20c997 100%)" }}
      >
        <div className="row align-items-center g-4">
          {/* Left copy */}
          <div className="col-lg-5">
            <span className="badge mb-3 px-3 py-2"
              style={{ background: "rgba(255,255,255,0.2)", fontSize: "0.8rem" }}>
              <i className="bi bi-patch-check-fill me-1"></i>Verified Farmers Only
            </span>
            <h2 className="fw-bold mb-2">Fresh Marketplace</h2>
            <p className="mb-3" style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.95rem" }}>
              Discover fresh produce directly from verified Kenyan farmers. Quality guaranteed.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2 rounded-3 px-3 py-2"
                style={{ background: "rgba(255,255,255,0.15)", fontSize: "0.85rem" }}>
                <i className="bi bi-basket2"></i>
                <span>{totalProducts} Products</span>
              </div>
            </div>
          </div>

          {/* Right — search bar */}
          <div className="col-lg-7">
            <div className="bg-white rounded-4 p-3 shadow">
              <div className="input-group">
                <span className="input-group-text bg-light border-0">
                  <i className="bi bi-search text-success"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-0 bg-light py-3"
                  placeholder="Search for tomatoes, spinach, eggs…"
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

      <div className="row g-4">

        {/* ════════════════════════════════════════════════════════════
            MAIN — filters + product grid
        ════════════════════════════════════════════════════════════ */}
        <div className="col-12 col-xl-8">

          {/* ── Controls bar ── */}
          <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
            <span className="text-muted small">
              Showing <strong>{totalProducts}</strong> products
            </span>
            <div className="d-flex gap-2 align-items-center">
              <select
                className="form-select form-select-sm border-0 bg-white shadow-sm"
                style={{ width: "auto" }}
                value={sortBy}
                onChange={(e) => setFilter(setSortBy)(e.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="price_low">Price: Low → High</option>
                <option value="price_high">Price: High → Low</option>
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

          {/* ── Collapsible filters panel ── */}
          {showFilters && (
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Category</label>
                    <select
                      className="form-select"
                      value={categoryId}
                      onChange={(e) => setFilter(setCategoryId)(e.target.value ? Number(e.target.value) : "")}
                    >
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

          {/* ── Category quick-filter pills ── */}
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
                className={`btn btn-sm px-3 ${categoryId === c.category_id ? "btn-success" : "btn-outline-secondary bg-white"}`}
                onClick={() => setFilter(setCategoryId)(c.category_id)}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* ── Product grid ── */}
          {loading ? (
            <div className="text-center text-muted py-5">
              <div className="spinner-border text-success mb-3" role="status"></div>
              <div>Loading products…</div>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : products.length === 0 ? (
            <div className="text-center py-5 bg-white rounded-4 shadow-sm">
              <div className="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: 80, height: 80 }}>
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
                  const qty        = cartQty(p.product_id);
                  const stock      = p.inventory?.quantity_available ?? 0;
                  const outOfStock = stock === 0;
                  return (
                    <div key={p.product_id} className="col-sm-6 col-lg-4">
                      <div className="card border-0 shadow-sm h-100 product-card">
                        {/* Product image */}
                        <div className="position-relative" style={{ height: 180, overflow: "hidden" }}>
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="w-100 h-100 object-fit-cover"
                              style={{ borderRadius: "12px 12px 0 0" }}
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          {/* Fallback emoji placeholder */}
                          <div
                            className="w-100 h-100 d-flex align-items-center justify-content-center bg-light"
                            style={{ borderRadius: "12px 12px 0 0", fontSize: "3rem", display: p.image_url ? "none" : "flex" }}
                          >
                            🥬
                          </div>

                          {/* Out-of-stock badge */}
                          {outOfStock && (
                            <div className="position-absolute top-0 start-0 p-2">
                              <span className="badge bg-secondary" style={{ fontSize: "0.68rem" }}>Out of stock</span>
                            </div>
                          )}

                          {/* Verified badge top-right */}
                          {p.seller?.is_verified && (
                            <div className="position-absolute top-0 end-0 p-2">
                              <span className="badge bg-white text-success shadow-sm d-flex align-items-center gap-1"
                                style={{ fontSize: "0.68rem" }}>
                                <i className="bi bi-patch-check-fill"></i> Verified
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="card-body d-flex flex-column p-3">
                          {/* Category */}
                          <span className="text-muted" style={{ fontSize: "0.72rem" }}>
                            {p.category?.name ?? ""}
                          </span>

                          {/* Name */}
                          <h6 className="fw-bold mb-1 mt-1" style={{ fontSize: "0.9rem", lineHeight: 1.3 }}>
                            {p.name}
                          </h6>

                          {/* Description */}
                          <p className="text-muted mb-2" style={{
                            fontSize: "0.78rem", lineHeight: 1.5,
                            display: "-webkit-box", WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical", overflow: "hidden",
                          }}>
                            {p.description}
                          </p>

                          {/* Farmer */}
                          <div className="d-flex align-items-center gap-1 mb-2">
                            <i className="bi bi-person-circle text-muted" style={{ fontSize: "0.75rem" }}></i>
                            <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                              {p.seller?.name ?? "—"}
                            </span>
                          </div>

                          {/* Price + Add to cart */}
                          <div className="mt-auto">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="fw-bold text-success" style={{ fontSize: "1rem" }}>
                                KES {p.price}
                                <span className="text-muted fw-normal" style={{ fontSize: "0.75rem" }}>
                                  /{p.unit}
                                </span>
                              </span>
                              <span className="text-muted" style={{ fontSize: "0.72rem" }}>
                                {stock} {p.unit} left
                              </span>
                            </div>

                            {outOfStock ? (
                              <button className="btn btn-outline-secondary btn-sm w-100" disabled>
                                Out of stock
                              </button>
                            ) : qty === 0 ? (
                              <button
                                className="btn btn-success btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
                                onClick={() => addToCart({
                                  product_id:    p.product_id,
                                  name:          p.name,
                                  price:         p.price,
                                  stock_quantity: stock,
                                })}
                              >
                                <i className="bi bi-cart-plus"></i> Add to cart
                              </button>
                            ) : (
                              <div className="d-flex align-items-center justify-content-between gap-2">
                                <button
                                  className="btn btn-outline-success btn-sm px-3"
                                  onClick={() => removeFromCart(p.product_id)}
                                >
                                  <i className="bi bi-dash"></i>
                                </button>
                                <span className="fw-bold text-success">{qty}</span>
                                <button
                                  className="btn btn-outline-success btn-sm px-3"
                                  onClick={() => addToCart({
                                    product_id:    p.product_id,
                                    name:          p.name,
                                    price:         p.price,
                                    stock_quantity: stock,
                                  })}
                                >
                                  <i className="bi bi-plus"></i>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {lastPage > 1 && (
                <div className="d-flex justify-content-center gap-2 mt-4">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  <span className="btn btn-sm btn-light disabled" style={{ minWidth: 80 }}>
                    {currentPage} / {lastPage}
                  </span>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    disabled={currentPage === lastPage}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ════════════════════════════════════════════════════════════
            CART SIDEBAR
        ════════════════════════════════════════════════════════════ */}
        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm sticky-top" style={{ top: 80 }}>
            <div className="card-header bg-white border-bottom fw-bold d-flex align-items-center gap-2">
              <i className="bi bi-cart3 text-success"></i>
              Your cart
              {cart.length > 0 && (
                <span className="badge bg-success ms-auto">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </div>
            <div className="card-body p-3">
              {cart.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-cart text-muted" style={{ fontSize: "2.5rem" }}></i>
                  <p className="text-muted small mt-2 mb-0">
                    Your cart is empty.<br />Add produce to get started.
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ maxHeight: 320, overflowY: "auto" }}>
                    {cart.map((item) => (
                      <div
                        key={item.product_id}
                        className="d-flex justify-content-between align-items-center border-bottom py-2"
                      >
                        <div className="flex-grow-1 me-2">
                          <div className="fw-semibold" style={{ fontSize: "0.85rem" }}>{item.name}</div>
                          <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                            {item.quantity} × KES {item.price} ={" "}
                            <span className="text-success fw-semibold">
                              KES {item.quantity * item.price}
                            </span>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-1">
                          <button
                            className="btn btn-sm btn-outline-secondary px-2 py-0"
                            onClick={() => removeFromCart(item.product_id)}
                          >
                            <i className="bi bi-dash"></i>
                          </button>
                          <span className="fw-bold text-center" style={{ minWidth: 20, fontSize: "0.85rem" }}>
                            {item.quantity}
                          </span>
                          <button
                            className="btn btn-sm btn-outline-secondary px-2 py-0"
                            onClick={() => addToCart({
                              product_id:    item.product_id,
                              name:          item.name,
                              price:         item.price,
                              stock_quantity: item.stock_quantity,
                            })}
                          >
                            <i className="bi bi-plus"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-top pt-3 mt-2">
                    <div className="d-flex justify-content-between fw-bold mb-3">
                      <span>Total</span>
                      <span className="text-success fs-5">KES {cartTotal}</span>
                    </div>
                    <button
                      className="btn btn-success w-100 fw-semibold d-flex align-items-center justify-content-center gap-2"
                      onClick={() => navigate("/buyer/checkout")}
                    >
                      <i className="bi bi-bag-check"></i>
                      Proceed to checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
