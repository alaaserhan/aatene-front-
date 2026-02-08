"use client";

import { Store } from "@/src/features/(web)/searchAndFilter/api";
import { cn } from "@/src/lib/utils";
import { Star, Truck, ShieldCheck, UserPlus } from "lucide-react";
import Image from "next/image";

interface StoreCardProps {
    store: Store;
    isFollowing?: boolean;
    onFollowClick?: (storeId: number) => void;
    onVisitClick?: (storeSlug: string) => void;
    className?: string;
}

export default function StoreCard({
    store,
    isFollowing = false,
    onFollowClick,
    onVisitClick,
    className
}: StoreCardProps) {
    const rating = parseFloat(store.review_rate || "0");

    return (
        <div className={cn(
            "bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition-all duration-300",
            className
        )}>
            {/* Cover Image */}
            <div className="relative h-48 w-full bg-gray-200">
                <Image
                    src={store.cover || "/placeholder-store.jpg"}
                    alt={store.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/600x400/f3f4f6/9ca3af?text=Store";
                    }}
                />
            </div>

            {/* Content Section */}
            <div className="p-5 flex flex-col flex-1">
                {/* Store Name & Crown */}
                <div className="flex items-center justify-center gap-2 mb-3">
                    <h3 className="text-xl font-bold text-[#1F2A37]">{store.name}</h3>
                    <span className="text-amber-400 text-xl">♛</span>
                </div>

                {/* Description */}
                <p className="text-[#6B7280] text-sm text-center mb-4 line-clamp-3 flex-1">
                    {store.address || "متجر إلكتروني متخصص"}
                </p>

                {/* Features Row */}
                <div className="flex items-center justify-center gap-4 text-sm text-[#4B5563] mb-4 flex-wrap">
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                        <span className="font-medium">{rating.toFixed(1)}</span>
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    </div>

                    {/* Fast Delivery */}
                    <div className="flex items-center gap-1">
                        <span>توصيل سريع</span>
                        <Truck className="w-4 h-4 text-[#3D5E83]" />
                    </div>

                    {/* Guarantee */}
                    <div className="flex items-center gap-1">
                        <span>ضمان</span>
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto">
                    {isFollowing ? (
                        <button
                            onClick={() => onVisitClick?.(store.slug)}
                            className="w-full py-3 px-4 rounded-xl border-2 border-[#3D5E83] text-[#3D5E83] font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            <span>←</span>
                            <span>زيارة المتجر</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => onFollowClick?.(store.id)}
                            className="w-full py-3 px-4 rounded-xl bg-[#3D5E83] text-white font-medium flex items-center justify-center gap-2 hover:bg-[#2D496A] transition-colors cursor-pointer"
                        >
                            <UserPlus className="w-5 h-5" />
                            <span>متابعة المتجر</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
