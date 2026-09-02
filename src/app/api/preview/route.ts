import { NextRequest, NextResponse } from "next/server";
import { safeRedirectPath } from "@/src/lib/safe-redirect";

const PREVIEW_COOKIE = "coming_soon_preview";

function getBaseUrl(request: NextRequest): string {
  // Try environment variable first (most reliable for production)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  // Use forwarded headers set by reverse proxy (Nginx, Caddy, etc.)
  const forwardedProto =
    request.headers.get("x-forwarded-proto") ??
    request.headers.get("x-forwarded-scheme");
  const forwardedHost =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");

  if (forwardedProto && forwardedHost) {
    // x-forwarded-proto may contain a comma-separated list; take the first
    const proto = forwardedProto.split(",")[0].trim();
    const host = forwardedHost.split(",")[0].trim();
    return `${proto}://${host}`;
  }

  // Fallback to request.url (works fine in development)
  const { protocol, host } = new URL(request.url);
  return `${protocol}//${host}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const redirect = searchParams.get("redirect") ?? "/";
  const expected = process.env.COMING_SOON_PREVIEW_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json(
      { message: "Invalid preview secret" },
      { status: 401 }
    );
  }

  const baseUrl = getBaseUrl(request);
  const safePath = safeRedirectPath(redirect, baseUrl);

  if (safePath === null) {
    return NextResponse.json({ message: "Invalid redirect" }, { status: 400 });
  }

  const response = NextResponse.redirect(new URL(safePath, baseUrl));
  response.cookies.set(PREVIEW_COOKIE, "1", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
