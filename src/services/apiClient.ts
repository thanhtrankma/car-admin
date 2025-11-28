import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  (import.meta.env.PROD ? '/api' : 'http://171.244.43.84:9004/honda');

declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuth?: boolean;
  }
  interface InternalAxiosRequestConfig {
    skipAuth?: boolean;
  }
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions extends AxiosRequestConfig {
  skipAuth?: boolean;
}

const getAccessToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (!config.skipAuth) {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status ?? 0;
    const message = error.response?.data?.message || error.message || 'Request failed';
    if (status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userRole');
    }
    return Promise.reject(new ApiError(status, message));
  }
);

export const apiRequest = async <T>(
  path: string,
  { method = 'GET', skipAuth, ...config }: RequestOptions = {}
): Promise<T> => {
  const response = await api.request<T>({
    url: path,
    method,
    skipAuth,
    ...config,
  });

  return response.data;
};


