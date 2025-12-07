// src/features/(dashboard)/ai-agent/pages/MessagesPage.tsx
"use client";

import { useState } from "react";
import { PlatformsSidebar } from "../components/PlatformsSidebar";
import { Mosa3edySidebar } from "../home/components/Mosa3edySidebar";
import { ChatListSidebar } from "../components/ChatListSidebar";
import { ChatEmptyState } from "../components/ChatEmptyState";

export function MessagesPage() {
    const [activePlatform, setActivePlatform] = useState<string>("website");
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

    const getPlatformTitle = (id: string) => {
        switch (id) {
            case "website": return "رسائل الموقع الالكتروني";
            case "whatsapp": return "رسائل وتساب";
            case "messenger": return "رسائل ماسنجر";
            case "instagram": return "رسائل انستجرام";
            case "transferred": return "مراسلات محولة";
            default: return "الرسائل";
        }
    };

    const handlePlatformSelect = (id: string) => {
        setActivePlatform(id);
        setSelectedChatId(null); // Reset selection when changing platform
    };

    return (
        <div className="p-5" dir="rtl">
            <div className="flex flex-col lg:flex-row gap-4 items-start">

                {/* 1. Main App Sidebar */}
                <div className="hidden lg:block shrink-0 sticky top-6">
                    <Mosa3edySidebar isCollapsed />
                </div>

                {/* 2. Platforms Sidebar */}
                <PlatformsSidebar
                    activePlatform={activePlatform}
                    onSelect={handlePlatformSelect}
                />

                {/* 3. Main Content (Chat Interface) */}
                <div className="flex-1 w-full bg-white rounded-2xl border border-gray-200 h-[calc(100vh-124px)] flex flex-col overflow-hidden">

                    {/* Header */}
                    <div className="px-6 py-4 pt-6 border-b border-gray-100">
                        <h1 className="text-xl font-bold ">
                            {getPlatformTitle(activePlatform)}
                        </h1>
                    </div>

                    {/* Content Area (Split View) */}
                    <div className="flex flex-1 overflow-hidden">

                        <div className="w-[320px] bg-white border-e border-gray-200 flex flex-col h-full">
                            <ChatListSidebar
                                platform={activePlatform}
                                selectedChatId={selectedChatId}
                                onSelectChat={setSelectedChatId}
                            />
                        </div>

                        <div className="flex-1 relative p-4">
                            {selectedChatId ? (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    {/* Future: <ChatConversationView chatId={selectedChatId} /> */}
                                    <p>منطقة المحادثة (قيد التطوير) - ID: {selectedChatId}</p>
                                </div>
                            ) : (
                                <ChatEmptyState />
                            )}
                        </div>


                    </div>
                </div>
            </div>
        </div>
    );
}