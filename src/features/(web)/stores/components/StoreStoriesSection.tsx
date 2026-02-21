"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Type, ImageIcon } from "lucide-react";
import { Story } from "@/src/features/(web)/home/types"; // using standard Story type
import { ShowStoryModal } from "@/src/features/(dashboard)/stories/components/ShowStoryModal";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

interface StoreStoriesSectionProps {
    stories: {
        id: number;
        image: string | null;
        text: string | null;
        color: string | null;
        created_at: string;
    }[];
    isOwnStore: boolean;
    onAddStory?: (mode: "text" | "media") => void;
}

export default function StoreStoriesSection({ stories, isOwnStore, onAddStory }: StoreStoriesSectionProps) {
    const [storyModalOpen, setStoryModalOpen] = useState(false);
    const [storyIndex, setStoryIndex] = useState(0);

    if (!isOwnStore && (!stories || stories.length === 0)) return null;

    const mappedStories: Story[] = stories.map(s => ({
        id: s.id,
        image: s.image,
        text: s.text,
        color: s.color,
        created_at: s.created_at,
    }));

    const handleStoryClick = (index: number) => {
        setStoryIndex(index);
        setStoryModalOpen(true);
    };

    return (
        <div className="mb-8 bg-white p-3 rounded-lg border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
            <h2 className="font-bold text-gray-900 mb-2 px-1 border-b border-gray-100 pb-2" dir="rtl">أبرز الأحداث</h2>
            <div className="flex gap-4 overflow-x-auto py-2 px-1 scrollbar-hide" dir="rtl">
                {isOwnStore && onAddStory && (
                    <DropdownMenu dir="rtl">
                        <DropdownMenuTrigger asChild>
                            <button className="shrink-0 flex flex-col items-center gap-1.5 cursor-pointer group outline-none">
                                <div className="w-[66px] h-[66px] rounded-full overflow-hidden border-[2.5px] border-[#F05A28] p-0.5 group-hover:scale-105 transition-transform flex items-center justify-center bg-white">
                                    <div className="w-full h-full rounded-full border border-gray-100 flex items-center justify-center bg-white">
                                        <Plus className="w-7 h-7 text-[#7352C7]" />
                                    </div>
                                </div>
                                <span className="text-[13px] font-medium text-[#3F3F46]">أضف قصتك</span>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 p-2 rounded-lg border border-gray-200 shadow-none bg-white z-50">
                            <DropdownMenuItem
                                onSelect={() => onAddStory("text")}
                                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg focus:bg-gray-50"
                            >
                                <div className="bg-blue-5 p-2 rounded">
                                    <Type className="w-5 h-5 text-blue-4" />
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="font-medium text-blue-4 text-sm">نص</span>
                                    <span className="text-xs text-gray-2 mt-0.5">قم باضافة نص الي قصتك</span>
                                </div>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onSelect={() => onAddStory("media")}
                                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg mt-1 focus:bg-gray-50"
                            >
                                <div className="bg-blue-5 p-2 rounded">
                                    <ImageIcon className="w-5 h-5 text-blue-4" />
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="font-medium text-blue-4 text-sm">صورة او فيديو</span>
                                    <span className="text-xs text-gray-2 mt-0.5">قم باضافة صورة او فيديو الي قصتك</span>
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                {stories.map((story, index) => (
                    <button
                        key={story.id}
                        onClick={() => handleStoryClick(index)}
                        className="shrink-0 flex flex-col items-center gap-1.5 cursor-pointer group"
                    >
                        <div
                            className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-3 p-0.5 group-hover:scale-105 transition-transform"
                        >
                            <div
                                className="w-full h-full rounded-full overflow-hidden flex items-center justify-center"
                                style={{ backgroundColor: story.color || "#3A5779" }}
                            >
                                {story.image ? (
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={story.image}
                                            alt="story"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <span className="text-white text-xs font-medium px-2 text-center line-clamp-2">
                                        {story.text}
                                    </span>
                                )}
                            </div>
                        </div>
                        <span className="text-[13px] font-medium text-gray-700 truncate w-16 text-center">
                            {story.text || "قصه جديدة"}
                        </span>
                    </button>
                ))}
            </div>

            {storyModalOpen && (
                <ShowStoryModal
                    isOpen={storyModalOpen}
                    onClose={() => setStoryModalOpen(false)}
                    stories={mappedStories}
                    initialIndex={storyIndex}
                    showActions={isOwnStore}
                />
            )}
        </div>
    );
}
