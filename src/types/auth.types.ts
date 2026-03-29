export interface User {
  id?: string;
  userId?: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  avatarUrl?: string;
  locale?: 'en' | 'vi';
  createdAt?: string;
}

export interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
}

export interface SSOLoginPayload {
  provider: 'google' | 'facebook' | 'apple';
  token: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn: number;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  username: string;
  email: string;
  expiresIn: number;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
