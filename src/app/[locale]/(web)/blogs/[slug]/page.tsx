import { Metadata } from "next";
import { notFound } from "next/navigation";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import BlogDetailsPage from "@/src/features/(web)/blogs/components/BlogDetailsPage";
import type { Blog } from "@/src/features/(web)/blogs/types";
import { getBlogCached } from "@/src/features/(web)/blogs/server";
import { blogsKeys } from "@/src/features/(web)/blogs/hooks";
import {
    generateDynamicMetadata,
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
    const data = await getBlogCached(slug);
    const blog = data?.blog || data?.record;

    if (!blog) {
        return generateDynamicMetadata({
            title: "تفاصيل المقال",
            description: "اقرأ المقال كاملاً على مدونة أعطيني.",
        });
    }

    return {
        ...generateDynamicMetadata({
            title: blog.title,
            description:
                toPlainText(blog.description) || "اقرأ المقال كاملاً على مدونة أعطيني.",
            image: blog.thumbnail_url || blog.thumbnail || undefined,
            url: `${SITE_URL}/${locale}/blogs/${blog.slug}`,
        }),
        alternates: generateAlternates(locale, `/blogs/${blog.slug}`),
    };
}

function buildArticleJsonLd(blog: Blog, locale: string) {
    const personName = [blog.user?.first_name, blog.user?.last_name]
        .filter(Boolean)
        .join(" ")
        .trim();
    const authorName = blog.store?.name || personName;

    return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: blog.title,
        description: toPlainText(blog.description, 5000),
        url: `${SITE_URL}/${locale}/blogs/${blog.slug}`,
        ...(blog.thumbnail_url || blog.thumbnail
            ? { image: [blog.thumbnail_url || blog.thumbnail] }
            : {}),
        ...(blog.category && { articleSection: blog.category }),
        ...(blog.created_at && { datePublished: blog.created_at }),
        ...(blog.updated_at && { dateModified: blog.updated_at }),
        ...(authorName && {
            author: {
                "@type": blog.store?.name ? "Organization" : "Person",
                name: authorName,
            },
        }),
    };
}

export default async function BlogPage({ params }: PageProps) {
    const { locale, slug } = await params;

    const data = await getBlogCached(slug);
    const blog = data?.blog || data?.record;

    if (!blog) {
        notFound();
    }

    const queryClient = makeQueryClient();
    queryClient.setQueryData(blogsKeys.detail(slug), data);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(buildArticleJsonLd(blog, locale)),
                }}
            />
            <HydrationBoundary state={dehydrate(queryClient)}>
                <BlogDetailsPage />
            </HydrationBoundary>
        </>
    );
}
