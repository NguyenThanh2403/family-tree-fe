import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthTokens, SSOLoginPayload } from '@/types/auth.types';
import { authApi } from '../api/auth.api';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (emailOrUsername: string, password: string) => Promise<void>;
  ssoLogin: (payload: SSOLoginPayload) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isLoading: false,
      error: null,

      login: async (emailOrUsername, password) => {
        set({ isLoading: true, error: null });
        try {
          const isEmail = emailOrUsername.includes('@');
          const responseData = await authApi.login({
            ...(isEmail ? { email: emailOrUsername } : { username: emailOrUsername }),
            password,
          });

          const tokens: AuthTokens = {
            accessToken: responseData.accessToken,
            refreshToken: responseData.refreshToken,
            tokenType: responseData.tokenType,
            expiresIn: responseData.expiresIn,
          };

          const user: User = {
            userId: responseData.userId,
            username: responseData.username,
            email: responseData.email,
            firstName: '',
            lastName: '',
          };

          localStorage.setItem('access_token', tokens.accessToken);
          localStorage.setItem('refresh_token', tokens.refreshToken);
          set({ user, tokens, isLoading: false });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Login failed';
          set({ isLoading: false, error: msg });
          throw err;
        }
      },

      ssoLogin: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const responseData = await authApi.ssoLogin(payload);

          const tokens: AuthTokens = {
            accessToken: responseData.accessToken,
            refreshToken: responseData.refreshToken,
            tokenType: responseData.tokenType,
            expiresIn: responseData.expiresIn,
          };

          const user: User = {
            userId: responseData.userId,
            username: responseData.username,
            email: responseData.email,
            firstName: '',
            lastName: '',
          };

          localStorage.setItem('access_token', tokens.accessToken);
          localStorage.setItem('refresh_token', tokens.refreshToken);
          set({ user, tokens, isLoading: false });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : `${payload.provider} login failed`;
          set({ isLoading: false, error: msg });
          throw err;
        }
      },

      register: async (username, email, password, firstName, lastName) => {
        set({ isLoading: true, error: null });
        try {
          const responseData = await authApi.register({
            username,
            email,
            password,
            firstName,
            lastName,
          });

          const tokens: AuthTokens = {
            accessToken: responseData.accessToken,
            refreshToken: responseData.refreshToken,
            tokenType: responseData.tokenType,
            expiresIn: responseData.expiresIn,
          };

          const user: User = {
            userId: responseData.userId,
            username: responseData.username,
            email: responseData.email,
            firstName,
            lastName,
          };

          localStorage.setItem('access_token', tokens.accessToken);
          localStorage.setItem('refresh_token', tokens.refreshToken);
          set({ user, tokens, isLoading: false });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Registration failed';
          set({ isLoading: false, error: msg });
          throw err;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // ignore logout errors
        } finally {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          set({ user: null, tokens: null });
        }
      },

      fetchMe: async () => {
        if (!get().tokens) return;
        set({ isLoading: true });
        try {
          const user = await authApi.me();
          set({ user, isLoading: false });
        } catch {
          set({ isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'family-tree-auth',
      partialize: (state) => ({ user: state.user, tokens: state.tokens }),
    },
  ),
);

// Derived selectors
export const selectIsAuthenticated = (s: AuthState) => !!s.user;
export const selectUser = (s: AuthState) => s.user;
