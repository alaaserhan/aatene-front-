"use client";

import { useState } from "react";
import Image from "next/image";
import { Story } from "@/src/features/(dashboard)/stories/api";
import { ShowStoryModal } from "@/src/features/(dashboard)/stories/components/ShowStoryModal";
import { StoreHighlight } from "../api";

interface StoreStoriesSectionProps {
    highlights: StoreHighlight[];
    isOwnStore: boolean;
}

export default function StoreStoriesSection({ highlights, isOwnStore }: StoreStoriesSectionProps) {
    const [storyModalOpen, setStoryModalOpen] = useState(false);
    const [selectedStories, setSelectedStories] = useState<Story[]>([]);

    const filteredHighlights = highlights.filter(h => h.stories && h.stories.length > 0);

    if (!isOwnStore && filteredHighlights.length === 0) return null;

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

    return (
        <div className="mb-8 bg-white p-3 rounded-lg border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
            <h2 className="font-bold text-gray-900 mb-2 px-1 border-b border-gray-100 pb-2" dir="rtl">أبرز الأحداث</h2>
            <div className="flex gap-4 overflow-x-auto py-2 px-1 scrollbar-hide" dir="rtl">
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
                                                className="w-full h-full flex items-center justify-center p-1 text-center text-white text-[10px] font-bold break-words leading-tight"
                                                style={{ backgroundColor: lastStory.color || "#3A5779" }}
                                            >
                                                {lastStory.text}
                                            </div>
                                        )
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-tr from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
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
