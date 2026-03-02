import { Metadata } from "next";
import { ChatPage } from "@/src/features/(dashboard)/chat/components/ChatPage";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("chat");

export default function Page() {
    return <ChatPage context="web" />;
}
