import { Metadata } from "next";
import { RelatedProductsPage } from "@/src/features/(dashboard)/related-products/components/RelatedProductsPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardRelatedProducts");

export default function Page() {
    return <RelatedProductsPage />;
}
