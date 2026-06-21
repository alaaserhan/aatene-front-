import type { MetadataRoute } from "next";
import { SITE_URL } from "@/src/lib/seo.config";
import { locales, defaultLocale } from "@/src/i18n/config";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { "X-Culture": defaultLocale },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fetchAllSlugs(
  endpoint: string,
  key: string,
  totalKey: "total" | "recordsTotal" = "total",
  perPage = 100
): Promise<string[]> {
  const slugs: string[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const data = await apiFetch<Record<string, unknown>>(
      `${endpoint}?per_page=${perPage}&page=${page}`
    );
    if (!data) break;

    const items = (data[key] as { slug?: string }[]) ?? [];
    for (const item of items) {
      if (item.slug) slugs.push(item.slug);
    }

    const total = (data[totalKey] as number) ?? 0;
    hasMore = items.length === perPage && slugs.length < total;
    page++;
  }

  return slugs;
}

function entry(
  path: string,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly",
  lastModified?: Date
): MetadataRoute.Sitemap[number] {
  const alternates: Record<string, string> = {};
  for (const locale of locales) {
    alternates[locale] = `${SITE_URL}/${locale}${path}`;
  }

  return {
    url: `${SITE_URL}/${defaultLocale}${path}`,
    lastModified: lastModified ?? new Date(),
    changeFrequency,
    priority,
    alternates: { languages: alternates },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    entry("", 1.0, "daily"),
    entry("/search", 0.9, "daily"),
    entry("/blogs", 0.8, "daily"),
    entry("/requested-services", 0.7, "daily"),
    entry("/about", 0.5, "monthly"),
    entry("/contact-us", 0.4, "monthly"),
    entry("/faq", 0.4, "monthly"),
    entry("/privacy-policy", 0.3, "yearly"),
    entry("/terms-of-use", 0.3, "yearly"),
    entry("/safety-rules", 0.3, "yearly"),
  ];

  const [productSlugs, serviceSlugs, storeSlugs, blogSlugs, requestedSlugs] =
    await Promise.all([
      fetchAllSlugs("/products/search", "products"),
      fetchAllSlugs("/services/search", "services"),
      fetchAllSlugs("/stores/search", "stores"),
      fetchAllSlugs("/blogs", "records", "recordsTotal"),
      fetchAllSlugs("/requested-services", "data", "recordsTotal"),
    ]);

  const dynamicRoutes: MetadataRoute.Sitemap = [
    ...productSlugs.map((s) => entry(`/product/${s}`, 0.8)),
    ...serviceSlugs.map((s) => entry(`/services/${s}`, 0.8)),
    ...storeSlugs.map((s) => entry(`/store/${s}`, 0.7)),
    ...blogSlugs.map((s) => entry(`/blogs/${s}`, 0.6)),
    ...requestedSlugs.map((s) => entry(`/requested-services/${s}`, 0.5)),
  ];

  return [...staticRoutes, ...dynamicRoutes];
}
