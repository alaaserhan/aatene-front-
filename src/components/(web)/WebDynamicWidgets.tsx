"use client";

import dynamic from "next/dynamic";

const BotChat = dynamic(() => import("@/src/components/(web)/BotChat"), { ssr: false });
export default function WebDynamicWidgets() {
    return (
        <>
            <BotChat />
        </>
    );
}
