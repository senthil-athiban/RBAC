
// src/routes/dashboard.tsx
import { DashboardPage } from '../pages/DashboardPage';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { Permissions, PermissionTypes } from 'core';

export const Route = () => {
  return (
    <ProtectedRoute
      permissionType={PermissionTypes.RECORDS}
      permissions={Permissions.READ}
    >
      <DashboardPage />
    </ProtectedRoute>
  );
};
