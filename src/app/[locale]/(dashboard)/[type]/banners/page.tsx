import { Metadata } from "next";
import { BannersPage } from "@/src/features/(dashboard)/banners/components/BannersPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardBanners");

export default function Page() {
  return <BannersPage />;
}