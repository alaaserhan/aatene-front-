import { Metadata } from "next";
import { StoreSettingsPage } from "@/src/features/(dashboard)/stores/settings/StoreSettingsPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardHome");

export default async function Page({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  return <StoreSettingsPage storeId={Number(storeId)} />;
}
