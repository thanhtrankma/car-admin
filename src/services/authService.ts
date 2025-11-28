import { apiRequest } from './apiClient';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  avatar_url?: string;
  phone_number?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  user: AuthUser;
}

export const login = (payload: LoginPayload) =>
  apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    data: payload,
    skipAuth: true,
  });

export const logout = () =>
  apiRequest<{ message: string }>('/auth/logout', {
    method: 'POST',
  });

export const getProfile = () =>
  apiRequest<AuthUser>('/users/me', {
    method: 'GET',
  });


