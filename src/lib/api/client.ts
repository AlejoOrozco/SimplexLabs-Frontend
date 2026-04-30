import { z } from 'zod';
import { endpoints, apiSuccessEnvelopeSchema } from '@/lib/api/endpoints';
import { ApiError, normalizeApiError } from '@/lib/api/errors';
import { eventBus } from '@/lib/realtime/event-bus';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
const REQUEST_TIMEOUT_MS = 30_000;

const NON_RETRYABLE_CODES = new Set(['conflict', 'payload_too_large', 'illegal_state']);
const IDEMPOTENT_METHODS = new Set(['GET', 'PUT']);

interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
  isIdempotent?: boolean;
}

function buildUrl(path: string, query?: ApiFetchOptions['query']): string {
  const normalizedBase = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  const relativePath = path.startsWith('/') ? path : `/${path}`;
  const rawUrl = normalizedBase ? `${normalizedBase}${relativePath}` : relativePath;
  const url = new URL(rawUrl, 'http://localhost:3000');
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined) return;
      url.searchParams.set(key, String(value));
    });
  }
  if (normalizedBase) return url.toString();
  return `${url.pathname}${url.search}`;
}

function createAbortSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

async function executeFetch<T>(url: string, options: ApiFetchOptions, correlationId: string): Promise<T> {
  const response = await fetch(url, {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
      'x-correlation-id': correlationId,
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: createAbortSignal(REQUEST_TIMEOUT_MS),
  });

  if (response.ok) {
    const envelopeJson: unknown = await response.json();
    const parsedEnvelope = apiSuccessEnvelopeSchema(z.unknown()).safeParse(envelopeJson);
    if (!parsedEnvelope.success) {
      throw new ApiError({
        message: 'Malformed response envelope',
        code: 'bad_request',
        statusCode: 400,
        correlationId,
      });
    }
    return parsedEnvelope.data.data as T;
  }

  const errorJson: unknown = await response.json().catch(() => undefined);
  throw normalizeApiError(errorJson, response.headers.get('retry-after'));
}

async function maybeRefresh(): Promise<boolean> {
  const refreshUrl = buildUrl(endpoints.auth.refresh.path);
  const correlationId = crypto.randomUUID();
  try {
    await executeFetch(refreshUrl, { method: 'POST' }, correlationId);
    return true;
  } catch {
    return false;
  }
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const correlationId = crypto.randomUUID();
  const method = options.method ?? 'GET';
  const url = buildUrl(path, options.query);
  const canRetry5xx = options.isIdempotent || IDEMPOTENT_METHODS.has(method);
  let hasRetriedAfterRefresh = false;

  let attempt = 0;
  while (attempt < 4) {
    try {
      return await executeFetch<T>(url, options, correlationId);
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;
      if (error.statusCode === 403) {
        eventBus.emit('auth:forbidden', undefined);
        throw error;
      }
      if (error.statusCode === 401) {
        if (path === endpoints.auth.refresh.path) {
          eventBus.emit('session:expired', { reason: 'refresh_unauthorized' });
          throw error;
        }
        if (!hasRetriedAfterRefresh) {
          const refreshed = await maybeRefresh();
          if (!refreshed) {
            eventBus.emit('session:expired', { reason: 'refresh_failed' });
            throw error;
          }
          hasRetriedAfterRefresh = true;
          attempt += 1;
          continue;
        }
        eventBus.emit('session:expired', { reason: 'request_unauthorized_after_refresh' });
        throw error;
      }
      if (error.statusCode === 429) throw error;
      if (error.statusCode >= 500 && canRetry5xx && attempt < 3) {
        const backoff = [250, 1000, 3000][attempt] ?? 3000;
        const jitter = backoff * (0.5 + Math.random());
        await new Promise((resolve) => setTimeout(resolve, jitter));
        attempt += 1;
        continue;
      }
      if (NON_RETRYABLE_CODES.has(error.code)) throw error;
      throw error;
    }
  }

  throw new ApiError({
    message: 'Request failed after retries',
    code: 'internal',
    statusCode: 500,
    correlationId,
  });
}
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
      const isForbidden = error.response?.status === 403;
      const isRefreshCall = originalRequest?.url?.includes('/auth/refresh');

       if (isForbidden) {
        eventBus.emit('auth:forbidden', undefined);
      }

      if (isUnauthorized && originalRequest && !originalRequest._retry && !isRefreshCall) {
        originalRequest._retry = true;
        try {
          await instance.post('/auth/refresh');
          return instance(originalRequest);
        } catch (refreshError) {
          eventBus.emit('session:expired', { reason: 'refresh_failed' });
          if (onAuthFailure) onAuthFailure();
          const details = extractErrorMessage(
            refreshError instanceof AxiosError ? refreshError : error,
          );
          throw new ApiClientError(details.message, 401, details.code, details.details);
        }
      }

      if (isUnauthorized && isRefreshCall) {
        eventBus.emit('session:expired', { reason: 'refresh_unauthorized' });
        if (onAuthFailure) onAuthFailure();
      }

      if (isUnauthorized && (!originalRequest || originalRequest._retry === true)) {
        eventBus.emit('session:expired', { reason: 'request_unauthorized_after_refresh' });
        if (onAuthFailure) onAuthFailure();
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
