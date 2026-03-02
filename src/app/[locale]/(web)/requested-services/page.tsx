import { Metadata } from "next";
import RequestedServicesPage from "@/src/features/(web)/requested-services/RequestedServicesPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("requestedServices");

export default function RequestedServicesRoute() {
    return <RequestedServicesPage />;
}
