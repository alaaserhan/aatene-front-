import { Metadata } from "next";
import { notFound } from "next/navigation";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import StoreProfilePage from "@/src/features/(web)/stores/pages/StoreProfilePage";
import type { StoreProfile } from "@/src/features/(web)/stores/api";
import {
    getStoreProfileCached,
    getStorePageDataCached,
} from "@/src/features/(web)/stores/server";
import {
    generateDynamicMetadata,
    generatePageMetadata,
    generateAlternates,
    toPlainText,
    SITE_URL,
} from "@/src/lib/seo.config";
import { makeQueryClient } from "@/src/lib/queryClient";

type PageProps = {
    params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale, slug } = await params;
    const data = await getStoreProfileCached(slug);
    const store = data?.store;

    if (!store) {
        return generatePageMetadata("search", {
            title: "صفحة المتجر",
            description: "تصفح منتجات وخدمات المتجر على منصة أعطيني.",
        });
    }

    return {
        ...generateDynamicMetadata({
            title: store.name,
            description:
                toPlainText(store.description) ||
                "تصفح منتجات وخدمات المتجر على منصة أعطيني.",
            image: store.logo_url || store.cover_urls?.[0] || undefined,
            url: `${SITE_URL}/${locale}/store/${store.slug}`,
        }),
        alternates: generateAlternates(locale, `/store/${store.slug}`),
    };
}

function buildStoreJsonLd(store: StoreProfile, locale: string) {
    const reviewCount = Number(store.review_count) || 0;
    const rating = Number(store.review_rate) || 0;

    return {
        "@context": "https://schema.org",
        "@type": "Store",
        name: store.name,
        description: toPlainText(store.description, 5000),
        url: `${SITE_URL}/${locale}/store/${store.slug}`,
        ...(store.logo_url && { logo: store.logo_url, image: store.logo_url }),
        ...(store.address && { address: store.address }),
        ...(store.email && { email: store.email }),
        ...(store.phone && store.hide_phone !== "1" && { telephone: store.phone }),
        ...(store.lat &&
            store.lng && {
                geo: {
                    "@type": "GeoCoordinates",
                    latitude: store.lat,
                    longitude: store.lng,
                },
            }),
        ...(reviewCount > 0 &&
            rating > 0 && {
                aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: rating,
                    reviewCount,
                },
            }),
    };
}

export default async function StorePage({ params }: PageProps) {
    const { locale, slug } = await params;

    const [profile, pageData] = await Promise.all([
        getStoreProfileCached(slug),
        getStorePageDataCached(slug),
    ]);

    if (!profile?.store) {
        notFound();
    }

    // Seed the client cache with what we already fetched, so the first paint is
    // server-rendered HTML (crawlable) instead of a spinner.
    // Keys must match useApiQuery, which appends the locale to every query key.
    const queryClient = makeQueryClient();
    queryClient.setQueryData(["storeProfile", slug, locale], profile);
    if (pageData) {
        queryClient.setQueryData(["storePageData", slug, locale], pageData);
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(buildStoreJsonLd(profile.store, locale)),
                }}
            />
            <HydrationBoundary state={dehydrate(queryClient)}>
                <StoreProfilePage slug={slug} />
            </HydrationBoundary>
        </>
    );
}
