import type { NextConfig } from "next";
import { join } from "node:path";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:locale/requested-services/my",
        destination: "/:locale/my/requested-services",
        permanent: false,
      },
      {
        source: "/:locale(ar|en|he)/product/:slug",
        destination: "/:locale/products/:slug",
        permanent: true,
      },
      {
        source: "/product/:slug",
        destination: "/products/:slug",
        permanent: true,
      },
      {
        source: "/:locale(ar|en|he)/store/:slug",
        destination: "/:locale/stores/:slug",
        permanent: true,
      },
      {
        source: "/store/:slug",
        destination: "/stores/:slug",
        permanent: true,
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  /**
   * jsdom (pulled in by isomorphic-dompurify) loads data files such as
   * default-stylesheet.css relative to its own directory. Bundling it breaks
   * those reads (ENOENT under .next/), so require it from node_modules instead.
   */
  serverExternalPackages: ["isomorphic-dompurify", "jsdom"],
  /**
   * Pages under `app/[locale]/(dashboard)/[type]/...` need `/ar/admin/...` or `/en/admin/...`.
   * Many links in the project use `/admin/...` without a locale, which 404s without this rewrite.
   */
  async rewrites() {
    return [
      { source: "/admin", destination: "/ar/admin" },
      { source: "/admin/:path*", destination: "/ar/admin/:path*" },
      /** Locale-less links (notifications, shares) — same as admin. */
      { source: "/chat", destination: "/ar/chat" },
      /** Locale-less footer and home links — same as chat. */
      { source: "/search", destination: "/ar/search" },
    ];
  },
  images: {
    unoptimized: true, // Remove to enable Next.js image optimization.
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
