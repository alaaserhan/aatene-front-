import { Metadata } from "next";
import MyRequestedServicesPage from "@/src/features/(web)/requested-services/components/MyRequestedServicesPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardRequestedServices", {
    title: "طلباتي الخاصة",
    description: "إدارة طلبات الخدمات الخاصة بك",
});

export default function Page() {
    return <MyRequestedServicesPage />;
}
