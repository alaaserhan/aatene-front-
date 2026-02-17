"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import { Story } from "../types";
import { ShowStoryModal } from "@/src/features/(dashboard)/stories/components/ShowStoryModal";

interface HomeStoriesProps {
    stories: Story[];
}

export default function HomeStories({ stories }: HomeStoriesProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            const newScrollLeft =
                direction === "left"
                    ? scrollContainerRef.current.scrollLeft - scrollAmount
                    : scrollContainerRef.current.scrollLeft + scrollAmount;

            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: "smooth",
            });
        }
    };

    if (!stories || stories.length === 0) return null;

    return (
        <>
            <section className="py-8 bg-white" dir="rtl">
                <MaxWidthWrapper className="relative w-full">
                    <div className="flex gap-4">
                        {/* Static Green Card (Right Side) */}
                        <div
                            className="relative rounded-2xl overflow-hidden min-w-[160px] sm:min-w-[240px] p-6 shrink-0 h-[180px] sm:h-[220px] flex flex-col justify-between shadow-lg"
                            style={{ background: 'linear-gradient(0deg, #144221 0%, #34A853 100%)' }}
                        >
                            <div className="absolute top-0 left-0 w-full h-full bg-[url('/bg-story-card.png')] opacity-20 bg-cover bg-no-repeat pointer-events-none" />

                            {/* Navigation Arrows */}
                            <div className="flex  gap-2 relative z-10">
                                <button
                                    onClick={() => scroll("right")}
                                    className="w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm cursor-pointer"
                                    aria-label="Scroll Right"
                                >
                                    <ChevronRight className="w-5 h-5 text-white" />
                                </button>
                                <button
                                    onClick={() => scroll("left")}
                                    className="w-8 h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm cursor-pointer"
                                    aria-label="Scroll Left"
                                >
                                    <ChevronLeft className="w-5 h-5 text-white" />
                                </button>
                            </div>

                            {/* Text Content */}
                            <div className="flex flex-col gap-1 text-white relative z-10 mt-auto">
                                <h2 className="text-xl sm:text-2xl font-bold leading-tight">تابع قصص</h2>
                                <h3 className="text-xl sm:text-2xl font-bold leading-tight text-white/90">لأفضل</h3>
                                <p className="text-sm opacity-90 font-normal">متاجر ومستخدمين</p>
                            </div>

                            {/* Logo (Optional/Placeholder based on provided image) */}
                            <div className="absolute bottom-4 left-4 w-12 h-12 opacity-80">
                                {/* Use a placeholder or provided asset if available */}
                                {/* <Image src="/logo-white.png" alt="Logo" width={48} height={48} className="object-contain" /> */}
                            </div>
                        </div>

                        {/* Stories Carousel (Left Side) */}
                        <div
                            ref={scrollContainerRef}
                            className="flex overflow-x-auto gap-4 py-2 scroll-smooth scrollbar-hide flex-1 -mr-16"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {stories.map((story, index) => (
                                <div
                                    key={story.id}
                                    className="shrink-0 w-[100px] sm:w-[140px] h-[140px] sm:h-[180px] cursor-pointer"
                                    onClick={() => setSelectedStoryIndex(index)}
                                >
                                    <div className="relative w-full h-full rounded-2xl overflow-hidden  shadow-sm">
                                        {story.image ? (
                                            <Image
                                                src={story.image}
                                                alt={story.text || "Story"}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div
                                                className="w-full h-full flex items-center justify-center p-4 text-center"
                                                style={{ backgroundColor: story.color || '#e5e7eb' }}
                                            >
                                                <span className="text-sm font-medium text-white line-clamp-4">
                                                    {story.text}
                                                </span>
                                            </div>
                                        )}

                                        {/* Overlay & Play Icon (Always visible on hover or similar to image style) */}
                                        {story.image && (
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                                {/* <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center">
                                                    <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                                                </div> */}
                                            </div>
                                        )}

                                        {/* Gradient at bottom */}
                                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/50 to-transparent pointer-events-none" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </MaxWidthWrapper>
            </section>

            {/* Story Viewer Modal */}
            {selectedStoryIndex !== null && (
                <ShowStoryModal
                    isOpen={selectedStoryIndex !== null}
                    onClose={() => setSelectedStoryIndex(null)}
                    stories={stories}
                    initialIndex={selectedStoryIndex}
                    showActions={false} // Disable dropdown menu actions
                />
            )}
        </>
    );
}
