import { Metadata } from "next";
import StoreProfilePage from "@/src/features/(web)/stores/pages/StoreProfilePage";
import { generatePageMetadata } from "@/src/lib/seo.config";
import { use } from "react";

// TODO: replace static metadata with generateMetadata() — fetch store by slug and use
// generateDynamicMetadata({ title: store.name, description: store.description, image: store.logo_url })
export const metadata: Metadata = generatePageMetadata("search", {
    title: "صفحة المتجر",
    description: "تصفح منتجات وخدمات المتجر على منصة أعطيني.",
});

// TODO: convert to ISR (export const revalidate = 60) — StoreProfilePage is fully client-side
// Plan: prefetch store profile server-side via React Query HydrationBoundary,
// and slim StoreProfilePage down to a thin client shell (composition pattern).
export default function StorePage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = use(params);
    return <StoreProfilePage slug={resolvedParams.slug} />;
}
