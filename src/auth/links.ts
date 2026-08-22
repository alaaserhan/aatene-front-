/** يقرأها `LoginForm` لعرض رسالة بعد إعادة التوجيه من إجراء يتطلب تسجيل دخول */
export const LOGIN_AUTH_REQUIRED_REASON = "auth_required";

/** Query param carrying the page to return to once the user is authenticated. */
export const LOGIN_REDIRECT_PARAM = "redirect";

const LOCALES = new Set(["ar", "en", "he"]);

/** Auth screens are never valid return targets — they would loop back here. */
const AUTH_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password"];

/** Callers pass `useParams()` values, which are typed `string | string[]`. */
export type LocaleInput = string | string[] | undefined | null;

function normalizeLocale(locale: LocaleInput): string {
  const raw = Array.isArray(locale) ? locale[0] : locale;
  const lc = (raw || "ar").replace(/^\/+|\/+$/g, "");
  return LOCALES.has(lc) ? lc : "ar";
}

function stripLocale(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length > 0 && LOCALES.has(parts[0])) {
    return parts.length > 1 ? "/" + parts.slice(1).join("/") : "/";
  }
  return pathname;
}

/**
 * Accepts only same-origin, path-only targets. Anything absolute, protocol
 * relative (`//evil.com`) or pointing at an auth screen is dropped, so a
 * crafted `?redirect=` can't turn the login flow into an open redirect.
 */
export function sanitizeRedirectTarget(target?: string | null): string | null {
  if (!target) return null;
  const value = target.trim();
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//") || value.startsWith("/\\")) return null;

  const pathname = value.split(/[?#]/)[0];
  const withoutLocale = stripLocale(pathname).replace(/\/+$/, "") || "/";
  if (AUTH_PATHS.some((p) => withoutLocale === p || withoutLocale.startsWith(`${p}/`))) {
    return null;
  }
  return value;
}

/** The page the user is currently on, as a redirect target (client only). */
export function currentRedirectTarget(): string | null {
  if (typeof window === "undefined") return null;
  return sanitizeRedirectTarget(window.location.pathname + window.location.search);
}

type LoginUrlOptions = {
  /** Omit to capture the current page; pass `null` to send no redirect at all. */
  redirectTo?: string | null;
  /** Adds `?reason=auth_required` so the login screen explains why. */
  authRequired?: boolean;
};

export function loginUrl(locale: LocaleInput, options?: LoginUrlOptions): string {
  const params = new URLSearchParams();
  if (options?.authRequired) params.set("reason", LOGIN_AUTH_REQUIRED_REASON);

  const raw =
    options && "redirectTo" in options ? options.redirectTo : currentRedirectTarget();
  const target = sanitizeRedirectTarget(raw);
  if (target) params.set(LOGIN_REDIRECT_PARAM, target);

  const query = params.toString();
  return `/${normalizeLocale(locale)}/login${query ? `?${query}` : ""}`;
}

export function loginUrlWithAuthRequired(
  locale: LocaleInput,
  redirectTo?: string | null,
): string {
  return loginUrl(locale, {
    authRequired: true,
    ...(redirectTo === undefined ? {} : { redirectTo }),
  });
}

/** Where to land after a successful sign-in, given the login page's query. */
export function postLoginRedirect(
  search: string | URLSearchParams,
  locale: LocaleInput,
): string {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  return (
    sanitizeRedirectTarget(params.get(LOGIN_REDIRECT_PARAM)) ??
    `/${normalizeLocale(locale)}`
  );
}

/** `postLoginRedirect` bound to the current URL (client only). */
export function readPostLoginRedirect(locale: LocaleInput): string {
  if (typeof window === "undefined") return `/${normalizeLocale(locale)}`;
  return postLoginRedirect(window.location.search, locale);
}

/**
 * Query string to append to links between auth screens (login ⇄ signup) so the
 * pending redirect target survives the hop.
 */
export function authLinkQuery(): string {
  if (typeof window === "undefined") return "";
  const target = sanitizeRedirectTarget(
    new URLSearchParams(window.location.search).get(LOGIN_REDIRECT_PARAM),
  );
  return target ? `?${LOGIN_REDIRECT_PARAM}=${encodeURIComponent(target)}` : "";
}
