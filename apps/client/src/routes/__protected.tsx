// src/routes/__protected.tsx
import { Outlet } from '@tanstack/react-router';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { Permissions, PermissionTypes } from 'core';

export const Route = () => {
  // We can wrap the outlet in a ProtectedRoute with default settings
  return (
    <ProtectedRoute
      permissionType={PermissionTypes.RECORDS}
      permissions={Permissions.READ}
    >
      <Outlet />
    </ProtectedRoute>
  );
};
