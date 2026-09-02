import Cookies from "js-cookie";

/**
 * The "store-context" describes which merchant store the user is currently
 * operating in (for the dashboard). It's a session-scoped slice — separate
 * from auth — but cleared whenever the user signs out so the next login
 * doesn't inherit the previous user's selected store.
 *
 * The sign-out listener is registered in `./index.ts` so importing this
 * module triggers it.
 */

export const CURRENT_STORE_ID_COOKIE = "current_store_id";
export const STORE_TYPE_COOKIE = "store_type";
export const STORE_ROLE_COOKIE = "store_role";
export const STORE_SLUG_COOKIE = "store_slug";

const ONE_YEAR_DAYS = 365;
const ATTRS: Cookies.CookieAttributes = { expires: ONE_YEAR_DAYS, path: "/" };
const REMOVE_ATTRS = { path: "/" as const };

/** Fired after `setStoreContext`/`clearStoreContext` so listeners can refresh. */
export const STORE_CONTEXT_UPDATED_EVENT = "store-info-updated";

export interface StoreContext {
  storeId: string;
  storeType: string;
  storeSlug?: string | null;
  /** Optional — not all merchant roles have a store-level role. */
  storeRole?: string | null;
}

export function setStoreContext({ storeId, storeType, storeSlug, storeRole }: StoreContext): void {
  Cookies.set(CURRENT_STORE_ID_COOKIE, storeId, ATTRS);
  Cookies.set(STORE_TYPE_COOKIE, storeType, ATTRS);
  if (storeSlug) {
    Cookies.set(STORE_SLUG_COOKIE, storeSlug, ATTRS);
  } else {
    Cookies.remove(STORE_SLUG_COOKIE, REMOVE_ATTRS);
  }
  if (storeRole) {
    Cookies.set(STORE_ROLE_COOKIE, storeRole, ATTRS);
  } else {
    Cookies.remove(STORE_ROLE_COOKIE, REMOVE_ATTRS);
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(STORE_CONTEXT_UPDATED_EVENT));
  }
}

export function clearStoreContext(): void {
  Cookies.remove(CURRENT_STORE_ID_COOKIE, REMOVE_ATTRS);
  Cookies.remove(STORE_TYPE_COOKIE, REMOVE_ATTRS);
  Cookies.remove(STORE_SLUG_COOKIE, REMOVE_ATTRS);
  Cookies.remove(STORE_ROLE_COOKIE, REMOVE_ATTRS);
}

export interface ReadStoreContext {
  storeId: string | undefined;
  storeType: string | undefined;
  storeSlug: string | undefined;
  storeRole: string | undefined;
}

export function getStoreContext(): ReadStoreContext {
  return {
    storeId: Cookies.get(CURRENT_STORE_ID_COOKIE),
    storeType: Cookies.get(STORE_TYPE_COOKIE),
    storeSlug: Cookies.get(STORE_SLUG_COOKIE),
    storeRole: Cookies.get(STORE_ROLE_COOKIE),
  };
}
