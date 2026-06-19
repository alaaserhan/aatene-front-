"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/src/stores/auth-store";
import { useSession } from "@/src/auth/session";

/**
 * One-way bridge from the session React Query → the legacy Zustand store
 * so existing consumers of `useAuthStore` keep working.
 *
 * For SSR-correct auth-state gating, components should use `useAuth()` from
 * `@/src/auth` instead — that's seeded on the server. The store is a
 * client-side mirror; it lags the cookie by one paint and should only be
 * read for non-layout data (the user object).
 *
 * Mount once at the root (see app/layout.tsx).
 */
export function AuthHydrator() {
  const { user } = useSession();

  useEffect(() => {
    useAuthStore.getState()._setSession(user);
  }, [user]);

  return null;
}
