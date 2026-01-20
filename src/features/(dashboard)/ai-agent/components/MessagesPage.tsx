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

export function MessagesPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // استخراج القيم من الرابط أو استخدام القيم الافتراضية
    const activePlatform = searchParams.get("platform") || "whatsapp";
    const selectedChatId = searchParams.get("chatId");

    // حالة الفلتر يمكن أن تبقى محلية أو تضاف للرابط أيضاً (هنا تركتها محلية للتبسيط كما طلبت)
    const [showNeedsHuman, setShowNeedsHuman] = useState(false);

    const getPlatformTitle = (id: string) => {
        switch (id) {
            // case "website": return "رسائل الموقع الالكتروني";
            case "whatsapp": return "رسائل وتساب";
            case "messenger": return "رسائل ماسنجر";
            case "instagram": return "رسائل انستجرام";
            default: return "الرسائل";
        }
    };

    // دالة لتحديث الرابط عند تغيير المنصة
    const handlePlatformSelect = (id: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("platform", id);
        params.delete("chatId"); // إزالة الشات المحدد عند تغيير المنصة
        router.push(`${pathname}?${params.toString()}`);
    };

    // دالة لتحديث الرابط عند اختيار محادثة
    const handleChatSelect = (chatId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("chatId", chatId);
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="p-5" dir="rtl">
            <div className="flex flex-col lg:flex-row gap-4 items-start">

                <div className="hidden lg:block shrink-0 sticky top-25">
                    <Mosa3edySidebar isCollapsed />
                </div>

                <PlatformsSidebar
                    activePlatform={activePlatform}
                    onSelect={handlePlatformSelect}
                />

                <div className="flex-1 w-full bg-white rounded-2xl border border-gray-200 h-[calc(100vh-124px)] flex flex-col overflow-hidden">

                    <div className="px-6 py-4 pt-6 border-b border-gray-100 flex justify-between items-center bg-white">
                        <h1 className="text-xl font-bold ">
                            {getPlatformTitle(activePlatform)}
                        </h1>

                        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
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
                            <Label htmlFor="human-filter" className="text-sm font-medium text-gray-2 cursor-pointer select-none">
                                يحتاج تدخل بشري
                            </Label>
                        </div>
                    </div>

                    <div className="flex flex-1 overflow-hidden">

                        <div className="w-[320px] bg-white border-e border-gray-200 flex flex-col h-full shrink-0">
                            <ChatListSidebar
                                platform={activePlatform}
                                selectedChatId={selectedChatId}
                                onSelectChat={handleChatSelect}
                                needsHuman={showNeedsHuman}
                            />
                        </div>

                        <div className="flex-1 relative p-0 flex flex-col min-w-0 bg-[#F8F9FA]">
                            {selectedChatId ? (
                                <ChatConversationView chatId={selectedChatId} />
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