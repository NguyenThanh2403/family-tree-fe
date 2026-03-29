import apiClient from './client';
import type {
  LoginCredentials,
  RegisterPayload,
  AuthTokens,
  User,
  SSOLoginPayload,
  ApiResponse,
  LoginResponseData,
} from '@/types/auth.types';
import { authMock } from './mock/auth.mock';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

const _authApi = {
  login: async (credentials: LoginCredentials) => {
    const { data } = await apiClient.post<ApiResponse<LoginResponseData>>(
      '/auth/login',
      credentials,
    );
    return data.data;
  },

  ssoLogin: async (payload: SSOLoginPayload) => {
    const { data } = await apiClient.post<ApiResponse<LoginResponseData>>(
      '/auth/sso/login',
      payload,
    );
    return data.data;
  },

  register: async (payload: RegisterPayload) => {
    const { data } = await apiClient.post<ApiResponse<LoginResponseData>>(
      '/auth/register',
      payload,
    );
    return data.data;
  },

  logout: async () => {
    await apiClient.post('/auth/logout');
  },

  me: async () => {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },

  updateProfile: async (
    patch: Partial<Pick<User, 'displayName' | 'firstName' | 'lastName' | 'avatarUrl' | 'locale'>>,
  ) => {
    const { data } = await apiClient.patch<User>('/auth/me', patch);
    return data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    await apiClient.post('/auth/change-password', { currentPassword, newPassword });
  },
};

export const authApi = USE_MOCK ? authMock : _authApi;
