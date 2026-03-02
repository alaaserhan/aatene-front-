import { Metadata } from "next";
import { ProductProvidersPage } from "@/src/features/(dashboard)/products/components/ProductProvidersPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardProductProviders");

export default function Page() {
  return <ProductProvidersPage />;
}
