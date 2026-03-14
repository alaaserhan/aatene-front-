import { NextRequest, NextResponse } from "next/server";

const PREVIEW_COOKIE = "coming_soon_preview";

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

  const response = NextResponse.redirect(new URL(redirect, request.url));
  response.cookies.set(PREVIEW_COOKIE, "1", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
