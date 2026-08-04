import { Metadata } from "next";
import { StoreSettingsPage } from "@/src/features/(dashboard)/stores/settings/StoreSettingsPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardHome");

/**
 * Same sections as the settings page, but not tied to the store selected in
 * the merchant's store context, so any store can be edited from its own URL.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  return (
    <StoreSettingsPage storeId={Number(storeId)} lockToCurrentStore={false} />
  );
}
