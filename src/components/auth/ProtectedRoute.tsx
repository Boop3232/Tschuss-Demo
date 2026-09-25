import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthLoading } from './AuthLoading';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { currentUser, userProfile, loading, role } = useAuth();
  const location = useLocation();

  // 1. If Firebase Auth is still verifying session, render global clean loading screen
  if (loading) {
    return <AuthLoading message="Checking authentication session..." />;
  }

  // 2. If unauthenticated, redirect to /login and preserve destination for post-login return
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Enforce email verification for all real accounts (except dev mock sessions)
  const isDevMock = currentUser.uid.startsWith('dev_') || localStorage.getItem('tschuess_dev_mock_user') === 'true';
  if (!currentUser.emailVerified && !isDevMock) {
    return <Navigate to="/verify-email" state={{ email: currentUser.email, unverified: true }} replace />;
  }

  // 4. If specific roles are required (e.g. Retailer or Admin)
  if (allowedRoles && allowedRoles.length > 0) {
    // If user profile is still being retrieved from Firestore
    if (!userProfile) {
      return <AuthLoading message="Validating account permissions..." />;
    }

    const currentRole = role || userProfile.role || 'consumer';

    // If user role is not authorized
    if (!allowedRoles.includes(currentRole)) {
      console.warn(`Access denied for role '${currentRole}' to ${location.pathname}. Allowed: ${allowedRoles.join(', ')}`);

      // Consumer trying to access retailer/admin area -> redirect to consumer explore
      if (currentRole === 'consumer') {
        return <Navigate to="/app/discover" replace />;
      }

      // Retailer trying to access admin area -> redirect to retailer dashboard
      if (currentRole === 'retailer') {
        return <Navigate to="/business" replace />;
      }

      // Fallback
      return <Navigate to="/" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};
