import { createFileRoute } from '@tanstack/react-router'
import { LoginPage } from '@/pages/auth/LoginPage';

// This is the correct way. No path argument is needed here.
export const Route = createFileRoute('/login')({
  component: LoginPage,
});