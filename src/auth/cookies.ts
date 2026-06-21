import Cookies from "js-cookie";

export const AUTH_COOKIE = "token";
export const USER_TYPE_COOKIE = "user_type";
export const ADMIN_PERMISSIONS_COOKIE = "admin_permissions";
export const LANG_COOKIE = "lang";

const ONE_YEAR_DAYS = 365;
const isProd = process.env.NODE_ENV === "production";

export const AUTH_COOKIE_ATTRS: Cookies.CookieAttributes = {
  expires: ONE_YEAR_DAYS,
  path: "/",
  secure: isProd,
};

const REMOVE_ATTRS = { path: "/" as const };

export function getAuthTokenClient(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return Cookies.get(AUTH_COOKIE);
}

export async function getAuthTokenServer(): Promise<string | undefined> {
  try {
    const { cookies } = await import("next/headers");
    const jar = await cookies();
    return jar.get(AUTH_COOKIE)?.value;
  } catch {
    return undefined;
  }
}

export async function getAuthToken(): Promise<string | undefined> {
  return typeof window === "undefined" ? getAuthTokenServer() : getAuthTokenClient();
}

export function getLangClient(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return Cookies.get(LANG_COOKIE);
}

export interface SetAuthCookiesParams {
  token: string;
  user_type?: string;
  admin_permissions?: string[] | null;
}

export function setAuthCookies({ token, user_type, admin_permissions }: SetAuthCookiesParams): void {
  Cookies.set(AUTH_COOKIE, token, AUTH_COOKIE_ATTRS);
  if (user_type) {
    Cookies.set(USER_TYPE_COOKIE, user_type, AUTH_COOKIE_ATTRS);
  }
  if (user_type === "admin" && admin_permissions?.length) {
    Cookies.set(ADMIN_PERMISSIONS_COOKIE, JSON.stringify(admin_permissions), AUTH_COOKIE_ATTRS);
  }
}

export function clearAuthCookies(): void {
  Cookies.remove(AUTH_COOKIE, REMOVE_ATTRS);
  Cookies.remove(USER_TYPE_COOKIE, REMOVE_ATTRS);
  Cookies.remove(ADMIN_PERMISSIONS_COOKIE, REMOVE_ATTRS);
}
