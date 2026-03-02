import { Metadata } from "next";
import { NotificationsPage } from "@/src/features/(dashboard)/notifications/components/NotificationsPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardNotifications");

export default function Page() {
    return <NotificationsPage />;
}
