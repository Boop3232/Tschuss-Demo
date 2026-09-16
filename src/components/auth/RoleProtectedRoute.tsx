import React from 'react';
import { ProtectedRoute } from './ProtectedRoute';
import { UserRole } from '../../types';

interface RoleProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles: UserRole[];
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      {children}
    </ProtectedRoute>
  );
};
