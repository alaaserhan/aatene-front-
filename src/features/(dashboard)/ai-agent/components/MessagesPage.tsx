// src/features/(dashboard)/ai-agent/pages/MessagesPage.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { PlatformsSidebar } from "../components/PlatformsSidebar";
import { Mosa3edySidebar } from "../home/components/Mosa3edySidebar";
import { ChatListSidebar } from "../components/ChatListSidebar";
import { ChatEmptyState } from "../components/ChatEmptyState";
import { ChatConversationView } from "../components/ChatConversationView";
import { Switch } from "@/src/components/ui/switch";
import { Label } from "@/src/components/ui/label";
import { ArrowRight } from "lucide-react";

export function MessagesPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const activePlatform = searchParams.get("platform") || "whatsapp";
    const selectedChatId = searchParams.get("chatId");

    const [showNeedsHuman, setShowNeedsHuman] = useState(false);

    const getPlatformTitle = (id: string) => {
        switch (id) {
            case "whatsapp": return "رسائل واتساب";
            case "api4_whatsapp": return "رسائل واتساب";
            case "messenger": return "رسائل ماسنجر";
            case "instagram": return "رسائل انستجرام";
            case "website": return "رسائل الموقع";
            case "mobile": return "رسائل الموبايل";
            case "deleted_chats": return "المحادثات المحذوفة";
            default: return "الرسائل";
        }
    };

    const handlePlatformSelect = (id: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("platform", id);
        params.delete("chatId");
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleChatSelect = (chatId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("chatId", chatId);
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleBackToList = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("chatId");
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="p-3 lg:p-5" dir="rtl">
            <div className="flex flex-col lg:flex-row gap-4 items-start">

                <div className="w-full lg:w-auto shrink-0 lg:sticky lg:top-25">
                    <Mosa3edySidebar isCollapsed />
                </div>

                <PlatformsSidebar
                    activePlatform={activePlatform}
                    onSelect={handlePlatformSelect}
                />

                <div className="flex-1 w-full bg-white rounded-2xl border border-gray-200 h-[calc(100vh-140px)] lg:h-[calc(100vh-124px)] flex flex-col overflow-hidden">

                    <div className="px-4 lg:px-6 py-3 lg:py-4 pt-4 lg:pt-6 border-b border-gray-100 flex flex-row justify-between items-start gap-3 bg-white">
                        <div className="flex items-center gap-3">
                            {selectedChatId && (
                                <button
                                    onClick={handleBackToList}
                                    className="lg:hidden p-2 -me-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            )}
                            <h1 className="text-xl lg:text-2xl font-semibold">
                                {getPlatformTitle(activePlatform)}
                            </h1>
                        </div>

                        <div className="flex items-center gap-2 lg:gap-3 bg-gray-50 px-3 lg:px-4 py-2 rounded-lg border border-gray-100">
                            <Switch
                                id="human-filter"
                                checked={showNeedsHuman}
                                onCheckedChange={(checked) => {
                                    setShowNeedsHuman(checked);
                                    if (checked) {
                                        const params = new URLSearchParams(searchParams.toString());
                                        params.delete("chatId");
                                        router.push(`${pathname}?${params.toString()}`);
                                    }
                                }}
                                dir="ltr"
                                className="data-[state=checked]:bg-[#D97706]"
                            />
                            <Label htmlFor="human-filter" className="text-xs lg:text-sm font-medium text-gray-2 cursor-pointer select-none whitespace-nowrap">
                                يحتاج تدخل بشري
                            </Label>
                        </div>
                    </div>

                    <div className="flex flex-1 overflow-hidden">

                        <div className={`
                            w-full lg:w-[320px] bg-white lg:border-e border-gray-200 flex flex-col h-full shrink-0
                            ${selectedChatId ? 'hidden lg:flex' : 'flex'}
                        `}>
                            <ChatListSidebar
                                platform={activePlatform}
                                selectedChatId={selectedChatId}
                                onSelectChat={handleChatSelect}
                                needsHuman={showNeedsHuman}
                            />
                        </div>

                        <div className={`
                            flex-1 relative p-0 flex flex-col min-w-0 bg-[#F8F9FA]
                            ${selectedChatId ? 'flex' : 'hidden lg:flex'}
                        `}>
                            {selectedChatId ? (
                                <ChatConversationView chatId={selectedChatId} platform={activePlatform} />
                            ) : (
                                <div className="p-4 h-full">
                                    <ChatEmptyState />
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}