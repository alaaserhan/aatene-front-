import { create } from "zustand";
import type { User } from "../auth/types";
import { clearAuthCookies, setAuthCookies } from "../auth/cookies";

/**
 * Reactive snapshot of the current session for non-React-Query consumers.
 *
 * Source of truth is `useSession()` (src/auth/session). The AuthHydrator
 * component mirrors that query into this store so existing selectors keep
 * working without each consumer subscribing to React Query directly.
 *
 * For SSR-correct auth-state gating, use `useAuth()` from `@/src/auth` — its
 * `isLoggedIn` is seeded on the server from the token cookie. The store's
 * `isLoggedIn` is client-only (lags one paint behind the cookie).
 *
 * New code should prefer `useAuth`, `useSession`, `useUser`, `useIsAuthenticated`.
 */
interface AuthState {
  user: User | null;
  isLoggedIn: boolean;

  /** Internal: AuthHydrator uses this to mirror the session query. */
  _setSession: (user: User | null) => void;

  /** Locally merge a partial user update (e.g. after profile edit). */
  updateUser: (partial: Partial<User>) => void;

  /** @deprecated use `signIn` from `@/src/auth`. */
  login: (token: string, user: User) => void;
  /** @deprecated use `signOut` from `@/src/auth`. */
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isLoggedIn: false,

  _setSession: (user) => set({ user, isLoggedIn: !!user }),

  updateUser: (partial) => {
    const current = get().user;
    if (!current) return;
    set({ user: { ...current, ...partial } });
  },

  login: (token, user) => {
    setAuthCookies({
      token,
      user_type: user.user_type,
      admin_permissions: user.permissions ?? null,
    });
    set({ user, isLoggedIn: true });
  },

  logout: () => {
    clearAuthCookies();
    set({ user: null, isLoggedIn: false });
  },
}));
