"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useSession } from "./session";
import type { User } from "./types";

/**
 * The runtime auth view consumed by UI.
 *
 *   - `isLoggedIn` is **SSR-correct**: it's seeded on the server from the
 *     token cookie (see `auth/server.ts`) and stays correct on the client.
 *     UI gates that just need to know "show logged-in chrome or not" should
 *     read this — they'll render right on first paint, no mismatch.
 *
 *   - `user` is the full profile. It's `null` until the `/auth/account`
 *     query resolves, then fills in. Use it when you need the avatar / name
 *     / permissions; gate it with `?` rather than the layout. Pair with
 *     `isLoading` if you want to distinguish "loading" from "really null".
 */
export interface AuthContextValue {
  isLoggedIn: boolean;
  user: User | null;
  /** True while the initial `/auth/account` fetch is in flight. */
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export interface AuthBootProviderProps {
  /** Set by the server from the token cookie. Drives `isLoggedIn` on first paint. */
  initialIsLoggedIn: boolean;
  children: ReactNode;
}

export function AuthBootProvider({ initialIsLoggedIn, children }: AuthBootProviderProps) {
  const { user, isPending } = useSession();

  const value = useMemo<AuthContextValue>(() => {
    // Once the session query resolves with a user, that's authoritative.
    // If it resolves to null AND we're not loading, the cookie was stale —
    // reflect that immediately. While loading, trust the server-seeded value.
    const isLoggedIn = user ? true : isPending ? initialIsLoggedIn : false;
    return { isLoggedIn, user, isLoading: isPending };
  }, [initialIsLoggedIn, user, isPending]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthBootProvider> (mounted in src/app/layout.tsx)");
  }
  return ctx;
}
