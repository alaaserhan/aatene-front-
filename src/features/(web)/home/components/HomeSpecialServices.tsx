"use client";

import React from "react";
import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import ServiceCard from "@/src/features/(web)/services/components/ServiceCard";
import { Service } from "../types";

interface HomeSpecialServicesProps {
    services: Service[];
}

export default function HomeSpecialServices({ services }: HomeSpecialServicesProps) {
    if (!services || services.length === 0) return null;

    return (
        <section className="py-12 bg-white" dir="rtl">
            <MaxWidthWrapper>
                <div className="flex flex-col mb-10">
                    <h2 className="text-xl md:text-2xl font-medium mb-2">
                        خدمات مميزة تم اختيارها لأجلك
                    </h2>
                    <p className="text-gray-2 text-sm md:text-base">
                        أفضل الخدمات مبيعاً من بائعين موثوق بهم | ممول
                    </p>
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
