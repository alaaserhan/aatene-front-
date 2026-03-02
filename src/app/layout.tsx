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
import localFont from "next/font/local";
import "@/src/app/globals.css";
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
    apple: "/icons/favicon.svg",
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
      path: "./fonts/PingAR+LT-Hairline.otf",
      weight: "100",
      style: "normal",
    },
    {
      path: "./fonts/PingAR+LT-Thin.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "./fonts/PingAR+LT-ExtraLight.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "./fonts/PingAR+LT-Light.otf",
      weight: "300",
      style: "normal",
    },
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
    {
      path: "./fonts/PingAR+LT-Heavy.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/PingAR+LT-Black.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-ping-ar",
  fallback: ["sans-serif"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={pingAr.variable}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <Suspense fallback={null}>
          <MetaPixel />
          <GoogleAnalytics />
          <TikTokPixel />
        </Suspense>
        <QueryProvider>
          <AuthHydrator />
          <SettingsHydrator />
          {children}
        </QueryProvider>
        <Toaster richColors dir="rtl" position="top-right" />
      </body>
    </html>
  );
}