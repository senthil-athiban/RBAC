import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth.context';
import { Permissions, PermissionTypes } from 'core';
import useHasAccess from '@/hooks/useHasAccess';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permissionType?: PermissionTypes;
  permissions?: Permissions | Permissions[]
}

export function ProtectedRoute({ children , permissionType, permissions}: ProtectedRouteProps) {
  const { isLoading, isAuthenticated } = useAuth();
  // console.log('ProtectedRoute isAuthenticated:', isAuthenticated);  
  const location = useLocation();
  const hasAccess = useHasAccess({ permissionType, permissions });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated === false || isAuthenticated === null) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if(!hasAccess && permissionType && permissions) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}