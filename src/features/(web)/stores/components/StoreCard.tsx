"use client";

import { memo, useState, useEffect } from "react";
import { Store } from "@/src/features/(web)/searchAndFilter/api";
import { cn } from "@/src/lib/utils";
import { ArrowRight, UserPlus, Store as StoreIcon, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useFollowUserOrStore, useUnfollowUserOrStore } from "@/src/features/(web)/settings/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { FavoriteButton } from "@/src/features/(web)/fav/components/FavoriteButton";

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
    const [imgSrc, setImgSrc] = useState(store.logo_url || "/placeholder.png");
    const rating = parseFloat(store.review_rate || "0");
    const [followed, setFollowed] = useState(isFollowing || store.am_i_following);

    // Sync local state when parent re-renders with updated props
    useEffect(() => {
        setFollowed(isFollowing || store.am_i_following);
    }, [isFollowing, store.am_i_following]);

    const queryClient = useQueryClient();
    const { mutate: follow, isPending: isFollowPending } = useFollowUserOrStore();
    const { mutate: unfollow, isPending: isUnfollowPending } = useUnfollowUserOrStore();

    const isPending = isFollowPending || isUnfollowPending;

    const router = useRouter();

    const handleCardClick = () => {
        if (onVisitClick) {
            onVisitClick(store.slug);
        } else {
            router.push(`/store/${store.slug}`);
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className={cn(
                "bg-white h-full rounded-lg border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition-all duration-300 cursor-pointer",
                className
            )}
        >
            {/* Cover Image */}
            <div className="relative h-48 w-full bg-gray-200">
                {store.logo_url ? (
                    <Image
                        src={imgSrc}
                        alt={store.name}
                        fill
                        className="object-cover"
                        onError={() => {
                            setImgSrc("/placeholder.png");
                        }}
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full">
                        <StoreIcon className="w-16 h-16 text-gray-400" />
                    </div>
                )}

                {/* Favorite Button - Top Left */}
                <div
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    className="absolute top-3 left-3 z-10 w-10 h-10 rounded-full bg-[#ffffffc9] flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                >
                    <FavoriteButton
                        id={store.id}
                        type="store"
                        isFavorite={store.is_favorite}
                        onSuccess={() => {
                            queryClient.invalidateQueries({ queryKey: ["stores", "search"] });
                            queryClient.invalidateQueries({ queryKey: ["storeProfile", store.slug] });
                        }}
                        className="w-full h-full rounded-full"
                        iconClassName="w-5 h-5"
                    />
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col flex-1">
                {/* Store Name & Crown */}
                <div className="flex items-center gap-2 mb-3">
                    {/* <Image src="/icons/crown.svg" alt="crown" width={16} height={16} /> */}
                    <h3 className=" font-semibold text-base">{store.name}</h3>
                </div>

                {/* Description */}
                <p className="text-gray-2 text-sm mb-4 line-clamp-2 flex-1">
                    {store.description || "متجر إلكتروني متخصص في أحدث صيحات الموضة والأزياء العصرية للشباب والشابات"}
                </p>

                {/* Features Row */}
                <div className="flex items-center gap-3 text-sm  mb-6 flex-wrap">
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                        <Image src="/icons/star.svg" alt="star" width={15} height={15} />
                        <span className="font-medium text-gray-2 pt-1">{rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-400 pt-1">({store.review_count || 0})</span>
                    </div>

                    {/* Fast Delivery */}
                    {/* {store.type === "products" && (
                        <div className="flex items-center gap-1">
                            <Image src="/icons/car2.svg" alt="car" width={18} height={18} />
                            <span className="font-medium">توصيل سريع</span>
                        </div>
                    )} */}

                    {/* Guarantee */}
                    {/* <div className="flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4 text-blue-4" />
                        <span className="font-medium">ضمان</span>
                    </div> */}
                </div>

                {/* Action Buttons */}
                <div className="mt-auto flex flex-col gap-2">
                    {followed ? (
                        <div className="flex gap-2">
                            <button
                                disabled={isPending}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    unfollow(
                                        { followed_type: "store", followed_id: store.id },
                                        {
                                            onSuccess: () => {
                                                setFollowed(false);
                                                onFollowClick?.(store.id);
                                                queryClient.invalidateQueries({ queryKey: ["stores", "search"] });
                                                queryClient.invalidateQueries({ queryKey: ["storeProfile", store.slug] });
                                                queryClient.invalidateQueries({ queryKey: ["storePageData", store.slug] });
                                            },
                                        }
                                    );
                                }}
                                className="flex-1 py-3 px-4 rounded-lg text-sm bg-gray-100 text-gray-700 font-medium flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50"
                            >
                                <span>{isPending ? "جاري الإلغاء..." : "إلغاء المتابعة"}</span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onVisitClick) {
                                        onVisitClick(store.slug);
                                    } else {
                                        router.push(`/store/${store.slug}`);
                                    }
                                }}
                                className="w-12 py-3 rounded-lg bg-gray-50 text-blue-4 flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
                                title="زيارة المتجر"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                        </div>
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
                                            queryClient.invalidateQueries({ queryKey: ["stores", "search"] });
                                            queryClient.invalidateQueries({ queryKey: ["storeProfile", store.slug] });
                                            queryClient.invalidateQueries({ queryKey: ["storePageData", store.slug] });
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
