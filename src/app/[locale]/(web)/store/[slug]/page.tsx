import { Metadata } from "next";
import StoreProfilePage from "@/src/features/(web)/stores/pages/StoreProfilePage";
import { generatePageMetadata } from "@/src/lib/seo.config";
import { use } from "react";

export const metadata: Metadata = generatePageMetadata("search", {
    title: "صفحة المتجر",
    description: "تصفح منتجات وخدمات المتجر على منصة أعطيني.",
});

export default function StorePage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = use(params);
    return <StoreProfilePage slug={resolvedParams.slug} />;
}
