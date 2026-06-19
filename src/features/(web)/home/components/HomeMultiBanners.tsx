"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import { Banner } from "../types";
import { cn, isVideoFile } from "@/src/lib/utils";
import LazyBannerVideo from "./LazyBannerVideo";

interface HomeMultiBannersProps {
    banners: Banner[];
}

export default function HomeMultiBanners({ banners }: HomeMultiBannersProps) {
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    if (!banners || banners.length === 0) return null;

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return;
        const scrollAmount = 400;
        scrollRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    return (
        <section className="py-8 md:py-16 w-full relative group/section">
            <MaxWidthWrapper className="px-2 md:px-8 relative">
                {/* Desktop Navigation Arrows */}
                <div className="hidden md:block">
                    <button
                        onClick={() => scroll("right")}
                        className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full p-2 opacity-0 group-hover/section:opacity-100 transition-all hover:bg-gray-50 border border-gray-100"
                    >
                    <ChevronLeft className="w-6 h-6 text-black" />
                    </button>
                    <button
                        onClick={() => scroll("left")}
                        className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full p-2 opacity-0 group-hover/section:opacity-100 transition-all hover:bg-gray-50 border border-gray-100"
                    >
                        <ChevronRight className="w-6 h-6 text-black" />
                    </button>
                </div>

                <div
                    ref={scrollRef}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    className={cn(
                        "flex gap-4 items-center -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto no-scrollbar pb-4 md:pb-0 select-none",
                        isDragging ? "cursor-grabbing" : "cursor-grab",
                        banners.length > 3 ? "snap-x snap-mandatory" : ""
                    )}
                >
                    {banners.map((banner, index) => (
                        <div
                            key={banner.id || index}
                            className="w-[85vw] sm:w-[50vw] md:w-[calc(33.333%-11px)] shrink-0 snap-center"
                        >
                            <BannerItem banner={banner} />
                        </div>
                    ))}
                </div>
            </MaxWidthWrapper>
        </section>
    );
}

function BannerItem({ banner }: { banner: Banner }) {
    const [imageError, setImageError] = useState({ desktop: false, mobile: false });

    const hasDesktopImage = banner.labtop_banner_url && !imageError.desktop;
    const hasMobileImage = banner.mobile_banner_url && !imageError.mobile;

    const desktopSrc = hasDesktopImage ? banner.labtop_banner_url : (hasMobileImage ? banner.mobile_banner_url : "/placeholder.png");
    const mobileSrc = hasMobileImage ? banner.mobile_banner_url : (hasDesktopImage ? banner.labtop_banner_url : "/placeholder.png");

    const linkHref = banner.url || "#";

    return (
        <Link
            href={linkHref}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative w-full aspect-360/200 md:aspect-370/200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group shrink-0"
        >
            {/* Art Direction: Both images rendered, CSS handles visibility (No JS flash) */}
            <div className="hidden md:block w-full h-full relative">
                {isVideoFile(desktopSrc) ? (
                    <LazyBannerVideo
                        src={desktopSrc}
                        className="object-cover w-full h-full absolute inset-0 pointer-events-none transition-transform duration-500 group-hover:scale-105"
                        onError={() => setImageError(prev => ({ ...prev, desktop: true }))}
                    />
                ) : (
                    <Image
                        src={desktopSrc}
                        alt={banner.title || "Banner"}
                        fill
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        onError={() => setImageError(prev => ({ ...prev, desktop: true }))}
                        sizes="(max-width: 768px) 50vw, 370px"
                    />
                )}
            </div>
            <div className="block md:hidden w-full h-full relative">
                {isVideoFile(mobileSrc) ? (
                    <LazyBannerVideo
                        src={mobileSrc}
                        className="object-cover w-full h-full absolute inset-0 pointer-events-none transition-transform duration-500 group-hover:scale-105"
                        onError={() => setImageError(prev => ({ ...prev, mobile: true }))}
                    />
                ) : (
                    <Image
                        src={mobileSrc}
                        alt={banner.title || "Banner"}
                        fill
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        onError={() => setImageError(prev => ({ ...prev, mobile: true }))}
                        sizes="85vw"
                    />
                )}
            </div>
        </Link>
    );
}
