import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export const RoleRoute = ({ allowedRoles, children }) => {
  const { user } = useAuth();
  
  if (!user || !user.role || !allowedRoles.includes(user.role.name)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};
