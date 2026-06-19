import type { MetadataRoute } from "next";
import { SITE_URL } from "@/src/lib/seo.config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/*/admin/",
          "/*/provider/",
          "/*/seller/",

          "/*/login",
          "/*/signup",
          "/*/forgot-password",

          "/*/chat",
          "/*/chat/",
          "/*/settings",
          "/*/notifications",
          "/*/favourites",
          "/*/my/",

          "/*/coming-soon",

          "/api/",
          "/_next/",
          "/sw.js",
        ],
      },
      {
        userAgent: "GPTBot",
        disallow: ["/"],
      },
      {
        userAgent: "ChatGPT-User",
        disallow: ["/"],
      },
      {
        userAgent: "CCBot",
        disallow: ["/"],
      },
      {
        userAgent: "Google-Extended",
        disallow: ["/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
