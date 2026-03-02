import { Metadata } from "next";
import { ClientSettingsPage } from "@/src/features/(dashboard)/settings/components/ClientSettingsPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardSettings");

export default function SettingsPage() {
  return <ClientSettingsPage />;
}