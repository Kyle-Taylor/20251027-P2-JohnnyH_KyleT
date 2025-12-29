// ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children, requiredRole }) {
  const token = useSelector((state) => state.auth.token);

  if (!token) {
    // Not logged in → redirect to login
    return <Navigate to="/login" replace />;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const roleSource =
      payload.role ||
      payload.roles?.[0] ||
      payload.authorities?.[0] ||
      payload.authority ||
      "GUEST";
    const normalizedRole = roleSource.toString().toUpperCase().replace(/^ROLE_/, "");
    if (requiredRole && ![].concat(requiredRole).includes(normalizedRole)) {
      // Role mismatch → redirect to forbidden or home
      return <Navigate to="/" replace />;
    }
  } catch (err) {
    // Invalid token → redirect to login
    return <Navigate to="/login" replace />;
  }

  // All good → render children
  return children;
}
