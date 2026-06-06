import { Metadata } from "next";
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
import { CssLoader } from "@/src/components/providers/CssLoader";
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE } from "@/src/lib/seo.config";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "أعطيني - منصة إلكترونية تربط بين مزوّدي الخدمات وبائعي المنتجات المحليين مع الزبائن. اكتشف خدمات ومنتجات محلية بسهولة وسرعة.",
  keywords: [
    "أعطيني",
    "خدمات محلية",
    "منتجات محلية",
    "بيع وشراء",
    "منصة إلكترونية",
    "aatene",
    "تجارة إلكترونية",
    "الناصرة",
  ],
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <style>{`:root{--background:oklch(1 0 0);--foreground:oklch(0.129 0.042 264.695);--radius:0.625rem;--card:oklch(1 0 0);--card-foreground:oklch(0.129 0.042 264.695);--popover:oklch(1 0 0);--popover-foreground:oklch(0.129 0.042 264.695);--primary:oklch(0.208 0.042 265.755);--primary-foreground:oklch(0.984 0.003 247.858);--secondary:oklch(0.968 0.007 247.896);--secondary-foreground:oklch(0.208 0.042 265.755);--muted:oklch(0.968 0.007 247.896);--muted-foreground:oklch(0.554 0.046 257.417);--accent:oklch(0.968 0.007 247.896);--accent-foreground:oklch(0.208 0.042 265.755);--destructive:oklch(0.577 0.245 27.325);--border:oklch(0.929 0.013 255.508);--input:oklch(0.929 0.013 255.508);--ring:oklch(0.704 0.04 256.788);--chart-1:oklch(0.646 0.222 41.116);--chart-2:oklch(0.6 0.118 184.704);--chart-3:oklch(0.398 0.07 227.392);--chart-4:oklch(0.828 0.189 84.429);--chart-5:oklch(0.769 0.188 70.08);--sidebar:oklch(0.984 0.003 247.858);--sidebar-foreground:oklch(0.129 0.042 264.695);--sidebar-primary:oklch(0.208 0.042 265.755);--sidebar-primary-foreground:oklch(0.984 0.003 247.858);--sidebar-accent:oklch(0.968 0.007 247.896);--sidebar-accent-foreground:oklch(0.208 0.042 265.755);--sidebar-border:oklch(0.929 0.013 255.508);--sidebar-ring:oklch(0.704 0.04 256.788);--white-1:#f9fafb;--blue-1:#C8D7E8;--blue-2:#38587A;--blue-3:#2D496A;--blue-4:#406896;--blue-5:#5B87B91A;--blue-6:#5B88BA33;--gray-1:#9291A5;--gray-2:#6d6d6d;--gray-3:#6d6d6d;--gray-4:#E3E3E3;--black-1:#393939;--red-1:#D00416;--red-2:#FB37481A;--gold-1:#D3871A;--gary-4:rgba(170,170,170,.08)}body{background:var(--white-1);color:var(--black-1);min-height:100vh;height:100%;max-width:100vw!important;overflow-x:hidden!important}html{scroll-behavior:smooth}.container{max-width:1400px;margin-left:auto;margin-right:auto;padding:0 1rem}@media(max-width:676px){.container{padding:0 .5rem}html{font-size:85%}}`}</style>
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Suspense fallback={null}>
          <MetaPixel />
          <GoogleAnalytics />
          <TikTokPixel />
        </Suspense>
        
        <QueryProvider>
          <Suspense fallback={null}>
            <AuthHydrator />
            <SettingsHydrator />
          </Suspense>
          {children}
        </QueryProvider>
        
        <Toaster richColors dir="rtl" position="top-right" />
        <CssLoader />
        <Script
          id="register-sw"
          strategy="lazyOnload"
        >{`if('serviceWorker'in navigator){navigator.serviceWorker.register('/sw.js')}`}</Script>
      </body>
    </html>
  );
}