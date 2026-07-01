// App.jsx — SokoMoja (final)
// /marketplace is PUBLIC — no login required.
// All dashboard routes remain protected by role.

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Public pages
import LandingPage        from "./pages/LandingPage";
import PublicMarketplace  from "./pages/PublicMarketplace";   // ← NEW
import LoginPage          from "./pages/LoginPage";
import RegisterPage       from "./pages/RegisterPage";
import ForgotPassword     from "./pages/ForgotPassword";
import NotFound           from "./pages/NotFound";

// Buyer pages
import BuyerDashboard     from "./pages/buyer/BuyerDashboard";
import Checkout           from "./pages/buyer/Checkout";
import MyOrders           from "./pages/buyer/MyOrders";
import OrderTracking      from "./pages/buyer/OrderTracking";
import BuyerProfile       from "./pages/buyer/BuyerProfile";

// Seller / Farmer pages
import SellerDashboard    from "./pages/seller/SellerDashboard";
import SellerProducts     from "./pages/seller/SellerProducts";
import SellerAddProduct   from "./pages/seller/SellerAddProduct";
import FarmerInventory    from "./pages/seller/FarmerInventory";
import FarmerSales        from "./pages/seller/FarmerSales";
import FarmerSchedule     from "./pages/seller/FarmerSchedule";
import SellerOrders       from "./pages/seller/SellerOrders";
import SellerProfile      from "./pages/seller/SellerProfile";

// Admin pages
import AdminOverview      from "./pages/admin/AdminOverview";
import AdminUsers         from "./pages/admin/AdminUsers";
import AdminZones         from "./pages/admin/AdminZones";
import AdminReports       from "./pages/admin/AdminReports";
import AdminProfile       from "./pages/admin/AdminProfile";
import AdminFarmerDetail  from "./pages/admin/AdminFarmerDetail";

import "./styles/index.css";

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>

          {/* ── PUBLIC — no login required ─────────────────────── */}
          <Route path="/"             element={<LandingPage />} />
          <Route path="/marketplace"  element={<PublicMarketplace />} />  {/* ← NEW */}
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/register"     element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* ── BUYER ──────────────────────────────────────────── */}
          <Route path="/buyer/dashboard" element={
            <ProtectedRoute allowedRoles={["buyer"]}><BuyerDashboard /></ProtectedRoute>
          }/>
          <Route path="/buyer/checkout" element={
            <ProtectedRoute allowedRoles={["buyer"]}><Checkout /></ProtectedRoute>
          }/>
          <Route path="/buyer/orders" element={
            <ProtectedRoute allowedRoles={["buyer"]}><MyOrders /></ProtectedRoute>
          }/>
          <Route path="/buyer/orders/:orderId" element={
            <ProtectedRoute allowedRoles={["buyer"]}><OrderTracking /></ProtectedRoute>
          }/>
          <Route path="/buyer/profile" element={
            <ProtectedRoute allowedRoles={["buyer"]}><BuyerProfile /></ProtectedRoute>
          }/>

          {/* ── SELLER / FARMER ────────────────────────────────── */}
          <Route path="/seller/dashboard" element={
            <ProtectedRoute allowedRoles={["seller"]}><SellerDashboard /></ProtectedRoute>
          }/>
          <Route path="/seller/products" element={
            <ProtectedRoute allowedRoles={["seller"]}><SellerProducts /></ProtectedRoute>
          }/>
          <Route path="/seller/products/add" element={
            <ProtectedRoute allowedRoles={["seller"]}><SellerAddProduct /></ProtectedRoute>
          }/>
          <Route path="/seller/inventory" element={
            <ProtectedRoute allowedRoles={["seller"]}><FarmerInventory /></ProtectedRoute>
          }/>
          <Route path="/seller/sales" element={
            <ProtectedRoute allowedRoles={["seller"]}><FarmerSales /></ProtectedRoute>
          }/>
          <Route path="/seller/schedule" element={
            <ProtectedRoute allowedRoles={["seller"]}><FarmerSchedule /></ProtectedRoute>
          }/>
          <Route path="/seller/orders" element={
            <ProtectedRoute allowedRoles={["seller"]}><SellerOrders /></ProtectedRoute>
          }/>
          <Route path="/seller/profile" element={
            <ProtectedRoute allowedRoles={["seller"]}><SellerProfile /></ProtectedRoute>
          }/>

          {/* ── ADMIN ──────────────────────────────────────────── */}
          <Route path="/admin/overview" element={
            <ProtectedRoute allowedRoles={["admin"]}><AdminOverview /></ProtectedRoute>
          }/>
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>
          }/>
          <Route path="/admin/zones" element={
            <ProtectedRoute allowedRoles={["admin"]}><AdminZones /></ProtectedRoute>
          }/>
          <Route path="/admin/reports" element={
            <ProtectedRoute allowedRoles={["admin"]}><AdminReports /></ProtectedRoute>
          }/>
          <Route path="/admin/profile" element={
            <ProtectedRoute allowedRoles={["admin"]}><AdminProfile /></ProtectedRoute>
          }/>
          <Route path="/admin/farmers/:farmerId" element={
            <ProtectedRoute allowedRoles={["admin"]}><AdminFarmerDetail /></ProtectedRoute>
          }/>

          {/* ── 404 — must be last ─────────────────────────────── */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
