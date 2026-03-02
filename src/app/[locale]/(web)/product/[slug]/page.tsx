import { Metadata } from "next";
import ProductDetailsPage from "@/src/features/(web)/product/ProductDetailsPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("search", {
    title: "تفاصيل المنتج",
    description: "اطّلع على تفاصيل المنتج والتقييمات على منصة أعطيني.",
});

export default function ProductPage() {
    return <ProductDetailsPage />;
}
