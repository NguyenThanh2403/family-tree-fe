'use client';

import { useAuthStore, selectIsAuthenticated, selectUser } from '@/core/store/auth.store';

export function useAuth() {
  const user = useAuthStore(selectUser);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const login = useAuthStore((s) => s.login);
  const ssoLogin = useAuthStore((s) => s.ssoLogin);
  const register = useAuthStore((s) => s.register);
  const logout = useAuthStore((s) => s.logout);
  const clearError = useAuthStore((s) => s.clearError);

  return { user, isAuthenticated, isLoading, error, login, ssoLogin, register, logout, clearError };
}
