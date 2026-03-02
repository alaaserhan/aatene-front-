import { Metadata } from "next";
import { ProductsPage } from "@/src/features/(dashboard)/products/components/ProductsPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardProducts");

export default function Page() {
  return <ProductsPage />;
}