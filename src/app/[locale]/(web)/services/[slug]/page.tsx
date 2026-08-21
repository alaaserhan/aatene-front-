import { Metadata } from "next";
import { notFound } from "next/navigation";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import ServiceDetailsPage from "@/src/features/(web)/services/ServiceDetailsPage";
import type { Service } from "@/src/features/(web)/services/api";
import {
    getServiceCached,
    getServicePageDataCached,
} from "@/src/features/(web)/services/server";
import {
    generateDynamicMetadata,
    generatePageMetadata,
    generateAlternates,
    SITE_URL,
} from "@/src/lib/seo.config";
import { makeQueryClient } from "@/src/lib/queryClient";

type PageProps = {
    params: Promise<{ locale: string; slug: string }>;
};

/** Service descriptions are stored as HTML; meta tags need plain text. */
function toPlainText(html: string | undefined, maxLength = 160): string {
    const text = (html || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    return text.length > maxLength ? `${text.slice(0, maxLength - 1).trimEnd()}…` : text;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale, slug } = await params;
    const data = await getServiceCached(slug);
    const service = data?.service;

    if (!service) {
        return generatePageMetadata("search", {
            title: "تفاصيل الخدمة",
            description: "اطّلع على تفاصيل الخدمة والتقييمات على منصة أعطيني.",
        });
    }

    const image = service.images_urls?.[0] || service.image_url || undefined;

    return {
        ...generateDynamicMetadata({
            title: service.title,
            description:
                toPlainText(service.description) ||
                "اطّلع على تفاصيل الخدمة والتقييمات على منصة أعطيني.",
            image,
            url: `${SITE_URL}/${locale}/services/${service.slug}`,
        }),
        alternates: generateAlternates(locale, `/services/${service.slug}`),
    };
}

function buildServiceJsonLd(service: Service, locale: string) {
    const images = [
        ...(service.images_urls || []),
        ...(service.image_url ? [service.image_url] : []),
    ];
    const reviewCount = Number(service.review_count) || 0;
    const rating = Number(service.review_rate) || 0;

    return {
        "@context": "https://schema.org",
        "@type": "Service",
        name: service.title,
        description: toPlainText(service.description, 5000),
        url: `${SITE_URL}/${locale}/services/${service.slug}`,
        ...(images.length > 0 && { image: images }),
        ...(service.category?.name && { serviceType: service.category.name }),
        ...(service.store?.name && {
            provider: {
                "@type": "Organization",
                name: service.store.name,
                ...(service.store.slug && {
                    url: `${SITE_URL}/${locale}/store/${service.store.slug}`,
                }),
            },
        }),
        ...(!service.ask_for_price &&
            Number(service.price) > 0 && {
                offers: {
                    "@type": "Offer",
                    price: service.price,
                    priceCurrency: "SAR",
                    availability: "https://schema.org/InStock",
                    url: `${SITE_URL}/${locale}/services/${service.slug}`,
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

export default async function ServicePage({ params }: PageProps) {
    const { locale, slug } = await params;

    const [service, pageData] = await Promise.all([
        getServiceCached(slug),
        getServicePageDataCached(slug),
    ]);

    if (!service?.service) {
        notFound();
    }

    // Seed the client cache with what we already fetched, so the first paint is
    // server-rendered HTML (crawlable) instead of a skeleton.
    const queryClient = makeQueryClient();
    queryClient.setQueryData(["service", slug], service);
    if (pageData) {
        queryClient.setQueryData(["service-page-data", slug], pageData);
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(buildServiceJsonLd(service.service, locale)),
                }}
            />
            <HydrationBoundary state={dehydrate(queryClient)}>
                <ServiceDetailsPage slug={slug} />
            </HydrationBoundary>
        </>
    );
}
