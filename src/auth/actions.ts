import type { QueryClient } from "@tanstack/react-query";
import { deleteFCMToken } from "@/src/lib/firebase";
import { logoutUser } from "./api";
import type { User } from "./types";
import { clearAuthCookies, setAuthCookies } from "./cookies";
import { sessionQueryKey } from "./keys";

let signingOut = false;
/** Lets axios skip 401-redirect while a signOut is mid-flight. */
export const isSigningOut = (): boolean => signingOut;

type SignOutListener = () => void;
const signOutListeners = new Set<SignOutListener>();

/** Subscribe to sign-out. Listeners run synchronously after cookies clear, before redirect. */
export function onSignOut(listener: SignOutListener): () => void {
  signOutListeners.add(listener);
  return () => signOutListeners.delete(listener);
}

function fireSignOutListeners(): void {
  for (const listener of signOutListeners) {
    try {
      listener();
    } catch (err) {
      console.error("[auth] sign-out listener threw", err);
    }
  }
}

/** Establish a session. Used by both password login and OAuth callbacks. */
export function signIn(params: { token: string; user: User; queryClient: QueryClient }): void {
  const { token, user, queryClient } = params;
  setAuthCookies({
    token,
    user_type: user.user_type,
    admin_permissions: user.permissions ?? null,
  });
  queryClient.setQueryData(sessionQueryKey, user);
  void queryClient.invalidateQueries({ queryKey: sessionQueryKey });
}

/** Graceful sign-out: best-effort API call, clears state, hard-redirects. */
export async function signOut(opts: { queryClient: QueryClient; redirectTo: string }): Promise<void> {
  if (signingOut) return;
  signingOut = true;

  opts.queryClient.cancelQueries();
  await Promise.allSettled([deleteFCMToken(), logoutUser()]);

  clearAuthCookies();
  fireSignOutListeners();
  opts.queryClient.setQueryData(sessionQueryKey, null);
  opts.queryClient.clear();

  if (typeof window !== "undefined") {
    window.location.href = opts.redirectTo;
  }
}

/** Sync escape hatch for the axios 401 interceptor — no QueryClient, no awaits. */
export function forceSignOut(redirectTo: string): void {
  if (signingOut) return;
  signingOut = true;
  clearAuthCookies();
  fireSignOutListeners();
  if (typeof window !== "undefined") {
    window.location.href = redirectTo;
  }
}
