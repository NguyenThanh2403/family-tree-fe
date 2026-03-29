import type {
  LoginCredentials,
  RegisterPayload,
  SSOLoginPayload,
  User,
  LoginResponseData,
} from '@/types/auth.types';
import { MOCK_USER, nextId, now } from './data';

const delay = (ms = 350) => new Promise<void>((res) => setTimeout(res, ms));

// In-memory user store (survives module lifetime; resets on hard refresh)
let _currentUser: User = { ...MOCK_USER };

function makeTokenResponse(user: User): LoginResponseData {
  return {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    tokenType: 'Bearer',
    userId: user.userId ?? 1,
    username: user.username,
    email: user.email,
    expiresIn: 600,
  };
}

export const authMock = {
  login: async (credentials: LoginCredentials) => {
    await delay();
    // Accept any credential with password length >= 8, or specific demo creds
    const identifier = credentials.email ?? credentials.username ?? '';
    if (!identifier) throw new Error('Email hoặc username không được để trống');
    if ((credentials.password?.length ?? 0) < 8)
      throw new Error('Mật khẩu phải có ít nhất 8 ký tự');
    return makeTokenResponse(_currentUser);
  },

  ssoLogin: async (payload: SSOLoginPayload) => {
    await delay();
    return makeTokenResponse(_currentUser);
  },

  register: async (payload: RegisterPayload) => {
    await delay(500);
    _currentUser = {
      userId: Number(nextId().replace('mock-', '')),
      username: payload.username,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      displayName: `${payload.firstName} ${payload.lastName}`,
      locale: 'vi',
    };
    return makeTokenResponse(_currentUser);
  },

  logout: async () => {
    await delay(200);
  },

  me: async () => {
    await delay(200);
    return _currentUser;
  },

  updateProfile: async (
    patch: Partial<Pick<User, 'displayName' | 'firstName' | 'lastName' | 'avatarUrl' | 'locale'>>,
  ) => {
    await delay();
    _currentUser = { ..._currentUser, ...patch };
    return _currentUser;
  },

  changePassword: async (_currentPw: string, _newPw: string) => {
    await delay();
    if (_newPw.length < 8) throw new Error('Mật khẩu mới phải có ít nhất 8 ký tự');
  },
};
