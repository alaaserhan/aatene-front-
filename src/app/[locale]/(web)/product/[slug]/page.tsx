import { Metadata } from "next";
import { notFound } from "next/navigation";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import ProductDetailsPage from "@/src/features/(web)/product/ProductDetailsPage";
import type { Product, Store } from "@/src/features/(web)/product/types";
import {
    getProductCached,
    getProductPageDataCached,
} from "@/src/features/(web)/product/server";
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
    const data = await getProductCached(slug);
    const product = data?.product;

    if (!product) {
        return generatePageMetadata("search", {
            title: "تفاصيل المنتج",
            description: "اطّلع على تفاصيل المنتج والتقييمات على منصة أعطيني.",
        });
    }

    return {
        ...generateDynamicMetadata({
            title: product.name,
            description:
                toPlainText(product.short_description) ||
                toPlainText(product.description) ||
                "اطّلع على تفاصيل المنتج والتقييمات على منصة أعطيني.",
            image: product.cover || product.gallery?.[0] || undefined,
            url: `${SITE_URL}/${locale}/product/${product.slug}`,
        }),
        alternates: generateAlternates(locale, `/product/${product.slug}`),
    };
}

function buildProductJsonLd(product: Product, store: Store | undefined, locale: string) {
    const images = [
        ...(product.cover ? [product.cover] : []),
        ...(product.gallery || []),
    ];
    const reviewCount = Number(product.review_count) || 0;
    const rating = Number(product.review_rate) || 0;
    const price = product.price_after_discount || product.price;

    return {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: toPlainText(product.short_description || product.description, 5000),
        url: `${SITE_URL}/${locale}/product/${product.slug}`,
        ...(product.sku && { sku: product.sku }),
        ...(images.length > 0 && { image: images }),
        ...(product.category?.name && { category: product.category.name }),
        ...(store?.name && {
            brand: { "@type": "Brand", name: store.name },
        }),
        ...(!product.ask_for_price &&
            Number(price) > 0 && {
                offers: {
                    "@type": "Offer",
                    price,
                    priceCurrency: "SAR",
                    availability:
                        product.status === "active"
                            ? "https://schema.org/InStock"
                            : "https://schema.org/OutOfStock",
                    url: `${SITE_URL}/${locale}/product/${product.slug}`,
                    ...(store?.name && {
                        seller: { "@type": "Organization", name: store.name },
                    }),
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

export default async function ProductPage({ params }: PageProps) {
    const { locale, slug } = await params;

    const [product, pageData] = await Promise.all([
        getProductCached(slug),
        getProductPageDataCached(slug),
    ]);

    if (!product?.product) {
        notFound();
    }

    // Keys must match useApiQuery, which appends the locale to every query key.
    // The pageData key's "default" segment is the no-city-selected initial state.
    const queryClient = makeQueryClient();
    queryClient.setQueryData(["product", slug, locale], product);
    if (pageData) {
        queryClient.setQueryData(["productPageData", slug, "default", locale], pageData);
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(
                        buildProductJsonLd(product.product, product.store, locale)
                    ),
                }}
            />
            <HydrationBoundary state={dehydrate(queryClient)}>
                <ProductDetailsPage />
            </HydrationBoundary>
        </>
    );
}
