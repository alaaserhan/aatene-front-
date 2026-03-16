"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Banner } from "../types";

interface HomeSingleBannerProps {
    banner: Banner | null;
}

export default function HomeSingleBanner({ banner }: HomeSingleBannerProps) {
    const [imageError, setImageError] = useState({ desktop: false, mobile: false });

    if (!banner) return null;

    const hasDesktopImage = banner.labtop_banner_url && !imageError.desktop;
    const hasMobileImage = banner.mobile_banner_url && !imageError.mobile;

    const desktopSrc = hasDesktopImage ? banner.labtop_banner_url : (hasMobileImage ? banner.mobile_banner_url : "/placeholder.png");
    const mobileSrc = hasMobileImage ? banner.mobile_banner_url : (hasDesktopImage ? banner.labtop_banner_url : "/placeholder.png");

    // Fallback link if none provided
    const linkHref = banner.url || "#";

    return (
        <section className="py-8 container">
            <div className="">
                <Link
                    href={linkHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative w-full aspect-360/150 md:aspect-1170/250 overflow-hidden shadow-lg rounded-2xl group"
                >
                    {/* Art Direction: Both images rendered, CSS handles visibility (No JS flash) */}
                    <div className="hidden md:block w-full h-full relative">
                        {desktopSrc ? (
                            <Image
                                src={desktopSrc}
                                alt={banner.title && !banner.title.startsWith("http") ? banner.title : "Aatene Banner"}
                                fill
                                className="object-cover w-full transition-transform duration-500 group-hover:scale-105"
                                onError={() => setImageError(prev => ({ ...prev, desktop: true }))}
                                sizes="(max-width: 1200px) 100vw, 1170px"
                                fetchPriority="high"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                No Image Available
                            </div>
                        )}
                    </div>
                    <div className="block md:hidden w-full h-full relative">
                        {mobileSrc ? (
                            <Image
                                src={mobileSrc}
                                alt={banner.title && !banner.title.startsWith("http") ? banner.title : "Aatene Banner"}
                                fill
                                className="object-cover w-full transition-transform duration-500 group-hover:scale-105"
                                onError={() => setImageError(prev => ({ ...prev, mobile: true }))}
                                sizes="100vw"
                                fetchPriority="high"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                No Image Available
                            </div>
                        )}
                    </div>
                </Link>
            </div>
        </section>
    );
}
