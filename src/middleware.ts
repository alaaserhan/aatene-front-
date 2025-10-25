import { NextRequest, NextResponse } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;
const SUPPORTED_LANGS = ["en", "ar", "he"];
const DEFAULT_LANG = "ar";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. لو الطلب لملف (صورة, css) متعملش حاجة
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. شوف اللغة اللي في الرابط
  const pathnameHasLang = SUPPORTED_LANGS.some(
    (lang) => pathname.startsWith(`/${lang}/`) || pathname === `/${lang}`
  );

  let lang = DEFAULT_LANG;

  // 3. لو الرابط فيه لغة، استخدمها
  if (pathnameHasLang) {
    lang = pathname.split("/")[1]; // (ar)
  } else {
    // 4. لو الرابط مفهوش لغة (زي /products)، اعمله redirect
    // حوله لـ /en/products
    const newUrl = new URL(`/${DEFAULT_LANG}${pathname}`, request.url);
    return NextResponse.redirect(newUrl);
  }
  
  // 5. جهّز الرد
  const response = NextResponse.next();
  
  // 6. ⭐️ (الخطوة الأهم) خزّن اللغة في الكوكي
  // ده اللي هيخلي axios.ts يبعت هيدر X-Culture صح
  response.cookies.set("lang", lang, { path: "/" });

  return response;
}

// 7. حدد المسارات اللي الـ middleware هيشتغل عليها
export const config = {
  matcher: [
    // متطبقش الـ middleware على الـ api, _next, static, files
    "/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)",
  ],
};