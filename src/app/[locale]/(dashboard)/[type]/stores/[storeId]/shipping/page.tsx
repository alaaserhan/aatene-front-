import { Metadata } from "next";
import { StoreShippingSettingsPage } from "@/src/features/(dashboard)/stores/components/StoreShippingSettingsPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardHome");

export default async function Page({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  return <StoreShippingSettingsPage storeId={Number(storeId)} />;
}
