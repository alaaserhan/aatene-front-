"use client";

import React from "react";
import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import { Service } from "../types";
import ServiceCard from "@/src/features/(web)/services/components/ServiceCard";
import { ChevronsLeft } from "lucide-react";
import Link from "next/link";
import { usePopularServices } from "../hooks";

interface HomeMostPopularServicesProps {
    services?: Service[];
}

export default function HomeMostPopularServices({ services: initialServices }: HomeMostPopularServicesProps) {
    const { data: response } = usePopularServices();
    const services = initialServices || response?.data || [];

    if (!services || services.length === 0) return null;

    return (
        <section className="py-12 bg-white" dir="rtl">
            <MaxWidthWrapper>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl md:text-3xl font-medium">
                        الخدمات الأكثر شعبية
                    </h2>
                    <Link href="/search?type=services" className="inline-flex items-center justify-center p-2 px-4 rounded-full bg-[#3D5E83] text-white text-sm font-medium hover:bg-[#2c4461] transition-colors">
                        عرض الكل
                        <ChevronsLeft className="w-4 h-4 mr-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-6">
                    {services.slice(0, 4).map((service) => (
                        <ServiceCard
                            key={service.id}
                            service={service}
                        />
                    ))}
                </div>
            </MaxWidthWrapper>
        </section>
    );
}
