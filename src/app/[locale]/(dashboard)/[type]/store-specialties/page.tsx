import { Metadata } from "next";
import { StoreSpecialtiesPage } from "@/src/features/(dashboard)/storeSpecialties/components/StoreSpecialtiesPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardStoreSpecialties");

export default function Page() {
  return <StoreSpecialtiesPage />;
}
