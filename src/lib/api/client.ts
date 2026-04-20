import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiResponse } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL && typeof window !== 'undefined') {
  // Visible warning in dev so missing env is obvious.
  // eslint-disable-next-line no-console
  console.warn('[api] NEXT_PUBLIC_API_URL is not set.');
}

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export class ApiClientError extends Error {
  public readonly status: number | null;
  public readonly code: string | null;
  public readonly details: unknown;

  public constructor(
    message: string,
    status: number | null,
    code: string | null,
    details: unknown,
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type AuthFailureHandler = () => void;

let onAuthFailure: AuthFailureHandler | null = null;

export function setAuthFailureHandler(handler: AuthFailureHandler | null): void {
  onAuthFailure = handler;
}

function extractErrorMessage(error: AxiosError): {
  message: string;
  code: string | null;
  details: unknown;
} {
  const data = error.response?.data as
    | { error?: { message?: string; code?: string; details?: unknown }; message?: string }
    | undefined;

  if (data?.error?.message) {
    return {
      message: data.error.message,
      code: data.error.code ?? null,
      details: data.error.details,
    };
  }

  if (typeof data?.message === 'string') {
    return { message: data.message, code: null, details: null };
  }

  return { message: error.message || 'Request failed', code: null, details: null };
}

function createApiClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  instance.interceptors.response.use(
    (response) => {
      const body = response.data as ApiResponse<unknown> | unknown;
      if (
        body !== null &&
        typeof body === 'object' &&
        'success' in body &&
        'data' in body &&
        (body as { success: unknown }).success === true
      ) {
        response.data = (body as ApiResponse<unknown>).data;
      }
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as RetriableRequestConfig | undefined;

      const isUnauthorized = error.response?.status === 401;
      const isRefreshCall = originalRequest?.url?.includes('/auth/refresh');

      if (isUnauthorized && originalRequest && !originalRequest._retry && !isRefreshCall) {
        originalRequest._retry = true;
        try {
          await instance.post('/auth/refresh');
          return instance(originalRequest);
        } catch (refreshError) {
          if (onAuthFailure) onAuthFailure();
          const details = extractErrorMessage(
            refreshError instanceof AxiosError ? refreshError : error,
          );
          throw new ApiClientError(details.message, 401, details.code, details.details);
        }
      }

      const details = extractErrorMessage(error);
      throw new ApiClientError(
        details.message,
        error.response?.status ?? null,
        details.code,
        details.details,
      );
    },
  );

  return instance;
}

export const apiClient = createApiClient();

export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.get<T>(url, config);
  return response.data;
}

export async function apiPost<T, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.post<T>(url, body, config);
  return response.data;
}

export async function apiPut<T, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.put<T>(url, body, config);
  return response.data;
}

export async function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.delete<T>(url, config);
  return response.data;
}
