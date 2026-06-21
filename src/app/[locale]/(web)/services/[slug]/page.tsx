import { Metadata } from "next";
import ServiceDetailsPage from "@/src/features/(web)/services/ServiceDetailsPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

// TODO: replace static metadata with generateMetadata() — fetch service by slug and use
// generateDynamicMetadata({ title: service.name, description: service.description, image: service.cover })
export const metadata: Metadata = generatePageMetadata("search", {
    title: "تفاصيل الخدمة",
    description: "اطّلع على تفاصيل الخدمة والتقييمات على منصة أعطيني.",
});

// TODO: convert to ISR (export const revalidate = 60) — ServiceDetailsPage is fully client-side
// Plan: prefetch service data server-side via React Query HydrationBoundary,
// and slim ServiceDetailsPage down to a thin client shell (composition pattern).
export default function ServicePage() {
    return <ServiceDetailsPage />;
}
