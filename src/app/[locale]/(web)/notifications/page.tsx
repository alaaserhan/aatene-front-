import { Metadata } from "next";
import NotificationsPage from "@/src/features/(web)/notifications/components/NotificationsPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("notifications");

export default function Page() {
    return <NotificationsPage />;
}
