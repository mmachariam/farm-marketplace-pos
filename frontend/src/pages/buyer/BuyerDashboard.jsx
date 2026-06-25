// BuyerDashboard — SokoMoja Marketplace
// Styled after the reference MarketplacePage pattern:
// - Green hero section with embedded search bar
// - Product count + sort dropdown bar
// - Collapsible filters panel (category, price range, organic)
// - Category quick-filter pills
// - Product card grid with verified badge + star rating
// - Cart panel (sticky sidebar on large screens)
// No grocery/isGrocery logic.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { useCart } from "../../context/CartContext";

// ── Sample products (replace with apiRequest("/products") once backend is ready) ──
const sampleProducts = [
  { product_id: 1,  name: "Fresh Tomatoes",    description: "Vine-ripened red tomatoes, perfect for salads and cooking.",    price: 120, unit: "kg",    stock: 150, category_id: "cat-1", category: "Vegetables",      farmer: "John Kamau",   is_organic: true,  is_verified: true,  rating: 4.8, reviews: 24, image: "https://images.unsplash.com/photo-1546470427-227c7369a9b9?w=400&h=300&fit=crop" },
  { product_id: 2,  name: "Organic Spinach",   description: "Fresh leafy spinach, rich in iron and vitamins.",               price: 80,  unit: "kg",    stock: 80,  category_id: "cat-1", category: "Vegetables",      farmer: "Mary Wanjiku",  is_organic: true,  is_verified: true,  rating: 4.5, reviews: 18, image: "https://images.unsplash.com/photo-1576045057995-5b2b3a3c3c3a?w=400&h=300&fit=crop" },
  { product_id: 3,  name: "Sweet Potatoes",    description: "Orange-fleshed sweet potatoes, rich in vitamin A.",              price: 90,  unit: "kg",    stock: 200, category_id: "cat-2", category: "Roots & Tubers",  farmer: "Peter Ochieng", is_organic: false, is_verified: true,  rating: 4.2, reviews: 31, image: "https://images.unsplash.com/photo-1596097635121-14b8e3e0c188?w=400&h=300&fit=crop" },
  { product_id: 4,  name: "Fresh Avocados",    description: "Creamy Haas avocados, perfect for guacamole or salads.",         price: 180, unit: "kg",    stock: 120, category_id: "cat-3", category: "Fruits",          farmer: "John Kamau",   is_organic: true,  is_verified: true,  rating: 4.9, reviews: 45, image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b5a8?w=400&h=300&fit=crop" },
  { product_id: 5,  name: "Free Range Eggs",   description: "Farm-fresh eggs from free-range chickens.",                      price: 15,  unit: "piece", stock: 500, category_id: "cat-4", category: "Dairy & Eggs",    farmer: "Mary Wanjiku",  is_organic: true,  is_verified: true,  rating: 5.0, reviews: 67, image: "https://images.unsplash.com/photo-1598965675045-45c5e72c7d05?w=400&h=300&fit=crop" },
  { product_id: 6,  name: "Dry Maize",         description: "Quality dry maize from the North Rift.",                         price: 45,  unit: "kg",    stock: 1000,category_id: "cat-5", category: "Grains & Cereals",farmer: "Peter Ochieng", is_organic: true,  is_verified: true,  rating: 4.3, reviews: 28, image: "https://images.unsplash.com/photo-1551754655-cd27e38f67cf?w=400&h=300&fit=crop" },
  { product_id: 7,  name: "Passion Fruits",    description: "Sweet and tangy passion fruits, perfect for juice.",              price: 200, unit: "kg",    stock: 60,  category_id: "cat-3", category: "Fruits",          farmer: "John Kamau",   is_organic: true,  is_verified: true,  rating: 4.7, reviews: 19, image: "https://images.unsplash.com/photo-1559181567-c3190ca9951b?w=400&h=300&fit=crop" },
  { product_id: 8,  name: "Fresh Milk",        description: "Farm-fresh cow milk, pasteurized and ready to drink.",            price: 70,  unit: "litre", stock: 100, category_id: "cat-4", category: "Dairy & Eggs",    farmer: "Mary Wanjiku",  is_organic: true,  is_verified: true,  rating: 4.6, reviews: 52, image: "https://images.unsplash.com/photo-1550583724-b2692b45b9a0?w=400&h=300&fit=crop" },
  { product_id: 9,  name: "Kale (Sukuma Wiki)",description: "Freshly harvested kale, perfect for cooking.",                    price: 30,  unit: "kg",    stock: 5,   category_id: "cat-1", category: "Vegetables",      farmer: "Grace Njeri",   is_organic: false, is_verified: false, rating: 4.4, reviews: 11, image: "https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?w=400&h=300&fit=crop" },
  { product_id: 10, name: "Dry Beans",         description: "Red kidney beans, excellent source of protein.",                  price: 130, unit: "kg",    stock: 300, category_id: "cat-6", category: "Legumes",         farmer: "Samuel Kibet",  is_organic: true,  is_verified: true,  rating: 4.1, reviews: 9,  image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop" },
  { product_id: 11, name: "Carrots",           description: "Crisp, sweet carrots freshly dug from the farm.",                 price: 60,  unit: "kg",    stock: 80,  category_id: "cat-1", category: "Vegetables",      farmer: "David Omondi",  is_organic: false, is_verified: true,  rating: 4.5, reviews: 22, image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop" },
  { product_id: 12, name: "Bananas",           description: "Sweet ripe bananas, great for snacking or baking.",               price: 20,  unit: "kg",    stock: 0,   category_id: "cat-3", category: "Fruits",          farmer: "Lucy Achieng",  is_organic: true,  is_verified: true,  rating: 4.8, reviews: 33, image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop" },
];

const categories = [
  { id: "cat-1", name: "Vegetables" },
  { id: "cat-2", name: "Roots & Tubers" },
  { id: "cat-3", name: "Fruits" },
  { id: "cat-4", name: "Dairy & Eggs" },
  { id: "cat-5", name: "Grains & Cereals" },
  { id: "cat-6", name: "Legumes" },
];

// ── Star rating renderer ───────────────────────────────────────────────
function Stars({ rating }) {
  const full  = Math.round(rating);
  const empty = 5 - full;
  return (
    <span style={{ color: "#ffc107", fontSize: "0.78rem", letterSpacing: 1 }}>
      {"★".repeat(full)}
      <span style={{ color: "#dee2e6" }}>{"★".repeat(empty)}</span>
    </span>
  );
}

export default function BuyerDashboard() {
  const navigate  = useNavigate();
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
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sortBy,      setSortBy]      = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  // ── Filtered + sorted products ──────────────────────────────────────
  const filtered = sampleProducts
    .filter((p) => {
      if (search     && !p.name.toLowerCase().includes(search.toLowerCase()) &&
                        !p.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryId && p.category_id !== categoryId) return false;
      if (minPrice   && p.price < Number(minPrice))   return false;
      if (maxPrice   && p.price > Number(maxPrice))   return false;
      if (organicOnly && !p.is_organic)               return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price_low")  return a.price - b.price;
      if (sortBy === "price_high") return b.price - a.price;
      if (sortBy === "rating")     return b.rating - a.rating;
      return 0; // newest (default order)
    });

  const clearFilters = () => {
    setSearch(""); setCategoryId(""); setMinPrice(""); setMaxPrice("");
    setOrganicOnly(false); setSortBy("newest");
  };

  const activeFilterCount = [search, categoryId, minPrice, maxPrice, organicOnly].filter(Boolean).length;

  const organicCount = sampleProducts.filter((p) => p.is_organic).length;

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
                <span>{sampleProducts.length} Products</span>
              </div>
              <div className="d-flex align-items-center gap-2 rounded-3 px-3 py-2"
                style={{ background: "rgba(255,255,255,0.15)", fontSize: "0.85rem" }}>
                <i className="bi bi-flower2"></i>
                <span>{organicCount} Organic</span>
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
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button className="btn btn-light border-0" onClick={() => setSearch("")}>
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
            <span className="text-muted small">Showing <strong>{filtered.length}</strong> products</span>
            <div className="d-flex gap-2 align-items-center">
              <select
                className="form-select form-select-sm border-0 bg-white shadow-sm"
                style={{ width: "auto" }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="price_low">Price: Low → High</option>
                <option value="price_high">Price: High → Low</option>
                <option value="rating">Top rated</option>
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
            <div className="card border-0 shadow-sm mb-4 fade-in">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Category</label>
                    <select
                      className="form-select"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                    >
                      <option value="">All categories</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold">Min price (KES)</label>
                    <input type="number" className="form-control" placeholder="Min"
                      value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-semibold">Max price (KES)</label>
                    <input type="number" className="form-control" placeholder="Max"
                      value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                  </div>
                  <div className="col-md-2 d-flex align-items-end">
                    <button className="btn btn-outline-danger btn-sm w-100" onClick={clearFilters}>
                      Clear all
                    </button>
                  </div>
                </div>
                <div className="form-check mt-3">
                  <input type="checkbox" className="form-check-input" id="organicOnly"
                    checked={organicOnly} onChange={(e) => setOrganicOnly(e.target.checked)} />
                  <label className="form-check-label d-flex align-items-center gap-2" htmlFor="organicOnly">
                    <i className="bi bi-flower2 text-success"></i>
                    Organic products only
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ── Category quick-filter pills ── */}
          <div className="d-flex flex-wrap gap-2 mb-4">
            <button
              className={`btn btn-sm px-3 ${!categoryId ? "btn-success" : "btn-outline-secondary bg-white"}`}
              onClick={() => setCategoryId("")}
            >
              All products
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                className={`btn btn-sm px-3 ${categoryId === c.id ? "btn-success" : "btn-outline-secondary bg-white"}`}
                onClick={() => setCategoryId(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* ── Product grid ── */}
          {filtered.length === 0 ? (
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
            <div className="row g-3">
              {filtered.map((p) => {
                const qty = cartQty(p.product_id);
                const outOfStock = p.stock === 0;
                return (
                  <div key={p.product_id} className="col-sm-6 col-lg-4">
                    <div className="card border-0 shadow-sm h-100 product-card">
                      {/* Product image */}
                      <div className="position-relative" style={{ height: 180, overflow: "hidden" }}>
                        {p.image ? (
                          <img
                            src={p.image}
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
                          style={{ borderRadius: "12px 12px 0 0", fontSize: "3rem", display: "none" }}
                        >
                          🥬
                        </div>

                        {/* Badges overlay */}
                        <div className="position-absolute top-0 start-0 p-2 d-flex flex-column gap-1">
                          {p.is_organic && (
                            <span className="badge bg-success d-flex align-items-center gap-1" style={{ fontSize: "0.68rem" }}>
                              <i className="bi bi-flower2"></i> Organic
                            </span>
                          )}
                          {outOfStock && (
                            <span className="badge bg-secondary" style={{ fontSize: "0.68rem" }}>Out of stock</span>
                          )}
                        </div>

                        {/* Verified badge top-right */}
                        {p.is_verified && (
                          <div className="position-absolute top-0 end-0 p-2">
                            <span className="badge bg-white text-success shadow-sm d-flex align-items-center gap-1" style={{ fontSize: "0.68rem" }}>
                              <i className="bi bi-patch-check-fill"></i> Verified
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="card-body d-flex flex-column p-3">
                        {/* Category */}
                        <span className="text-muted" style={{ fontSize: "0.72rem" }}>{p.category}</span>

                        {/* Name */}
                        <h6 className="fw-bold mb-1 mt-1" style={{ fontSize: "0.9rem", lineHeight: 1.3 }}>{p.name}</h6>

                        {/* Description */}
                        <p className="text-muted mb-2" style={{ fontSize: "0.78rem", lineHeight: 1.5,
                          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {p.description}
                        </p>

                        {/* Farmer */}
                        <div className="d-flex align-items-center gap-1 mb-2">
                          <i className="bi bi-person-circle text-muted" style={{ fontSize: "0.75rem" }}></i>
                          <span className="text-muted" style={{ fontSize: "0.75rem" }}>{p.farmer}</span>
                        </div>

                        {/* Stars */}
                        <div className="d-flex align-items-center gap-1 mb-2">
                          <Stars rating={p.rating} />
                          <span className="text-muted" style={{ fontSize: "0.72rem" }}>({p.reviews})</span>
                        </div>

                        {/* Price + Add to cart */}
                        <div className="mt-auto">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="fw-bold text-success" style={{ fontSize: "1rem" }}>
                              KES {p.price}
                              <span className="text-muted fw-normal" style={{ fontSize: "0.75rem" }}>/{p.unit}</span>
                            </span>
                            <span className="text-muted" style={{ fontSize: "0.72rem" }}>{p.stock} {p.unit} left</span>
                          </div>

                          {outOfStock ? (
                            <button className="btn btn-outline-secondary btn-sm w-100" disabled>
                              Out of stock
                            </button>
                          ) : qty === 0 ? (
                            <button
                              className="btn btn-success btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
                              onClick={() => addToCart({ product_id: p.product_id, name: p.name, price: p.price, stock_quantity: p.stock })}
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
                                onClick={() => addToCart({ product_id: p.product_id, name: p.name, price: p.price, stock_quantity: p.stock })}
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
                <span className="badge bg-success ms-auto">{cart.reduce((s, i) => s + i.quantity, 0)}</span>
              )}
            </div>
            <div className="card-body p-3">
              {cart.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-cart text-muted" style={{ fontSize: "2.5rem" }}></i>
                  <p className="text-muted small mt-2 mb-0">Your cart is empty.<br />Add produce to get started.</p>
                </div>
              ) : (
                <>
                  <div style={{ maxHeight: 320, overflowY: "auto" }}>
                    {cart.map((item) => (
                      <div key={item.product_id} className="d-flex justify-content-between align-items-center border-bottom py-2">
                        <div className="flex-grow-1 me-2">
                          <div className="fw-semibold" style={{ fontSize: "0.85rem" }}>{item.name}</div>
                          <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                            {item.quantity} × KES {item.price} = <span className="text-success fw-semibold">KES {item.quantity * item.price}</span>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-1">
                          <button className="btn btn-sm btn-outline-secondary px-2 py-0"
                            onClick={() => removeFromCart(item.product_id)}>
                            <i className="bi bi-dash"></i>
                          </button>
                          <span className="fw-bold text-center" style={{ minWidth: 20, fontSize: "0.85rem" }}>{item.quantity}</span>
                          <button className="btn btn-sm btn-outline-secondary px-2 py-0"
                            onClick={() => addToCart({ product_id: item.product_id, name: item.name, price: item.price, stock_quantity: 999 })}>
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
