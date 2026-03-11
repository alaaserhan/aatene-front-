"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Banner } from "../types";
import { cn } from "@/src/lib/utils";
import { useFirstBanners } from "../hooks";

interface HomeBannersProps {
    banners?: Banner[]; // Keep optional for backward compatibility or initial server render if needed
}

export default function HomeBanners({ banners: initialBanners }: HomeBannersProps) {
    const { data: response } = useFirstBanners();
    const banners = initialBanners || response?.data || [];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [imageError, setImageError] = useState<Record<string, boolean>>({});

    const handleNext = useCallback(() => {
        if (!banners.length) return;
        setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, [banners.length]);

    const handlePrev = useCallback(() => {
        if (!banners.length) return;
        setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
    }, [banners.length]);

    useEffect(() => {
        if (banners.length <= 1) return;
        const interval = setInterval(handleNext, 5000);
        return () => clearInterval(interval);
    }, [banners.length, handleNext]);

    if (!banners || banners.length === 0) return null;

    const currentBanner = banners[currentIndex];

    // Check if valid images exist for current banner
    const hasLaptopImage = currentBanner?.labtop_banner_url && !imageError[`${currentIndex}-desktop`];
    const hasMobileImage = currentBanner?.mobile_banner_url && !imageError[`${currentIndex}-mobile`];

    // Fallback if one is missing but other exists
    const desktopSrc = hasLaptopImage ? currentBanner.labtop_banner_url : (hasMobileImage ? currentBanner.mobile_banner_url : null);
    const mobileSrc = hasMobileImage ? currentBanner.mobile_banner_url : (hasLaptopImage ? currentBanner.labtop_banner_url : null);

    return (
        <div className="relative w-full aspect-360/200 md:aspect-1170/300 overflow-hidden direction-ltr" dir="ltr">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 w-full h-full"
                >
                    <Link
                        href={currentBanner.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full h-full"
                    >
                        {/* Desktop Image */}
                        <div className="hidden md:block w-full h-full relative">
                            {desktopSrc ? (
                                <Image
                                    src={desktopSrc}
                                    alt={currentBanner.title || "Banner"}
                                    fill
                                    className="object-cover w-full h-full"
                                    priority={currentIndex === 0}
                                    onError={() => setImageError(prev => ({ ...prev, [`${currentIndex}-desktop`]: true }))}
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                    No Image Available
                                </div>
                            )}
                        </div>

                        {/* Mobile Image */}
                        <div className="block md:hidden w-full h-full relative">
                            {mobileSrc ? (
                                <Image
                                    src={mobileSrc}
                                    alt={currentBanner.title || "Banner"}
                                    fill
                                    className="object-cover w-full h-full"
                                    priority={currentIndex === 0}
                                    onError={() => setImageError(prev => ({ ...prev, [`${currentIndex}-mobile`]: true }))}
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                    No Image Available
                                </div>
                            )}
                        </div>
                    </Link>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {banners.length > 1 && (
                <>
                    <button
                        onClick={handlePrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 md:p-3 rounded-full backdrop-blur-sm transition-all z-10"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 md:p-3 rounded-full backdrop-blur-sm transition-all z-10"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </>
            )}

            {/* Dots Indicator */}
            {banners.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={cn(
                                "w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300",
                                currentIndex === index
                                    ? "bg-white w-6 md:w-8"
                                    : "bg-white/50 hover:bg-white/70"
                            )}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
