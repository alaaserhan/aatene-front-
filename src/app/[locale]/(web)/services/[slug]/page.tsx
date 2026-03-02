import { Metadata } from "next";
import ServiceDetailsPage from "@/src/features/(web)/services/ServiceDetailsPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("search", {
    title: "تفاصيل الخدمة",
    description: "اطّلع على تفاصيل الخدمة والتقييمات على منصة أعطيني.",
});

export default function ServicePage() {
    return <ServiceDetailsPage />;
}
