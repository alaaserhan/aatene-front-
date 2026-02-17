"use client";

import { memo, useState } from "react";
import { Store } from "@/src/features/(web)/searchAndFilter/api";
import { cn } from "@/src/lib/utils";
import { ArrowRight, ShieldCheck, UserPlus } from "lucide-react";
import Image from "next/image";

import { useFollowUserOrStore } from "@/src/features/(web)/settings/hooks";

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
    const [followed, setFollowed] = useState(isFollowing || store.am_i_following);
    const { mutate: follow, isPending } = useFollowUserOrStore();


    return (
        <div className={cn(
            "bg-white rounded-lg border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition-all duration-300",
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
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col flex-1">
                {/* Store Name & Crown */}
                <div className="flex items-center gap-2 mb-3">
                    <Image src="/icons/crown.svg" alt="crown" width={16} height={16} />
                    <h3 className=" font-medium text-black ">{store.name}</h3>
                </div>

                {/* Description */}
                <p className="text-gray-2 text-sm mb-4 line-clamp-2 flex-1">
                    {store.address || "متجر إلكتروني متخصص في أحدث صيحات الموضة والأزياء العصرية للشباب والشابات"}
                </p>

                {/* Features Row */}
                <div className="flex items-center gap-3 text-xs  mb-6 flex-wrap">
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                        <Image src="/icons/star.svg" alt="star" width={15} height={15} />
                        <span className="font-medium text-[#4B5563]">{rating.toFixed(1)}</span>
                    </div>

                    {/* Fast Delivery */}
                    <div className="flex items-center gap-1">
                        <Image src="/icons/car2.svg" alt="car" width={18} height={18} />
                        <span className="font-medium">توصيل سريع</span>
                    </div>

                    {/* Guarantee */}
                    <div className="flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4 text-blue-4" />
                        <span className="font-medium">ضمان</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto flex flex-col gap-2">
                    {followed ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onVisitClick?.(store.slug);
                            }}
                            className="w-full py-3 px-4 rounded-lg text-sm bg-gray-50 text-blue-4 font-medium flex items-center justify-center gap-1 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            <ArrowRight className="w-4 h-4" />
                            <span>زيارة المتجر</span>
                        </button>
                    ) : (
                        <button
                            disabled={isPending}
                            onClick={(e) => {
                                e.stopPropagation();
                                follow(
                                    { followed_type: "store", followed_id: store.id },
                                    {
                                        onSuccess: () => {
                                            setFollowed(true);
                                            onFollowClick?.(store.id);
                                        },
                                    }
                                );
                            }}
                            className="w-full py-3 px-4 rounded-lg text-sm bg-blue-4 text-white font-medium flex items-center justify-center gap-2 hover:bg-blue-3 transition-colors cursor-pointer disabled:opacity-50"
                        >
                            <UserPlus className="w-5 h-5" />
                            <span>{isPending ? "جاري المتابعة..." : "متابعة المتجر"}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
});

StoreCard.displayName = "StoreCard";

export default StoreCard;
