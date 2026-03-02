import { Metadata } from "next";
import { ChatPage } from "@/src/features/(dashboard)/chat/components/ChatPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardChat");

export default function Page() {
    return <ChatPage context="dashboard" />;
}
