import { NextRequest, NextResponse } from "next/server";
import { createI18nMiddleware } from "next-international/middleware";
import { isSegmentAllowedForRole, MerchantRole } from "@/src/config/role-permissions";

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
  'categories',
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

      if (role === 'merchant' && ADMIN_ONLY_SEGMENTS.has(segment)) {
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
