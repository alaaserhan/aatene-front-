import { isAxiosError } from "axios";
import type { ApiResponse } from "./types";

export function hasInsufficientTryOnBalance(error: unknown): boolean {
  if (!isAxiosError<ApiResponse>(error) || error.response?.status !== 422) return false;
  const errors = error.response.data.errors;
  return !!errors && !Array.isArray(errors) && !!errors.coins?.length;
}

export function isTryOnDisabled(error: unknown): boolean {
  return isAxiosError<ApiResponse>(error) && error.response?.status === 403 && error.response.data.is_active === false;
}

export function getTryOnError(error: unknown, fallback: string): string {
  if (isAxiosError<ApiResponse>(error)) {
    const data = error.response?.data;
    const messages = Object.values(data?.errors ?? {}).flat();
    return messages[0] || data?.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
