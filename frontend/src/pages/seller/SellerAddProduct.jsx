// SellerAddProduct — SokoMoja
// Wired to POST /api/seller/products and GET /api/categories

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { apiRequest } from "../../utils/api";

function SellerAddProduct() {
  const navigate = useNavigate();

  const navItems = [
    { label: "Dashboard",  icon: "bi-speedometer2",   path: "/seller/dashboard",   active: false },
    { label: "Products",   icon: "bi-flower2",        path: "/seller/products",    active: true  },
    { label: "Inventory",  icon: "bi-boxes",          path: "/seller/inventory",   active: false },
    { label: "Sales",      icon: "bi-receipt",        path: "/seller/sales",       active: false },
    { label: "Schedule",   icon: "bi-calendar-check", path: "/seller/schedule",    active: false },
    { label: "Orders",     icon: "bi-box-seam",       path: "/seller/orders",      active: false },
    { label: "Profile",    icon: "bi-person-circle",  path: "/seller/profile",     active: false },
  ];

  const [formData, setFormData] = useState({
    name:              "",
    category_id:       "",
    price:             "",
    unit:              "kg",
    initial_quantity:  "",
    low_stock_threshold: "10",
    description:       "",
    image_url:         "",
  });

  const [categories, setCategories] = useState([]);
  const [errors,     setErrors]     = useState({});
  const [loading,    setLoading]    = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Load categories on mount
  useEffect(() => {
    apiRequest("/categories")
      .then((res) => setCategories(res.data || []))
      .catch(() => {}); // non-critical — form still works without them
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim())
      newErrors.name = "Product name is required";
    if (!formData.category_id)
      newErrors.category_id = "Please select a category";
    if (!formData.price)
      newErrors.price = "Price is required";
    else if (isNaN(formData.price) || Number(formData.price) <= 0)
      newErrors.price = "Enter a valid price greater than 0";
    if (formData.initial_quantity === "")
      newErrors.initial_quantity = "Initial stock quantity is required";
    else if (isNaN(formData.initial_quantity) || Number(formData.initial_quantity) < 0)
      newErrors.initial_quantity = "Enter a valid stock quantity";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    if (!validate()) return;
    setLoading(true);

    try {
      await apiRequest("/seller/products", "POST", {
        name:                 formData.name,
        category_id:          Number(formData.category_id),
        description:          formData.description,
        price:                Number(formData.price),
        unit:                 formData.unit,
        initial_quantity:     Number(formData.initial_quantity),
        low_stock_threshold:  formData.low_stock_threshold !== "" ? Number(formData.low_stock_threshold) : undefined,
        image_url:            formData.image_url.trim() || undefined,
      });

      setSuccessMsg("Product listed successfully!");
      setTimeout(() => navigate("/seller/products"), 1200);
    } catch (err) {
      if (err.errors) {
        const mapped = {};
        Object.entries(err.errors).forEach(([k, v]) => { mapped[k] = v[0]; });
        setErrors(mapped);
      } else {
        setErrors({ general: err.message || "Failed to add product. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Add product" navItems={navItems}>

      {successMsg && (
        <div style={{ background: "#EAF3DE", color: "#27500A", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>
          ✅ {successMsg}
        </div>
      )}

      {errors.general && (
        <div className="auth-error-banner">⚠️ {errors.general}</div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="dash-table-wrap" style={{ padding: "24px" }}>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

            {/* ── LEFT COLUMN ── */}
            <div>

              <div className="form-group">
                <label htmlFor="name">Product name</label>
                <input
                  id="name" name="name" type="text"
                  placeholder="e.g. Fresh Tomatoes"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? "input-error" : ""}
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="category_id">Category</label>
                <select
                  id="category_id" name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className={errors.category_id ? "input-error" : ""}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && <span className="field-error">{errors.category_id}</span>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px" }}>
                <div className="form-group">
                  <label htmlFor="price">Price per unit (KES)</label>
                  <input
                    id="price" name="price" type="number" min="0" step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleChange}
                    className={errors.price ? "input-error" : ""}
                  />
                  {errors.price && <span className="field-error">{errors.price}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="unit">Unit</label>
                  <select id="unit" name="unit" value={formData.unit} onChange={handleChange}>
                    <option value="kg">kg</option>
                    <option value="crate">crate</option>
                    <option value="bunch">bunch</option>
                    <option value="litre">litre</option>
                    <option value="piece">piece</option>
                  </select>
                </div>
              </div>

            </div>

            {/* ── RIGHT COLUMN ── */}
            <div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div className="form-group">
                  <label htmlFor="initial_quantity">Initial stock qty</label>
                  <input
                    id="initial_quantity" name="initial_quantity" type="number" min="0"
                    placeholder="0"
                    value={formData.initial_quantity}
                    onChange={handleChange}
                    className={errors.initial_quantity ? "input-error" : ""}
                  />
                  {errors.initial_quantity && <span className="field-error">{errors.initial_quantity}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="low_stock_threshold">Low stock alert</label>
                  <input
                    id="low_stock_threshold" name="low_stock_threshold" type="number" min="0"
                    placeholder="10"
                    value={formData.low_stock_threshold}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description" name="description"
                  placeholder="Describe your produce — freshness, harvest date, growing method…"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className={errors.description ? "input-error" : ""}
                  style={{
                    fontSize: "14px", padding: "10px 14px",
                    border: `1px solid ${errors.description ? "#e74c3c" : "#e0ded5"}`,
                    borderRadius: "8px", background: "#f9f8f5",
                    fontFamily: "inherit", resize: "vertical", width: "100%", boxSizing: "border-box",
                  }}
                />
                {errors.description && <span className="field-error">{errors.description}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="image_url">Product image URL <span style={{ color: "#999", fontWeight: 400 }}>(optional)</span></label>
                <input
                  id="image_url" name="image_url" type="url"
                  placeholder="https://…"
                  value={formData.image_url}
                  onChange={handleChange}
                />
              </div>

            </div>
          </div>

          <button
            type="submit"
            className="btn-auth"
            style={{ marginTop: "10px", maxWidth: "240px" }}
            disabled={loading}
          >
            {loading ? "Saving…" : "Save listing"}
          </button>

        </div>
      </form>

    </DashboardLayout>
  );
}

export default SellerAddProduct;
