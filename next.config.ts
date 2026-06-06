import type { NextConfig } from "next";
import { join } from "node:path";

const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://pub-cf38031c25af4e26bfbe468543d9bae2.r2.dev";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:locale/requested-services/my",
        destination: "/:locale/my/requested-services",
        permanent: false,
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "firebase/app": join(process.cwd(), "node_modules/firebase/app/dist/esm/index.esm.js"),
      "firebase/messaging": join(process.cwd(), "node_modules/firebase/messaging/dist/esm/index.esm.js"),
      "firebase/firestore": join(process.cwd(), "node_modules/firebase/firestore/dist/esm/index.esm.js"),
      "@firebase/app": join(process.cwd(), "node_modules/@firebase/app/dist/esm/index.esm.js"),
      "@firebase/messaging": join(process.cwd(), "node_modules/@firebase/messaging/dist/esm/index.esm.js"),
      "@firebase/firestore": join(process.cwd(), "node_modules/@firebase/firestore/dist/index.esm.js"),
    };
    return config;
  },
  /**
   * الصفحات تحت `app/[locale]/(dashboard)/[type]/...` تحتاج `/ar/admin/...` أو `/en/admin/...`.
   * كثير من الروابط في المشروع تستخدم `/admin/...` بدون locale → 404 بدون هذا التوجيه الداخلي.
   */
  async rewrites() {
    return [
      { source: "/admin", destination: "/ar/admin" },
      { source: "/admin/:path*", destination: "/ar/admin/:path*" },
      /** روابط بدون locale (مثل إشعارات أو مشاركة) — يطابق سلوك الإدارة */
      { source: "/chat", destination: "/ar/chat" },
      /** روابط الفوتر والصفحة الرئيسية بدون locale — يطابق سلوك الشات */
      { source: "/search", destination: "/ar/search" },
      /** يعيد توجيه صور R2 عبر API route لإضافة Cache-Control للاستفادة من تخزين المتصفح */
      { source: "/_r2/:path*", destination: "/api/r2/:path*" },
    ];
  },
  async headers() {
    return [
      {
        source: "/_r2/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
  images: {
    unoptimized: true, // ضروري تحذفي السطر ده لو حابة تستخدمي ميزة تحسين الصور اللي بتقدمها Next.js، بس لو مش هتستخدميها يبقى ممكن تسيبيها زي ما هي
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: 'backend.aatene.com',
      },
      {
        protocol: 'https',
        hostname: 'backend.aatene.com',
      },
      {
        protocol: 'https',
        hostname: 'aatene.dev',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
