"use client";

import dynamic from "next/dynamic";

const BotChat = dynamic(() => import("@/src/components/(web)/BotChat"), { ssr: false });
const NotificationPromptPopup = dynamic(() => import("@/src/components/(web)/NotificationPromptPopup"), { ssr: false });

export default function WebDynamicWidgets() {
    return (
        <>
            <BotChat />
            <NotificationPromptPopup />
        </>
    );
}
