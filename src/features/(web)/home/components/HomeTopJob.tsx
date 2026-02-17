"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import { ServiceRequest } from "../types";

interface HomeTopJobProps {
    topJob: ServiceRequest | null;
}

export default function HomeTopJob({ topJob }: HomeTopJobProps) {
    if (!topJob) return null;

    const backgroundImageUrl = topJob.images_urls?.[0] || topJob.images?.[0] || "/placeholder.png";

    return (
        <section className="py-8 w-full" dir="rtl">
            <MaxWidthWrapper className="px-4 md:px-8">
                <div className="relative w-full h-[250px] md:h-[300px] lg:h-[350px] rounded-3xl overflow-hidden shadow-lg group">
                    {/* Background Image */}
                    <div className="absolute inset-0 w-full h-full">
                        <Image
                            src={backgroundImageUrl}
                            alt={topJob.title}
                            fill
                            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                            priority // Load this possibly above-the-fold image eagerly? Or lazily if it's further down. Let's assume lazy default is fine but priority if it's important.
                        />
                        {/* Dark Overlay */}
                        <div className="absolute inset-0 bg-black/40 md:bg-black/30" />
                    </div>

                    {/* Content Container */}
                    <div className="relative z-10 w-full h-full flex flex-col justify-end p-6 md:p-10 lg:p-12">
                        <div className="flex flex-col md:flex-row md:items-end justify-between w-full h-full">

                            {/* Right Side: Title & Company Info (which is actually on the Right in RTL) */}
                            <div className="flex flex-col md:items-start text-white mb-6 md:mb-0 md:max-w-[70%] text-right self-center md:self-auto ml-auto mt-auto mb-auto"> {/* Centered vertically and right aligned */}

                                <div className="flex flex-col gap-2">
                                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-4 drop-shadow-md text-white">
                                        {topJob.title}
                                    </h2>

                                    {/* Company Logo & Rating Placeholder (As shown in image on top right) */}
                                    {/* Since we don't have explicit company data in ServiceRequest from Types, we might need to adjust or hide this.
                                        But to match the design, I'll put a placeholder or if title contains 'dah Technology', maybe show a generic tech icon?
                                        The user prompt says "use topJob", so we rely on that.
                                        If 'dah Technology' is in the title, we just display the title.
                                        
                                        Wait, the image has a small logo on the top right. 
                                        Let's position a logo absolutely if we had one.
                                    */}
                                </div>
                            </div>

                            {/* Left Side: Button (RTL Left) */}
                            <div className="mt-4 md:mt-0 flex-shrink-0 self-center md:self-end mb-auto mt-auto">
                                <Link
                                    href={`/requested-services/${topJob.slug}`}
                                    className="inline-flex items-center justify-center bg-[#3D5E83] hover:bg-[#2c4461] text-white font-bold py-3 px-8 rounded-xl transition-colors duration-300 shadow-lg text-lg"
                                >
                                    عرض المزيد
                                </Link>
                            </div>
                        </div>

                        {/* Absolute Logo Top Right (RTL: Left if dir=ltr, but in RTL it's Right) -> In RTL 'right-8' is Right. relative to container. */}
                        {/* The image shows logo on the right side. */}
                        <div className="absolute top-6 right-6 md:top-10 md:right-10 flex items-center gap-2 bg-white/10 backdrop-blur-sm p-2 rounded-lg border border-white/20">
                            {/* Placeholder for Company Logo if we don't have it purely from ServiceRequest */}
                            <div className="flex flex-col items-end">
                                {/* <span className="text-white text-xs font-bold">اسم الشركة</span> */}
                                {/* <div className="flex text-[10px] text-yellow-400">
                                     ★★★★★
                                 </div> */}
                            </div>
                            {/* <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">A</div> */}
                        </div>
                    </div>
                </div>
            </MaxWidthWrapper>
        </section>
    );
}
