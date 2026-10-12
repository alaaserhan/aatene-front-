import { Suspense } from "react";
import type { Metadata } from "next";
import SearchPage from "@/src/features/(web)/search/components/SearchPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("products");

export default function ProductsPage() {
    return (
        <Suspense fallback={null}>
            <SearchPage type="products" />
        </Suspense>
    );
}
