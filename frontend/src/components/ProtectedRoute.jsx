import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Agar backend se user state load ho rahi hai to wait karein (redirect na karein)
  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 1. Agar user logged in nahi hai to login page par redirect karein
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Agar role match nahi hota to home page ya unauthorized block karein
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-3">
        <h2 className="text-3xl font-black text-rose-600">403 - Access Denied</h2>
        <p className="text-xs text-gray-500 font-semibold max-w-sm">
          Aapke paas Admin Dashboard access karne ki permission nahi hai. Aapka current role:{" "}
          <b className="uppercase text-gray-800">{user.role}</b>
        </p>
      </div>
    );
  }

  return children;
}