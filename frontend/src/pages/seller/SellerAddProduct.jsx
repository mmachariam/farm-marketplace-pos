// ===========================================
// SELLER - ADD PRODUCT PAGE
// Form for farmers/sellers to list a new product.
//
// Maps directly to the `products` + `inventory` tables:
// - product_name, category_id, description, price, image_url → products
// - stock_quantity → inventory (created alongside the product)
//
// Flow:
// 1. Seller fills the form
// 2. Frontend validates required fields
// 3. POST /api/seller/products (wired later)
// 4. On success, redirect to /seller/products
// ===========================================

import { useState } from "react";
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

  // ---- FORM STATE ----
  const [formData, setFormData] = useState({
    productName: "",
    categoryId: "",
    price: "",
    unit: "kg",
    stockQuantity: "",
    description: "",
    image: null, // File object, handled separately from text fields
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // ---- HARDCODED CATEGORIES ----
  // Later: fetch from GET /api/categories (matches the `categories` table)
  const categories = [
    { category_id: 1, category_name: "Vegetables" },
    { category_id: 2, category_name: "Cereals" },
    { category_id: 3, category_name: "Fruits" },
    { category_id: 4, category_name: "Dairy" },
  ];

  // ---- GENERIC CHANGE HANDLER for text/select inputs ----
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ---- FILE INPUT HANDLER ----
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, image: file }));
  };

  // ---- VALIDATION ----
  const validate = () => {
    const newErrors = {};

    if (!formData.productName.trim())
      newErrors.productName = "Product name is required";

    if (!formData.categoryId)
      newErrors.categoryId = "Please select a category";

    if (!formData.price)
      newErrors.price = "Price is required";
    else if (isNaN(formData.price) || Number(formData.price) <= 0)
      newErrors.price = "Enter a valid price greater than 0";

    if (!formData.stockQuantity)
      newErrors.stockQuantity = "Initial stock quantity is required";
    else if (isNaN(formData.stockQuantity) || Number(formData.stockQuantity) < 0)
      newErrors.stockQuantity = "Enter a valid stock quantity";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---- SUBMIT HANDLER ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");

    if (!validate()) return;

    setLoading(true);

    try {
      // TODO: Replace with real API call once backend is ready.
      // Since we're uploading a file, use FormData instead of JSON:
      //
      // const form = new FormData();
      // form.append("product_name", formData.productName);
      // form.append("category_id", formData.categoryId);
      // form.append("price", formData.price);
      // form.append("stock_quantity", formData.stockQuantity);
      // form.append("description", formData.description);
      // if (formData.image) form.append("image", formData.image);
      //
      // const response = await fetch("http://localhost:8000/api/seller/products", {
      //   method: "POST",
      //   headers: { Authorization: `Bearer ${getToken()}` }, // no Content-Type - browser sets it for FormData
      //   body: form,
      // });
      // if (!response.ok) throw new Error("Failed to add product");

      // TEMPORARY: simulate success
      await new Promise((res) => setTimeout(res, 1000));
      console.log("New product:", formData);

      setSuccessMsg("Product listed successfully!");

      // Redirect back to the products list after a short pause
      setTimeout(() => navigate("/seller/products"), 1200);

    } catch (err) {
      setErrors({ general: err.message || "Failed to add product. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Add product" navItems={navItems}>

      {/* Success message */}
      {successMsg && (
        <div style={{ background: "#EAF3DE", color: "#27500A", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>
          ✅ {successMsg}
        </div>
      )}

      {/* General error message */}
      {errors.general && (
        <div className="auth-error-banner">⚠️ {errors.general}</div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="dash-table-wrap" style={{ padding: "24px" }}>

          {/* Two-column layout for the form fields */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

            {/* ---- LEFT COLUMN ---- */}
            <div>

              {/* Product name */}
              <div className="form-group">
                <label htmlFor="productName">Product name</label>
                <input
                  id="productName"
                  name="productName"
                  type="text"
                  placeholder="e.g. Tomatoes"
                  value={formData.productName}
                  onChange={handleChange}
                  className={errors.productName ? "input-error" : ""}
                />
                {errors.productName && <span className="field-error">{errors.productName}</span>}
              </div>

              {/* Category */}
              <div className="form-group">
                <label htmlFor="categoryId">Category</label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className={errors.categoryId ? "input-error" : ""}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <span className="field-error">{errors.categoryId}</span>}
              </div>

              {/* Price + Unit side by side */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px" }}>
                <div className="form-group">
                  <label htmlFor="price">Price per unit (KES)</label>
                  <input
                    id="price"
                    name="price"
                    type="number"
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
                  </select>
                </div>
              </div>

            </div>

            {/* ---- RIGHT COLUMN ---- */}
            <div>

              {/* Initial stock quantity */}
              <div className="form-group">
                <label htmlFor="stockQuantity">Initial stock quantity</label>
                <input
                  id="stockQuantity"
                  name="stockQuantity"
                  type="number"
                  placeholder="0"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  className={errors.stockQuantity ? "input-error" : ""}
                />
                {errors.stockQuantity && <span className="field-error">{errors.stockQuantity}</span>}
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe your produce — freshness, harvest date, etc."
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  style={{
                    fontSize: "14px",
                    padding: "10px 14px",
                    border: "1px solid #e0ded5",
                    borderRadius: "8px",
                    background: "#f9f8f5",
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Product image */}
              <div className="form-group">
                <label htmlFor="image">Product image</label>
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {formData.image && (
                  <span style={{ fontSize: "12px", color: "#73726c" }}>
                    Selected: {formData.image.name}
                  </span>
                )}
              </div>

            </div>
          </div>

          {/* ---- SUBMIT BUTTON ---- */}
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
