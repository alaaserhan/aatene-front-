"use client";

import { useQuery } from "@tanstack/react-query";
import { getAccount } from "./api";
import type { User } from "./types";
import { getAuthTokenClient } from "./cookies";
import { sessionQueryKey } from "./keys";

export type Session = User | null;

/**
 * Single source of truth for the authenticated user.
 *
 * - No token cookie → resolves to `null` without hitting the API.
 * - Token cookie → fetches /auth/account once per stale window.
 * - On 401 the axios interceptor force-signs-out; this query resolves to null.
 */
async function fetchSession(): Promise<Session> {
  const token = getAuthTokenClient();
  if (!token) return null;
  try {
    const res = await getAccount();
    return res?.user ?? null;
  } catch {
    return null;
  }
}

export function useSession() {
  const query = useQuery({
    queryKey: sessionQueryKey,
    queryFn: fetchSession,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    enabled: typeof window !== "undefined",
  });

  return {
    user: query.data ?? null,
    isAuthenticated: !!query.data,
    isPending: query.isPending,
    isReady: !query.isPending,
    refetch: query.refetch,
  };
}

export function useUser(): User | null {
  return useSession().user;
}

export function useIsAuthenticated(): boolean {
  return useSession().isAuthenticated;
}
