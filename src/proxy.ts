// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { createI18nMiddleware } from "next-international/middleware";

const I18nMiddleware = createI18nMiddleware({
  locales: ["en", "ar", "he"],
  defaultLocale: "ar",
  urlMappingStrategy: "rewriteDefault",
  resolveLocaleFromRequest: () => "ar",
});

const ADMIN_ONLY_SEGMENTS = new Set([
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
  'permissions',
]);

const MERCHANT_ONLY_SEGMENTS = new Set([
  'products',
  'stories',
  'following',
  'coupons',
  'financial-record',
  'coins',
]);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Identify locale and target path
  // Paths can be /admin/... or /ar/admin/... or /en/admin/...
  const segments = pathname.split('/').filter(Boolean);

  // Possible formats:
  // [] -> home
  // ['admin', 'users']
  // ['ar', 'admin', 'users']

  let locale = 'ar';
  let adminIndex = -1;

  if (segments[0] === 'ar' || segments[0] === 'en' || segments[0] === 'he') {
    locale = segments[0];
    if (segments[1] === 'admin') adminIndex = 1;
  } else {
    if (segments[0] === 'admin') adminIndex = 0;
  }

  // 2. Permission logic for Admin dashboard
  if (adminIndex !== -1) {
    const token = request.cookies.get('token')?.value;
    const role = request.cookies.get('user_type')?.value;
    const segment = segments[adminIndex + 1]; // e.g. 'productProviders'

    // Auth check
    if (!token || !role) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    // Basic Access check: Only admin and merchant can enter /admin
    if (role !== 'admin' && role !== 'merchant') {
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }

    // Role-based segment restrictions
    if (segment) {
      let isForbidden = false;

      // Merchant trying to access Admin-only pages
      if (role === 'merchant' && ADMIN_ONLY_SEGMENTS.has(segment)) {
        isForbidden = true;
      }

      // Special case for serviceProviders (only specific IDs for merchants)
      if (role === 'merchant' && segment === 'serviceProviders') {
        const hasId = segments.length > (adminIndex + 2);
        if (!hasId) isForbidden = true;
      }

      // Admin has full access to everything, so no restriction here.

      if (isForbidden) {
        const url = request.nextUrl.clone();
        url.pathname = `/${locale}/admin/403`;
        return NextResponse.rewrite(url);
      }
    }
  }

  // 3. Handle I18n for all other routes
  return I18nMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};