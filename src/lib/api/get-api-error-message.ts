import { ApiClientError } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof ApiClientError) return error.message;
  if (error instanceof Error && error.message.length > 0) return error.message;
  return fallback;
}

export function isApiNotFoundError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.statusCode === 404 || error.code === 'not_found';
  }
  if (error instanceof ApiClientError) {
    return error.status === 404 || error.code === 'not_found';
  }
  return false;
}

export function isApiConflictError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.statusCode === 409 || error.code === 'conflict';
  }
  if (error instanceof ApiClientError) {
    return error.status === 409 || error.code === 'conflict';
  }
  return false;
}
