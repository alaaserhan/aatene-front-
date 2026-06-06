"use client";

import { useState, useEffect, useCallback } from "react";
import { getImageProps } from "next/image";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Banner } from "../types";
import { cn, isVideoFile } from "@/src/lib/utils";
import { useFirstBanners } from "../hooks";
import { BannerSkeleton } from "./HomeSkeletons";
import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";

interface HomeBannersProps {
    banners?: Banner[]; // Keep optional for backward compatibility or initial server render if needed
}

export default function HomeBanners({ banners: initialBanners }: HomeBannersProps) {
    const { data: response, isLoading } = useFirstBanners({
        enabled: !initialBanners,
    });
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

    if (isLoading && !initialBanners) return <BannerSkeleton />;
    if (!banners || banners.length === 0) return null;

    const currentBanner = banners[currentIndex];

    // Check if valid images exist for current banner
    const hasLaptopImage = currentBanner?.labtop_banner_url && !imageError[`${currentIndex}-desktop`];
    const hasMobileImage = currentBanner?.mobile_banner_url && !imageError[`${currentIndex}-mobile`];

    // Fallback if one is missing but other exists
    const desktopSrc = hasLaptopImage ? currentBanner.labtop_banner_url : (hasMobileImage ? currentBanner.mobile_banner_url : null);
    const mobileSrc = hasMobileImage ? currentBanner.mobile_banner_url : (hasLaptopImage ? currentBanner.labtop_banner_url : null);
    return (
        <section className="bg-white pt-2 md:pt-4">
            <MaxWidthWrapper>
                <div className="relative aspect-[360/150] sm:aspect-auto w-full overflow-hidden rounded-xl bg-gray-100 shadow-sm direction-ltr sm:h-[230px] lg:h-[300px] 2xl:h-[320px]">
                <div
                    key={currentIndex}
                    className="absolute inset-0 w-full h-full transition-opacity duration-500"
                    style={{ opacity: 1 }}
                >
                    <Link
                        href={currentBanner.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full h-full"
                    >
                        {desktopSrc || mobileSrc ? (
                            isVideoFile(desktopSrc || mobileSrc || "") || isVideoFile(mobileSrc || desktopSrc || "") ? (
                                <>
                                    <video
                                        src={desktopSrc || mobileSrc || undefined}
                                        className="hidden md:block object-cover w-full h-full absolute inset-0 pointer-events-none"
                                        autoPlay muted loop playsInline preload={currentIndex === 0 ? "metadata" : "none"} onContextMenu={(e) => e.preventDefault()}
                                        onError={() => setImageError(prev => ({ ...prev, [`${currentIndex}-desktop`]: true }))}
                                    />
                                    <video
                                        src={mobileSrc || desktopSrc || undefined}
                                        className="block md:hidden object-cover w-full h-full absolute inset-0 pointer-events-none"
                                        autoPlay muted loop playsInline preload={currentIndex === 0 ? "metadata" : "none"} onContextMenu={(e) => e.preventDefault()}
                                        onError={() => setImageError(prev => ({ ...prev, [`${currentIndex}-mobile`]: true }))}
                                    />
                                </>
                            ) : (
                                <ResponsiveBannerImage
                                    desktopSrc={desktopSrc || mobileSrc || ""}
                                    mobileSrc={mobileSrc || desktopSrc || ""}
                                    alt={currentBanner.title && !currentBanner.title.startsWith("http") ? currentBanner.title : "Aatene Banner"}
                                    highPriority={currentIndex === 0}
                                    onDesktopError={() => setImageError(prev => ({ ...prev, [`${currentIndex}-desktop`]: true }))}
                                    onMobileError={() => setImageError(prev => ({ ...prev, [`${currentIndex}-mobile`]: true }))}
                                />
                            )
                        ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                No Image Available
                            </div>
                        )}
                    </Link>
                </div>

                {/* Navigation Arrows */}
                {banners.length > 1 && (
                    <>
                        <button
                            onClick={handleNext}
                            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/75 p-2 text-blue-4 shadow-sm backdrop-blur-sm transition-all hover:bg-white md:right-4 md:p-3"
                            aria-label="Next slide"
                        >
                            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <button
                            onClick={handlePrev}
                            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/75 p-2 text-blue-4 shadow-sm backdrop-blur-sm transition-all hover:bg-white md:left-4 md:p-3"
                            aria-label="Previous slide"
                        >
                            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                    </>
                )}

                {/* Dots Indicator */}
                {banners.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2 md:bottom-4">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={cn(
                                    "w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300",
                                    currentIndex === index
                                        ? "bg-white w-6 shadow-sm md:w-8"
                                        : "bg-white/60 hover:bg-white/80"
                                )}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
                </div>
            </MaxWidthWrapper>
        </section>
    );
}

function ResponsiveBannerImage({
    desktopSrc,
    mobileSrc,
    alt,
    highPriority,
    onDesktopError,
    onMobileError,
}: {
    desktopSrc: string;
    mobileSrc: string;
    alt: string;
    highPriority: boolean;
    onDesktopError: () => void;
    onMobileError: () => void;
}) {
    const common = {
        alt,
        className: "object-cover w-full h-full absolute inset-0",
        loading: highPriority ? "eager" as const : "lazy" as const,
        fetchPriority: highPriority ? "high" as const : "auto" as const,
    };
    const { props: desktop } = getImageProps({
        ...common,
        src: desktopSrc,
        width: 1400,
        height: 320,
        sizes: "(min-width: 768px) 1400px, 100vw",
    });
    const { props: mobile } = getImageProps({
        ...common,
        src: mobileSrc,
        width: 720,
        height: 300,
        sizes: "100vw",
    });

    return (
        <>
            {highPriority ? (
                <>
                    <link
                        rel="preload"
                        as="image"
                        imageSrcSet={desktop.srcSet}
                        imageSizes={desktop.sizes}
                        media="(min-width: 768px)"
                        fetchPriority="high"
                    />
                    <link
                        rel="preload"
                        as="image"
                        imageSrcSet={mobile.srcSet}
                        imageSizes={mobile.sizes}
                        media="(max-width: 767px)"
                        fetchPriority="high"
                    />
                </>
            ) : null}
            <picture className="absolute inset-0 block h-full w-full">
                <source media="(min-width: 768px)" srcSet={desktop.srcSet} sizes={desktop.sizes} />
                <source media="(max-width: 767px)" srcSet={mobile.srcSet} sizes={mobile.sizes} />
                <img
                    {...mobile}
                    srcSet={undefined}
                    sizes={undefined}
                    onError={(event) => {
                        if (window.matchMedia("(min-width: 768px)").matches) {
                            onDesktopError();
                        } else {
                            onMobileError();
                        }
                        event.currentTarget.onerror = null;
                    }}
                />
            </picture>
        </>
    );
}
