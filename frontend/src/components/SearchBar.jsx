// SearchBar — SokoMoja
// On the landing page, submitting the search navigates to
// /marketplace?search=... so the full marketplace opens with the
// search pre-applied.

import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SearchBar() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [category,   setCategory]   = useState("");
  const [region,     setRegion]     = useState("");

  const handleSearch = () => {
    // Build query string and navigate to public marketplace
    const params = new URLSearchParams();
    if (searchTerm) params.set("search",   searchTerm);
    if (category)   params.set("category", category);
    if (region)     params.set("region",   region);
    navigate(`/marketplace?${params.toString()}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="py-3 border-bottom" style={{ background: "#f8f9fa" }}>
      <div className="container">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-5">
            <input
              type="text"
              className="form-control"
              placeholder="Search tomatoes, maize, sukuma wiki…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="col-6 col-md-3">
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All categories</option>
              <option value="vegetables">Vegetables</option>
              <option value="cereals">Cereals</option>
              <option value="dairy">Dairy</option>
              <option value="fruits">Fruits</option>
            </select>
          </div>
          <div className="col-6 col-md-3">
            <select
              className="form-select"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="">All regions</option>
              <option value="kiambu">Kiambu</option>
              <option value="nakuru">Nakuru</option>
              <option value="meru">Meru</option>
              <option value="nairobi">Nairobi</option>
            </select>
          </div>
          <div className="col-12 col-md-1">
            <button
              className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-1"
              onClick={handleSearch}
            >
              <i className="bi bi-search"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchBar;
