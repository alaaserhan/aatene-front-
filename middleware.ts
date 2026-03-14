import { NextRequest, NextResponse } from "next/server";
import proxy from "@/src/proxy";

const LOCALES = new Set(["ar", "en", "he"]);
const COMING_SOON_PATH = "coming-soon";
const PREVIEW_COOKIE = "coming_soon_preview";

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

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const comingSoonEnv = process.env.COMING_SOON_ENABLED;
  const comingSoonEnabled = comingSoonEnv ? comingSoonEnv === "true" : true;

  if (comingSoonEnabled && !isBypassPath(pathname)) {
    const hasPreviewAccess =
      request.cookies.get(PREVIEW_COOKIE)?.value === "1";

    if (!hasPreviewAccess && !isPreviewApiRoute(pathname) && !isComingSoonRoute(pathname)) {
      const locale = getLocaleFromPath(pathname);
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/${COMING_SOON_PATH}`;
      return NextResponse.redirect(url);
    }
  }

  return proxy(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
