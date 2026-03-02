import { Metadata } from "next";
import { StoresPage } from "@/src/features/(dashboard)/stores/components/StoresPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardStores");

export default function Page() {
  return <StoresPage />;
}