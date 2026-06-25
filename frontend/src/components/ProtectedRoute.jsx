// ProtectedRoute — SokoMoja
// Protects dashboard pages from unauthenticated or wrong-role access.
// Only three roles: buyer, seller, admin. Grocery ("both") removed.

import { Navigate } from "react-router-dom";
import { isAuthenticated, getUser } from "../utils/auth";

const ROLE_HOME = {
  buyer:  "/buyer/dashboard",
  seller: "/seller/dashboard",
  admin:  "/admin/overview",
};

function ProtectedRoute({ children, allowedRoles }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;

  const user = getUser();

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const redirectTo = ROLE_HOME[user.role] || "/login";
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

export default ProtectedRoute;
