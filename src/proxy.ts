// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { createI18nMiddleware } from "next-international/middleware";

const I18nMiddleware = createI18nMiddleware({
  locales: ["en", "ar", "he"],
  defaultLocale: "ar",
  urlMappingStrategy: "rewriteDefault",
  resolveLocaleFromRequest: () => "ar", 
});

export default function proxy(request: NextRequest) {
  const response = I18nMiddleware(request);
  
  if (response) {
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"], 
};