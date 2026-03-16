"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Type, Image as ImageIcon } from "lucide-react";
import { Story } from "@/src/features/(dashboard)/stories/api";
import { ShowStoryModal } from "@/src/features/(dashboard)/stories/components/ShowStoryModal";
import { StoreHighlight } from "../api";
import api from "@/src/lib/axios";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

interface StoreStoriesSectionProps {
    highlights: StoreHighlight[];
    isOwnStore: boolean;
    isAdmin?: boolean;
    storeId?: number | string;
    onAddHighlight?: () => void;
    onAddStory?: (mode: "text" | "media") => void;
}

export default function StoreStoriesSection({
    highlights,
    isOwnStore,
    isAdmin = false,
    storeId,
    onAddHighlight,
    onAddStory,
}: StoreStoriesSectionProps) {
    const [storyModalOpen, setStoryModalOpen] = useState(false);
    const [selectedStories, setSelectedStories] = useState<Story[]>([]);

    const filteredHighlights = highlights.filter(h => h.stories && h.stories.length > 0);

    if (!isOwnStore && !isAdmin && filteredHighlights.length === 0) return null;

    const getLastStory = (highlight: StoreHighlight) => {
        if (!highlight.stories || highlight.stories.length === 0) return undefined;
        return highlight.stories[highlight.stories.length - 1];
    };

    const handleHighlightClick = (highlight: StoreHighlight) => {
        const mapped: Story[] = highlight.stories.map(s => ({
            id: s.id,
            image: s.image,
            text: s.text,
            color: s.color,
            created_at: s.created_at,
        }));
        setSelectedStories(mapped);
        setStoryModalOpen(true);
    };

    const handleAddHighlightClick = () => {
        if (storeId) {
            api.defaults.headers.common["storeId"] = String(storeId);
        }
        if (onAddHighlight) onAddHighlight();
    };

    const handleAddStoryClick = (mode: "text" | "media") => {
        if (storeId) {
            api.defaults.headers.common["storeId"] = String(storeId);
        }
        if (onAddStory) onAddStory(mode);
    };

    return (
        <div className="mb-8 bg-white p-3 rounded-lg border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
            <h2 className="font-bold text-gray-900 mb-2 px-1 border-b border-gray-100 pb-2" dir="rtl">أبرز الأحداث</h2>
            <div className="flex gap-4 overflow-x-auto py-2 px-1 scrollbar-hide" dir="rtl">
                {isOwnStore && onAddHighlight && (
                    <button
                        onClick={handleAddHighlightClick}
                        className="shrink-0 flex flex-col items-center gap-1.5 cursor-pointer group outline-none"
                    >
                        <div className="w-[66px] h-[66px] rounded-full overflow-hidden border-[2.5px] border-[#F05A28] p-0.5 group-hover:scale-105 transition-transform flex items-center justify-center bg-white">
                            <div className="w-full h-full rounded-full border border-gray-100 flex items-center justify-center bg-white">
                                <Plus className="w-7 h-7 text-[#7352C7]" />
                            </div>
                        </div>
                        <span className="text-[13px] font-medium text-[#3F3F46]">أضف هايلايت</span>
                    </button>
                )}

                {/* {isAdmin && onAddStory && (
                    <DropdownMenu dir="rtl">
                        <DropdownMenuTrigger asChild>
                            <button className="shrink-0 flex flex-col items-center gap-1.5 cursor-pointer group outline-none">
                                <div className="w-[66px] h-[66px] rounded-full overflow-hidden border-[2.5px] border-blue-4 p-0.5 group-hover:scale-105 transition-transform flex items-center justify-center bg-white">
                                    <div className="w-full h-full rounded-full border border-gray-100 flex items-center justify-center bg-white">
                                        <Plus className="w-7 h-7 text-blue-4" />
                                    </div>
                                </div>
                                <span className="text-[13px] font-medium text-[#3F3F46]">أضف قصة</span>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 p-2 rounded-lg border border-gray-200 shadow-none bg-white z-50">
                            <DropdownMenuItem
                                onSelect={() => handleAddStoryClick("text")}
                                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg focus:bg-gray-50"
                            >
                                <div className="bg-blue-5 p-2 rounded">
                                    <Type className="w-5 h-5 text-blue-4" />
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="font-medium text-blue-4 text-sm">نص</span>
                                    <span className="text-xs text-gray-2 mt-0.5">قم باضافة نص الي القصة</span>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => handleAddStoryClick("media")}
                                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg mt-1 focus:bg-gray-50"
                            >
                                <div className="bg-blue-5 p-2 rounded">
                                    <ImageIcon className="w-5 h-5 text-blue-4" />
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="font-medium text-blue-4 text-sm">صورة او فيديو</span>
                                    <span className="text-xs text-gray-2 mt-0.5">قم باضافة صورة او فيديو الي القصة</span>
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )} */}

                {filteredHighlights.map((highlight) => {
                    const lastStory = getLastStory(highlight);
                    return (
                        <button
                            key={highlight.id}
                            onClick={() => handleHighlightClick(highlight)}
                            className="shrink-0 flex flex-col items-center gap-1.5 cursor-pointer group"
                        >
                            <div className="w-18 h-18 rounded-full border-2 border-blue-4 p-1 group-hover:scale-105 transition-transform">
                                <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden relative border border-gray-100 flex items-center justify-center">
                                    {lastStory ? (
                                        lastStory.image ? (
                                            <div className="relative w-full h-full">
                                                <Image
                                                    src={lastStory.image}
                                                    alt={highlight.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                className="w-full h-full flex items-center justify-center p-1 text-center text-white text-[10px] font-bold leading-tight"
                                                style={{ backgroundColor: lastStory.color || "#3A5779" }}
                                            >
                                                {lastStory.text}
                                            </div>
                                        )
                                    ) : (
                                        <div className="w-full h-full bg-linear-to-tr from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                            {highlight.name[0]}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <span className="text-[13px] font-medium text-gray-700 truncate w-18 text-center">
                                {highlight.name}
                            </span>
                        </button>
                    );
                })}
            </div>

            {storyModalOpen && (
                <ShowStoryModal
                    isOpen={storyModalOpen}
                    onClose={() => setStoryModalOpen(false)}
                    stories={selectedStories}
                    initialIndex={0}
                    showActions={false}
                />
            )}
        </div>
    );
}
