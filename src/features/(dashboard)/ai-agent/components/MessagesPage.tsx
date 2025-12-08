// src/features/(dashboard)/ai-agent/pages/MessagesPage.tsx
"use client";

import { useState } from "react";
import { PlatformsSidebar } from "../components/PlatformsSidebar";
import { Mosa3edySidebar } from "../home/components/Mosa3edySidebar";
import { ChatListSidebar } from "../components/ChatListSidebar";
import { ChatEmptyState } from "../components/ChatEmptyState";
import { ChatConversationView } from "../components/ChatConversationView"; // Import the new component

export function MessagesPage() {
    const [activePlatform, setActivePlatform] = useState<string>("website");
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

    const getPlatformTitle = (id: string) => {
        switch(id) {
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
        setSelectedChatId(null); 
    };

    return (
        <div className="p-5" dir="rtl">
            <div className="flex flex-col lg:flex-row gap-4 items-start">

                <div className="hidden lg:block shrink-0 sticky top-6">
                    <Mosa3edySidebar isCollapsed />
                </div>

                <PlatformsSidebar
                    activePlatform={activePlatform}
                    onSelect={handlePlatformSelect}
                />

                <div className="flex-1 w-full bg-white rounded-2xl border border-gray-200 h-[calc(100vh-124px)] flex flex-col overflow-hidden">
                    
                    {/* Header */}
                    <div className="px-6 py-4 pt-6 border-b border-gray-100">
                        <h1 className="text-xl font-bold ">
                            {getPlatformTitle(activePlatform)}
                        </h1>
                    </div>

                    <div className="flex flex-1 overflow-hidden">

                        <div className="w-[320px] bg-white border-e border-gray-200 flex flex-col h-full">
                            <ChatListSidebar 
                                platform={activePlatform}
                                selectedChatId={selectedChatId}
                                onSelectChat={setSelectedChatId}
                            />
                        </div>
                        
                        <div className="flex-1 relative p-4 flex flex-col min-w-0">
                             {selectedChatId ? (
                                 <ChatConversationView chatId={selectedChatId} />
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