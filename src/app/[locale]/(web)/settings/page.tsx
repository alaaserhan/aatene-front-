import { Metadata } from "next";
import SettingsPage from "@/src/features/(web)/settings/SettingsPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("settings");

export default function Page() {
    return <SettingsPage />;
}
