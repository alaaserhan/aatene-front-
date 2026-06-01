"use client";

import { memo, useState } from "react";
import { Store } from "@/src/features/(web)/searchAndFilter/api";
import { cn, sanitizeMediaUrl, resolveImageSrc } from "@/src/lib/utils";
import { UserPlus, Store as StoreIcon, ArrowLeft, MapPin } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useFollowUserOrStore, useUnfollowUserOrStore } from "@/src/features/(web)/settings/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { FavoriteButton } from "@/src/features/(web)/fav/components/FavoriteButton";
import { isStoreBannerVideoUrl } from "@/src/features/(web)/stores/utils/storeBannerMedia";
import { useLanguage } from "@/src/hooks/use-language";

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
    const coverUrls = (store.cover_urls ?? []).filter(Boolean);
    const primaryCover = coverUrls[0] ? sanitizeMediaUrl(coverUrls[0]) : "";
    const coverIsVideo = Boolean(primaryCover && isStoreBannerVideoUrl(primaryCover));
    const [failedLogoUrl, setFailedLogoUrl] = useState<string | null>(null);
    const [failedCoverUrl, setFailedCoverUrl] = useState<string | null>(null);
    const normalizedLogoUrl = sanitizeMediaUrl(store.logo_url);
    const logoSrc = resolveImageSrc(normalizedLogoUrl, failedLogoUrl, "store");
    const coverSrc = primaryCover && failedCoverUrl !== primaryCover ? primaryCover : logoSrc;
    const rating = parseFloat(store.review_rate || "0");
    const [followOverride, setFollowOverride] = useState<boolean | null>(null);
    const followed = followOverride ?? Boolean(isFollowing || store.am_i_following);

    const queryClient = useQueryClient();
    const { mutate: follow, isPending: isFollowPending } = useFollowUserOrStore();
    const { mutate: unfollow, isPending: isUnfollowPending } = useUnfollowUserOrStore();

    const isPending = isFollowPending || isUnfollowPending;

    const router = useRouter();
    const lang = useLanguage();
    const storePath = `/${lang}/store/${store.slug}`;
    const cityNames = [...(store.location_cities || []), ...(store.service_cities || [])]
        .map((city) => city?.name)
        .filter(Boolean);
    const cityLabel = cityNames.length > 0 ? [...new Set(cityNames)].slice(0, 2).join("، ") : store.address || "المدينة غير محددة";

    const handleCardClick = () => {
        if (onVisitClick) {
            onVisitClick(store.slug);
        } else {
            router.push(storePath);
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className={cn(
                "bg-white h-full w-full min-w-0 rounded-lg border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition-all duration-300 cursor-pointer",
                className
            )}
        >
            {/* Cover: banner (cover_urls) or logo */}
            <div className="relative h-48 w-full bg-gray-200">
                {coverIsVideo && primaryCover ? (
                    <video
                        src={primaryCover}
                        className="absolute inset-0 h-full w-full object-cover"
                        muted
                        playsInline
                        loop
                        autoPlay
                        preload="metadata"
                    />
                ) : primaryCover && !coverIsVideo ? (
                    <Image
                        src={coverSrc}
                        alt={store.name}
                        fill
                        className="object-cover"
                        onError={() => {
                            setFailedCoverUrl(primaryCover);
                        }}
                    />
                ) : store.logo_url ? (
                    <Image
                        src={logoSrc}
                        alt={store.name}
                        fill
                        className="object-cover"
                        onError={() => {
                            setFailedLogoUrl(normalizedLogoUrl || null);
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
            <div className="p-4 flex min-w-0 flex-col flex-1">
                {/* Store Name & Crown */}
                <div className="flex min-w-0 items-center gap-2 mb-3">
                    {/* <Image src="/icons/crown.svg" alt="crown" width={16} height={16} /> */}
                    <h3 className="min-w-0 truncate font-semibold text-base">{store.name}</h3>
                </div>

                <div className="mb-3 flex min-w-0 items-center gap-1.5 text-sm text-gray-2">
                    <MapPin className="h-4 w-4 shrink-0 text-blue-4" />
                    <span className="min-w-0 truncate">{cityLabel}</span>
                </div>

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
                                                setFollowOverride(false);
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
                                        router.push(storePath);
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
                                            setFollowOverride(true);
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
