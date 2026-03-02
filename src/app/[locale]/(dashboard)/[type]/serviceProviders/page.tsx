import { Metadata } from "next";
import { ServiceProvidersPage } from "@/src/features/(dashboard)/serviceProviders/components/ServiceProvidersPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardServiceProviders");

export default function Page() {
  return <ServiceProvidersPage />;
}