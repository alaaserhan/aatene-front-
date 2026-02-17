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
        <section className="py-8 w-full">
            <MaxWidthWrapper className="px-4 md:px-8">
                <div className="relative w-full h-[250px] md:h-[300px] lg:h-[350px] rounded-3xl overflow-hidden shadow-lg group">
                    {/* Background Image */}
                    <div className="absolute inset-0 w-full h-full">
                        <Image
                            src="/placeholder.png"
                            alt={topJob.title}
                            fill
                            className="object-cover w-full h-full "
                            priority // Load this possibly above-the-fold image eagerly? Or lazily if it's further down. Let's assume lazy default is fine but priority if it's important.
                        />
                    </div>

                </div>
            </MaxWidthWrapper>
        </section>
    );
}
