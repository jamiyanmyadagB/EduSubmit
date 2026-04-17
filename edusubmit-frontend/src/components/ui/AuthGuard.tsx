import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';

/**
 * AuthGuard component to ensure user sees login page first
 * Clears any stale authentication state on initial load
 */
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { logout } = useAuthStore();

  useEffect(() => {
    // Always clear authentication state to ensure login page shows first
    logout();
  }, [logout]);

  return <>{children}</>;
};

export default AuthGuard;
