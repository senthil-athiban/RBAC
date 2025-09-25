
// src/routes/records/new.tsx
import NewRecordPage from '../../pages/NewRecordPage';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Permissions, PermissionTypes } from 'core';

export const Route = () => {
  return (
    <ProtectedRoute
      permissionType={PermissionTypes.RECORDS}
      permissions={Permissions.CREATE}
    >
      <NewRecordPage />
    </ProtectedRoute>
  );
};
