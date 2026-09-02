"use client";

import { useEffect } from "react";
import { Bot } from "lucide-react";
import { useAuth } from "@/src/auth";
import { useUIStore } from "@/src/stores/ui-store";
import { useIsChatBotAllowed } from "@/src/stores/settings-store";
import { usePathname } from "next/navigation";
import BotChatWindow from "./BotChatWindow";

export default function BotChat() {
    const { isLoggedIn, user } = useAuth();
    const pathname = usePathname();
    const isChatBotAllowed = useIsChatBotAllowed();

    const isOpen = useUIStore((state) => state.isChatOpen);
    const setChatOpen = useUIStore((state) => state.setChatOpen);
    const toggleChat = useUIStore((state) => state.toggleChat);

    useEffect(() => {
        setChatOpen(false);
    }, [pathname, setChatOpen]);

    // The bot can be turned off platform-wide from the admin settings; make
    // sure a window left open in the store doesn't survive that.
    useEffect(() => {
        if (!isChatBotAllowed) setChatOpen(false);
    }, [isChatBotAllowed, setChatOpen]);

    if (!isChatBotAllowed) return null;
    if (!isLoggedIn || !user) return null;

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] md:hidden animate-in fade-in duration-300"
                    onClick={() => setChatOpen(false)}
                />
            )}

            {isOpen && (
                <BotChatWindow onClose={() => setChatOpen(false)} />
            )}

            <button
                onClick={toggleChat}
                className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 cursor-pointer group"
                style={{
                    background: "linear-gradient(135deg, #2c4460 0%, #4a7ab5 100%)",
                    boxShadow: "0 6px 24px rgba(44,68,96,0.35)",
                }}
            >
                <Bot className="w-7 h-7 transition-transform duration-300 group-hover:scale-110" />
            </button>
        </>
    );
}
