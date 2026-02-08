"use client";

import { Service } from "@/src/features/(web)/searchAndFilter/api";
import { cn } from "@/src/lib/utils";
import { Star, MapPin } from "lucide-react";
import Image from "next/image";

interface ServiceCardProps {
    service: Service;
    className?: string;
    onClick?: () => void;
}

export default function ServiceCard({ service, className, onClick }: ServiceCardProps) {
    const rating = parseFloat(service.review_rate || "0");
    const reviewCount = parseInt(service.review_count || "0");
    const price = parseFloat(service.price || "0");

    // Get first city from store's service_cities
    const cityName = service.store?.service_cities?.[0]?.name || "فلسطين";

    return (
        <div
            className={cn(
                "bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group cursor-pointer hover:shadow-md transition-all duration-300",
                className
            )}
            onClick={onClick}
        >
            {/* Service Image */}
            <div className="relative h-52 w-full bg-gray-200">
                <Image
                    src={service.image_url || service.images_urls?.[0] || "/placeholder-service.jpg"}
                    alt={service.title}
                    fill
                    className="object-cover"
                    onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/600x400/f3f4f6/9ca3af?text=Service";
                    }}
                />
            </div>

            {/* Content Section */}
            <div className="p-5 flex flex-col flex-1">
                {/* Service Title */}
                <h3 className="text-lg font-bold text-[#3D5E83] text-center mb-2 line-clamp-2">
                    {service.title}
                </h3>

                {/* Price */}
                <p className="text-2xl font-bold text-[#1F2A37] text-center mb-4">
                    ₪{price.toFixed(2)}
                </p>

                {/* Provider Info */}
                <div className="flex items-center justify-between mt-auto" dir="rtl">
                    {/* Location & Rating */}
                    <div className="flex flex-col gap-1 text-sm text-[#6B7280]">
                        {/* Rating */}
                        <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span>( {reviewCount} مراجعة )</span>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <span>{cityName}</span>
                        </div>
                    </div>

                    {/* Provider Avatar & Name */}
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-sm font-semibold text-[#1F2A37]">
                                {service.store?.name || "مقدم الخدمة"}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-sm">
                            <Image
                                src={service.store?.logo || "/placeholder-user.jpg"}
                                alt={service.store?.name || "Provider"}
                                width={48}
                                height={48}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                    e.currentTarget.src = "https://placehold.co/100x100/e5e7eb/a1a1aa?text=User";
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
