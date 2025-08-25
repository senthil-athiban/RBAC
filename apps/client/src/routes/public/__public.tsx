// src/routes/__public.tsx
import { Outlet } from '@tanstack/react-router';
import { PublicRoute } from '@/components/auth/PublicRoute';

export const Route = () => {
  return (
    <PublicRoute>
      <Outlet />
    </PublicRoute>
  );
};
