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
    const cityName = service.store?.service_cities?.[0]?.name || "فلسطين";
    const providerName = service.store?.name || "مقدم الخدمة";

    return (
        <div
            className={cn(
                "bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col group cursor-pointer hover:shadow-xl transition-all duration-300 w-full",
                className
            )}
            onClick={onClick}
            dir="rtl"
        >
            {/* Service Image */}
            <div className="relative aspect-[4/3] w-full bg-gray-50">
                <Image
                    src={service.image_url || service.images_urls?.[0] || "/placeholder-service.jpg"}
                    alt={service.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/600x400/f3f4f6/9ca3af?text=Service";
                    }}
                />
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col flex-1">
                {/* Service Title */}
                <h3 className="text-base font-medium  text-right mb-2 leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-[#3D5E83] transition-colors">
                    {service.title}
                </h3>

                {/* Price */}
                <div className="flex justify-start w-full mb-4">
                    <p className="flex font-medium items-baseline gap-1">
                        <span className="text-lg">{price.toFixed(2)}</span>
                        <span className="text-xl ">₪</span>
                    </p>
                </div>

                {/* Separator - Subtle Glassmorphic line */}
                <div className="h-[1px] bg-gradient-to-l from-transparent via-gray-100 to-transparent w-full mb-4" />

                {/* Provider Info */}
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative w-10 h-10 shrink-0 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100">
                        <Image
                            src={service.store?.logo || "/placeholder-user.jpg"}
                            alt={providerName}
                            fill
                            className="object-cover"
                            onError={(e) => {
                                e.currentTarget.src = "https://placehold.co/100x100/e5e7eb/a1a1aa?text=User";
                            }}
                        />
                    </div>

                    {/* Info Stack */}
                    <div className="flex flex-col min-w-0 flex-1">
                        {/* Name */}
                        <p className="text-sm font-bold  truncate">
                            {providerName}
                        </p>

                        {/* Stats Row */}
                        <div className="flex items-center justify-between mt-0.5">
                            {/* Rating */}
                            <div className="flex items-center gap-1 text-[10px] text-gray-400" dir="ltr">
                                <span>({reviewCount})</span>
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            </div>

                            {/* Location */}
                            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                <MapPin className="w-3 h-3 text-[#3D5E83]" />
                                <span className="truncate max-w-[60px]">{cityName}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
