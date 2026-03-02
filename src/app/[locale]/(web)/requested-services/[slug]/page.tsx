import { Metadata } from "next";
import RequestedServiceDetailsPage from "@/src/features/(web)/requested-services/components/RequestedServiceDetailsPage";
import { generateDynamicMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generateDynamicMetadata({
    title: "تفاصيل الخدمة المطلوبة",
    description: "عرض تفاصيل طلب الخدمة والعروض المقدمة على منصة أعطيني.",
});

export default function RequestedServiceDetailsRoute() {
    return <RequestedServiceDetailsPage />;
}
