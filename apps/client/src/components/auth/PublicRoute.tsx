
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/auth.context';

interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated === true) {
    const redirectPath = (location.state)?.from?.pathname || '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
