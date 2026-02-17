"use client";

import { memo, useState } from "react";
import { Store } from "@/src/features/(web)/searchAndFilter/api";
import { cn } from "@/src/lib/utils";
import { Star, Truck, ShieldCheck, UserPlus, Play } from "lucide-react";
import Image from "next/image";

interface StoreCardProps {
    store: Store;
    isFollowing?: boolean;
    onFollowClick?: (storeId: number) => void;
    onVisitClick?: (storeSlug: string) => void;
    className?: string;
}

const StoreCard = memo(({
    store,
    isFollowing = false,
    onFollowClick,
    onVisitClick,
    className
}: StoreCardProps) => {
    const [imgSrc, setImgSrc] = useState(store.cover || "/placeholder.png");
    const rating = parseFloat(store.review_rate || "0");

    return (
        <div className={cn(
            "bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition-all duration-300",
            className
        )}>
            {/* Cover Image */}
            <div className="relative h-48 w-full bg-gray-200">
                <Image
                    src={imgSrc}
                    alt={store.name}
                    fill
                    className="object-cover"
                    onError={() => {
                        setImgSrc("https://placehold.co/600x400/f3f4f6/9ca3af?text=Store");
                    }}
                />

                <div className="absolute top-3 right-3 z-10">
                    <div className="bg-[#ffffff33] backdrop-blur-sm rounded-md px-2 py-1 flex items-center gap-1">
                        <span className="text-white text-[10px] font-bold">اعلان ممول</span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5 flex flex-col flex-1">
                {/* Store Name & Crown */}
                <div className="flex items-center justify-center gap-2 mb-3">
                    <h3 className="text-xl font-bold text-[#1F2A37]">{store.name}</h3>
                    <span className="text-amber-400 text-xl">♛</span>
                </div>

                {/* Description */}
                <p className="text-[#6B7280] text-sm text-center mb-4 line-clamp-2 flex-1">
                    {store.address || "متجر إلكتروني متخصص في أحدث صيحات الموضة والأزياء العصرية للشباب والشابات"}
                </p>

                {/* Features Row */}
                <div className="flex items-center justify-center gap-4 text-xs text-[#4B5563] mb-6 flex-wrap">
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-gray-700">{rating.toFixed(1)}</span>
                    </div>

                    {/* Fast Delivery */}
                    <div className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-blue-4" />
                        <span className="font-medium">توصيل سريع</span>
                    </div>

                    {/* Guarantee */}
                    <div className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-4" />
                        <span className="font-medium">ضمان</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto flex flex-col gap-2">
                    {isFollowing ? (
                        <button
                            onClick={() => onVisitClick?.(store.slug)}
                            className="w-full py-3 px-4 rounded-xl bg-gray-50 text-blue-4 font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            <span>زيارة المتجر</span>
                            <span className="scale-x-[-1]">←</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => onFollowClick?.(store.id)}
                            className="w-full py-3 px-4 rounded-xl bg-blue-4 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-3 transition-colors cursor-pointer"
                        >
                            <UserPlus className="w-5 h-5" />
                            <span>متابعة المتجر</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
});

StoreCard.displayName = "StoreCard";

export default StoreCard;
