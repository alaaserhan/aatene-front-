"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import { Story } from "../types";
import { ShowStoryModal } from "@/src/features/(dashboard)/stories/components/ShowStoryModal";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

interface HomeStoriesProps {
    stories: Story[];
}

export default function HomeStories({ stories }: HomeStoriesProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);

    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [hasDragged, setHasDragged] = useState(false);

    useEffect(() => {
        const storyIdParam = searchParams.get('storyId');
        if (storyIdParam) {
            const index = stories.findIndex(s => s.id.toString() === storyIdParam);
            if (index !== -1) {
                // eslint-disable-next-line
                setSelectedStoryIndex(index);
            }
        } else {
            setSelectedStoryIndex(null);
        }
    }, [searchParams, stories]);

    const handleSelectStory = (index: number) => {
        const selectedStoryId = stories[index].id;
        const params = new URLSearchParams(searchParams.toString());
        params.set('storyId', selectedStoryId.toString());
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleCloseModal = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('storyId');
        router.push(`${pathname}${params.size > 0 ? '?' + params.toString() : ''}`, { scroll: false });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollContainerRef.current) return;
        setIsDragging(true);
        setHasDragged(false);
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        if (Math.abs(walk) > 10) {
            setHasDragged(true);
        }
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

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
                    <div className="flex gap-2 sm:gap-4">
                        {/* Static Green Card (Right Side) */}
                        <div
                            className="relative rounded-2xl overflow-hidden w-[130px] min-w-[130px] sm:w-[240px] sm:min-w-[240px] p-4 sm:p-6 shrink-0 h-[170px] sm:h-[220px] flex flex-col justify-between shadow-lg"
                            style={{ background: 'linear-gradient(0deg, #144221 0%, #34A853 100%)' }}
                        >
                            <div className="absolute top-0 left-0 w-full h-full bg-[url('/bg-story-card.png')] opacity-20 bg-cover bg-no-repeat pointer-events-none" />

                            {/* Navigation Arrows */}
                            <div className="flex gap-1 sm:gap-2 relative z-10">
                                <button
                                    onClick={() => scroll("right")}
                                    className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm cursor-pointer"
                                    aria-label="Scroll Right"
                                >
                                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </button>
                                <button
                                    onClick={() => scroll("left")}
                                    className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm cursor-pointer"
                                    aria-label="Scroll Left"
                                >
                                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </button>
                            </div>

                            {/* Text Content */}
                            <div className="flex flex-col gap-0.5 sm:gap-1 text-white relative z-10 mt-auto">
                                <h2 className="text-base sm:text-2xl font-bold leading-tight">تابع قصص</h2>
                                <h3 className="text-base sm:text-2xl font-bold leading-tight text-white/90">لأفضل</h3>
                                <p className="text-[11px] sm:text-sm opacity-90 font-normal mt-1">متاجر ومستخدمين</p>
                            </div>

                            {/* Logo (Optional/Placeholder based on provided image) */}
                            <div className="absolute bottom-4 left-4 w-12 h-12 opacity-80 pointer-events-none">
                                {/* Use a placeholder or provided asset if available */}
                                {/* <Image src="/logo-white.png" alt="Logo" width={48} height={48} className="object-contain" /> */}
                            </div>
                        </div>

                        {/* Stories Carousel (Left Side) */}
                        <div
                            ref={scrollContainerRef}
                            className="flex overflow-x-auto gap-3 sm:gap-4 py-2 scroll-smooth scrollbar-hide flex-1 -mr-8 sm:-mr-20"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            onMouseDown={handleMouseDown}
                            onMouseLeave={handleMouseLeave}
                            onMouseUp={handleMouseUp}
                            onMouseMove={handleMouseMove}
                        >
                            {stories.map((story, index) => (
                                <div
                                    key={story.id}
                                    className="shrink-0 w-[95px] sm:w-[140px] cursor-pointer h-fit bg-white rounded-xl shadow-sm z-[20] select-none"
                                    onClick={() => {
                                        if (!hasDragged) handleSelectStory(index);
                                    }}
                                >
                                    <div className="relative w-full h-[120px] sm:h-[170px] rounded-lg overflow-hidden pointer-events-none">
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
                                                <span className="text-sm  font-medium text-white line-clamp-4">
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
                                    <div className="my-1 text-center w-full px-1">
                                        <span className="text-[13px]  font-medium text-[#3F3F46] truncate block px-1">
                                            {story.owner?.name || " "}
                                        </span>
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
                    onClose={handleCloseModal}
                    stories={stories}
                    initialIndex={selectedStoryIndex}
                    showActions={false} // Disable dropdown menu actions
                />
            )}
        </>
    );
}
