import { NextRequest, NextResponse } from "next/server";
import { createI18nMiddleware } from "next-international/middleware";
import { isSegmentAllowedForRole, isSegmentAllowedForAdmin, MerchantRole } from "@/src/config/role-permissions";

const LOCALES = new Set(["ar", "en", "he"]);
const COMING_SOON_PATH = "coming-soon";
const PREVIEW_COOKIE = "coming_soon_preview";

const I18nMiddleware = createI18nMiddleware({
  locales: ["en", "ar", "he"],
  defaultLocale: "ar",
  urlMappingStrategy: "rewriteDefault",
  resolveLocaleFromRequest: () => "ar",
});

const MERCHANT_BLOCKED_SEGMENTS = new Set([
  'users',
  'productProviders',
  'cities',
  'banners',
  'mosa3edy',
  'requested-services',
  'favorites',
  'content-management',
  'abusive-words',
  'all-reports',
  'notifications',
  'trash',
  'categories',
  'permissions',
  'settings',
  'contacts',
]);

function getLocaleFromPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && LOCALES.has(segments[0])) {
    return segments[0];
  }
  return "ar";
}

function isComingSoonRoute(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  return segments.includes(COMING_SOON_PATH);
}

function isPreviewApiRoute(pathname: string) {
  return pathname.startsWith("/api/preview");
}


function isBypassPath(pathname: string) {
  return (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/apple-icon") ||
    pathname.startsWith("/coming-soon") ||
    pathname.startsWith("/public")
  );
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. "Coming Soon" and Bypass Logic 
  const comingSoonEnv = process.env.COMING_SOON_ENABLED;
  // const comingSoonEnabled = comingSoonEnv ? comingSoonEnv === "true" : true;
  // test
  const comingSoonEnabled = comingSoonEnv === "true";

  if (comingSoonEnabled && !isBypassPath(pathname)) {
    const hasPreviewAccess = request.cookies.get(PREVIEW_COOKIE)?.value === "1";

    if (!hasPreviewAccess && !isPreviewApiRoute(pathname) && !isComingSoonRoute(pathname)) {
      const locale = getLocaleFromPath(pathname);
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/${COMING_SOON_PATH}`;
      return NextResponse.redirect(url);
    }
  }

  // 2. Auth guard for protected web routes
  const token = request.cookies.get('token')?.value;
  const webLocale = getLocaleFromPath(pathname);

  const protectedWebRoutes = [
    '/requested-services/create',
    '/requested-services/edit',
  ];

  const isProtectedWebRoute = protectedWebRoutes.some((route) => {
    const withLocale = `/${webLocale}${route}`;
    const withoutLocale = route;
    return pathname.startsWith(withLocale) || pathname.startsWith(withoutLocale);
  });

  if (isProtectedWebRoute && !token) {
    return NextResponse.redirect(new URL(`/${webLocale}/login`, request.url));
  }

  // 3. Admin & Role Permissions Proxy Logic
  const segments = pathname.split('/').filter(Boolean);
  let locale = 'ar';
  let adminIndex = -1;

  if (segments[0] === 'ar' || segments[0] === 'en' || segments[0] === 'he') {
    locale = segments[0];
    if (segments[1] === 'admin') adminIndex = 1;
  } else {
    if (segments[0] === 'admin') adminIndex = 0;
  }

  if (adminIndex !== -1) {
    const role = request.cookies.get('user_type')?.value;
    const segment = segments[adminIndex + 1];

    if (!token || !role) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    if (role !== 'admin' && role !== 'merchant') {
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }

    if (segment) {
      let isForbidden = false;

      if (role === 'merchant' && MERCHANT_BLOCKED_SEGMENTS.has(segment)) {
        isForbidden = true;
      }

      if (role === 'merchant' && segment === 'home' && segments[adminIndex + 2] === 'reports') {
        isForbidden = true;
      }

      const storeType = request.cookies.get('store_type')?.value;
      if (role === 'merchant' && segment === 'coupons' && storeType === 'services') {
        isForbidden = true;
      }

      if (role === 'merchant' && segment === 'serviceProviders') {
        const hasId = segments.length > (adminIndex + 2);
        if (!hasId) isForbidden = true;
      }

      if (role === 'merchant' && !isForbidden) {
        const storeRole = request.cookies.get('store_role')?.value as MerchantRole | undefined;
        if (storeRole && !isSegmentAllowedForRole(storeRole, segment)) {
          isForbidden = true;
        }
      }

      if (role === 'admin' && !isForbidden) {
        const permsCookie = request.cookies.get('admin_permissions')?.value;
        if (permsCookie) {
          try {
            const permissions = JSON.parse(permsCookie) as string[];
            if (!isSegmentAllowedForAdmin(permissions, segment)) {
              isForbidden = true;
            }
          } catch {
            // invalid cookie, allow access
          }
        }
      }

      if (isForbidden) {
        const url = request.nextUrl.clone();
        url.pathname = `/${locale}/admin/403`;
        return NextResponse.rewrite(url);
      }
    }
  }

  // return I18nMiddleware(request);
  const i18nResponse = I18nMiddleware(request);

  // منع الـ redirect loop على iOS
  if (
    i18nResponse.status === 301 ||
    i18nResponse.status === 302 ||
    i18nResponse.status === 307 ||
    i18nResponse.status === 308
  ) {
    const location = i18nResponse.headers.get("location");
    if (location) {
      const locationPath = new URL(location, request.url).pathname;
      if (locationPath === pathname) {
        return NextResponse.next();
      }
    }
  }
  return i18nResponse;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
