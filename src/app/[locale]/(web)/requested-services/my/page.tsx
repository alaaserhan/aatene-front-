import { Metadata } from "next";
import MyRequestedServicesPage from "@/src/features/(web)/requested-services/components/MyRequestedServicesPage";
import { generateDynamicMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generateDynamicMetadata({
    title: "طلباتي",
    description: "عرض وإدارة طلبات الخدمات الخاصة بك على منصة أعطيني.",
});

export default function RequestedServicesRoute() {
    return <MyRequestedServicesPage />;
}
