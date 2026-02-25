"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import { Banner } from "../types";
import { cn } from "@/src/lib/utils";

interface HomeMultiBannersProps {
    banners: Banner[];
}

export default function HomeMultiBanners({ banners }: HomeMultiBannersProps) {
    if (!banners || banners.length === 0) return null;

    const displayBanners = banners.slice(0, 3);

    return (
        <section className="py-16 w-full">
            <MaxWidthWrapper className="px-4 md:px-8">
                <div
                    className={cn(
                        "grid gap-4 items-center",
                        displayBanners.length === 1 && "grid-cols-1",
                        displayBanners.length === 2 && "grid-cols-1 md:grid-cols-2",
                        displayBanners.length === 3 && "grid-cols-1 md:grid-cols-3"
                    )}
                >
                    {displayBanners.map((banner, index) => (
                        <BannerItem
                            key={banner.id || index}
                            banner={banner}
                            className="h-[200px] sm:h-[250px]"
                        />
                    ))}
                </div>
            </MaxWidthWrapper>
        </section>
    );
}

function BannerItem({ banner, className }: { banner: Banner; className?: string }) {
    const [imageError, setImageError] = useState({ desktop: false, mobile: false });

    const hasDesktopImage = banner.labtop_banner_url && !imageError.desktop;
    const hasMobileImage = banner.mobile_banner_url && !imageError.mobile;

    const desktopSrc = hasDesktopImage ? banner.labtop_banner_url : (hasMobileImage ? banner.mobile_banner_url : "/placeholder.png");
    const mobileSrc = hasMobileImage ? banner.mobile_banner_url : (hasDesktopImage ? banner.labtop_banner_url : "/placeholder.png");

    // Fallback link if none provided
    const linkHref = banner.url || banner.link || "#";

    return (
        <Link
            href={linkHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn("block relative w-full rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group shrink-0", className)}
        >
            {/* Desktop Image */}
            <div className="hidden md:block w-full h-full relative">
                <Image
                    src={desktopSrc}
                    alt={banner.title || "Banner"}
                    fill
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    onError={() => setImageError(prev => ({ ...prev, desktop: true }))}
                />
            </div>

            {/* Mobile Image */}
            <div className="block md:hidden w-full h-full relative">
                <Image
                    src={mobileSrc}
                    alt={banner.title || "Banner"}
                    fill
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    onError={() => setImageError(prev => ({ ...prev, mobile: true }))}
                />
            </div>
        </Link>
    );
}
