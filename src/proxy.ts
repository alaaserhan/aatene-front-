import { NextRequest, NextResponse } from "next/server";
import { createI18nMiddleware } from "next-international/middleware";
import { isSegmentAllowedForRole, isSegmentAllowedForAdmin, MerchantRole } from "@/src/config/role-permissions";

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
]);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
    const token = request.cookies.get('token')?.value;
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

  return I18nMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
