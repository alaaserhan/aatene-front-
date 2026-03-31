"use client";

import dynamic from "next/dynamic";

const BotChat = dynamic(() => import("@/src/features/(web)/bot-chat/components/BotChat"), { ssr: false });
export default function WebDynamicWidgets() {
    return (
        <>
            <BotChat />
        </>
    );
}
