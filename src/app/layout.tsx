import { Metadata } from "next";
import { AuthBootProvider } from "@/src/auth/context";
import { getServerAuth } from "@/src/auth/server";
import { AuthHydrator } from "@/src/components/providers/AuthHydrator";
import { SettingsHydrator } from "@/src/components/providers/SettingsHydrator";
import { QueryProvider } from "@/src/components/providers/QueryProvider";
import { MetaPixel } from "@/src/components/providers/MetaPixel";
import { GoogleAnalytics } from "@/src/components/providers/GoogleAnalytics";
import { TikTokPixel } from "@/src/components/providers/TikTokPixel";
import { Toaster } from "sonner";
import { Suspense } from "react";
import React from "react";
import Script from "next/script";
import localFont from "next/font/local";
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE } from "@/src/lib/seo.config";
import "./globals.css";
// Side-effect import: registers store-context's onSignOut listener at boot.
import "@/src/store-context";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "أعطيني - منصة إلكترونية تربط بين مزوّدي الخدمات وبائعي المنتجات المحليين مع الزبائن. اكتشف خدمات ومنتجات محلية بسهولة وسرعة.",
  icons: {
    icon: "/icons/favicon.svg",
    shortcut: "/icons/favicon.svg",
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: SITE_NAME,
    description:
      "أعطيني - منصة إلكترونية تربط بين مزوّدي الخدمات وبائعي المنتجات المحليين مع الزبائن.",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description:
      "أعطيني - منصة إلكترونية تربط بين مزوّدي الخدمات وبائعي المنتجات المحليين مع الزبائن.",
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const pingAr = localFont({
  src: [
    {
      path: "./fonts/PingAR+LT-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/PingAR+LT-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/PingAR+LT-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-ping-ar",
  display: "swap",
  fallback: ["Tahoma", "Arial", "sans-serif"],
  /**
   * preload: true يُحقن <link rel="preload"> لكل وزن؛ كروم يُحذّر إن لم يُستخدم كل ملف
   * في الرسم خلال ثوانٍ بعد load (مثلاً صفحة دردشة تعتمد غالباً على Regular أولاً).
   * false يزيل التحذير؛ الخطوط ما زالت تُجلب عبر @font-face عند الحاجة (مع display: swap).
   */
  preload: false,
  adjustFontFallback: "Arial",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read the token cookie on the server so first-paint HTML reflects auth state.
  const { isLoggedIn } = await getServerAuth();

  return (
    <html
      lang="ar"
      dir="rtl"
      className={pingAr.variable}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://backend.aatene.com" />
        <link rel="dns-prefetch" href="https://backend.aatene.com" />

        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://connect.facebook.net" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Suspense fallback={null}>
          <MetaPixel />
          <GoogleAnalytics />
          <TikTokPixel />
        </Suspense>

        <QueryProvider>
          <AuthBootProvider initialIsLoggedIn={isLoggedIn}>
            <Suspense fallback={null}>
              <AuthHydrator />
              <SettingsHydrator />
            </Suspense>
            {children}
          </AuthBootProvider>
        </QueryProvider>

        <Toaster richColors dir="rtl" position="top-right" />
        <Script
          id="register-sw"
          strategy="lazyOnload"
        >{`if('serviceWorker'in navigator){navigator.serviceWorker.register('/sw.js')}`}</Script>
      </body>
    </html>
  );
}