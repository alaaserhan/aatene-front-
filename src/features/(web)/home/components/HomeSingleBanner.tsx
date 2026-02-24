"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
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
    const linkHref = banner.url || banner.link || "#";

    return (
        <section className="py-8 w-full">
            <MaxWidthWrapper className="px-4 md:px-8">
                <Link
                    href={linkHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative w-full h-[150px]  md:h-[250px] overflow-hidden shadow-lg group"
                >
                    {/* Desktop Image */}
                    <div className="hidden md:block w-full h-full relative">
                        <Image
                            src={desktopSrc}
                            alt={banner.title || "Banner"}
                            fill
                            className="object-cover w-full  "
                            onError={() => setImageError(prev => ({ ...prev, desktop: true }))}
                        />
                    </div>

                    {/* Mobile Image */}
                    <div className="block md:hidden w-full h-full relative">
                        <Image
                            src={mobileSrc}
                            alt={banner.title || "Banner"}
                            fill
                            className="object-cover w-full "
                            onError={() => setImageError(prev => ({ ...prev, mobile: true }))}
                        />
                    </div>
                </Link>
            </MaxWidthWrapper>
        </section>
    );
}
