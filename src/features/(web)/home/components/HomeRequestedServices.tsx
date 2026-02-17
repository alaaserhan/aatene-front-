"use client";

import Link from "next/link";
import { ChevronsLeft } from "lucide-react";
import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import { ServiceRequest } from "../types";
import RequestedServiceCard from "../../requested-services/components/RequestedServiceCard";
import { RequestedService } from "../../requested-services/types";

interface HomeRequestedServicesProps {
    requests: ServiceRequest[];
}

export default function HomeRequestedServices({ requests }: HomeRequestedServicesProps) {
    if (!requests || requests.length === 0) return null;

    return (
        <section className="py-12 bg-gray-50 bg-linear-to-b from-white to-gray-50" dir="rtl">
            <MaxWidthWrapper>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl md:text-3xl font-medium">
                        طلبات الخدمات الغير موجودة
                    </h2>
                    <Link href="/requested-services" className="inline-flex items-center justify-center p-2 px-4 rounded-full bg-[#3D5E83] text-white text-sm font-medium hover:bg-[#2c4461] transition-colors">
                        عرض الكل
                        <ChevronsLeft className="w-4 h-4 mr-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {requests.slice(0, 2).map((request) => (
                        <RequestedServiceCard
                            key={request.id}
                            service={request as unknown as RequestedService}
                        />
                    ))}
                </div>
            </MaxWidthWrapper>
        </section>
    );
}
