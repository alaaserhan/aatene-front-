import { Metadata } from "next";
import ProductDetailsPage from "@/src/features/(web)/product/ProductDetailsPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

// TODO: replace static metadata with generateMetadata() — fetch product by slug and use
// generateDynamicMetadata({ title: product.name, description: product.short_description, image: product.cover })
export const metadata: Metadata = generatePageMetadata("search", {
    title: "تفاصيل المنتج",
    description: "اطّلع على تفاصيل المنتج والتقييمات على منصة أعطيني.",
});

// TODO: convert to ISR (export const revalidate = 60) — ProductDetailsPage is fully client-side
// Plan: prefetch product + pageData server-side via React Query HydrationBoundary,
// and slim ProductDetailsPage down to a thin client shell (composition pattern).
export default function ProductPage() {
    return <ProductDetailsPage />;
}
