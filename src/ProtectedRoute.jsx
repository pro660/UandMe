import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import useUserStore from "./api/userStore";

const ProtectedRoute = ({ children }) => {
  const { user, isInitialized } = useUserStore();
  const location = useLocation();

  if (!isInitialized) return <div>Loading...</div>;

  const hasToken = !!user?.accessToken;

  if (!hasToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
