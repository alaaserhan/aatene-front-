import type { NextConfig } from "next";

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
    ];
  },
  images: {
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
