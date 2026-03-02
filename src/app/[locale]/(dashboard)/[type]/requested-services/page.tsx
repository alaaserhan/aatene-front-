import { Metadata } from "next";
import { RequestedServicesPage } from "@/src/features/(dashboard)/requested-services/components/RequestedServicesPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardRequestedServices");

export default async function Page() {
    return <RequestedServicesPage />;
}