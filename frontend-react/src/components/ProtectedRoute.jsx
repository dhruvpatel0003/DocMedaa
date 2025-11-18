import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppConstants } from '../constants/AppConstants';

// Protected Route Component
export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, isInitialized, user } = useAuth();
  console.log("inside protected routes  : isAuthenticated, isInitialized, user", isAuthenticated, isInitialized,user.role.toLowerCase(), requiredRole);
  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
      }}>
        Loading...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={AppConstants.routes.login} replace />;
  }

  // Check role-based access
  if (requiredRole && user.role.toLowerCase() !== requiredRole) {
    console.log('inside the if statement of required role mismatch');
    return <Navigate to={AppConstants.routes.dashboard} replace />;
  }

  return children;
};

// Public Route Component (redirects to dashboard if already logged in)
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuth();

  if (!isInitialized) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
      }}>
        Loading...
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={AppConstants.routes.dashboard} replace />;
  }

  return children;
};

export default ProtectedRoute;