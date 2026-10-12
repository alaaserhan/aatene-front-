import { Suspense } from "react";
import type { Metadata } from "next";
import SearchPage from "@/src/features/(web)/search/components/SearchPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("stores");

export default function StoresPage() {
    return (
        <Suspense fallback={null}>
            <SearchPage type="stores" />
        </Suspense>
    );
}
