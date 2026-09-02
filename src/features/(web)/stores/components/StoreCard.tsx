"use client";

import { memo, useState } from "react";
import { Store } from "@/src/features/(web)/searchAndFilter/api";
import { cn, sanitizeMediaUrl, resolveImageSrc } from "@/src/lib/utils";
import { UserPlus, Store as StoreIcon, ArrowLeft, MapPin, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useFollowUserOrStore, useUnfollowUserOrStore } from "@/src/features/(web)/settings/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { FavoriteButton } from "@/src/features/(web)/fav/components/FavoriteButton";
import { useLanguage } from "@/src/hooks/use-language";
import { isStoreBannerVideoUrl } from "@/src/features/(web)/stores/utils/storeBannerMedia";

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
    const [failedLogoUrl, setFailedLogoUrl] = useState<string | null>(null);
    const [failedCoverUrl, setFailedCoverUrl] = useState<string | null>(null);
    const normalizedLogoUrl = sanitizeMediaUrl(store.logo_url);
    const coverUrls = (store.cover_urls ?? []).filter(Boolean);
    const primaryCover = coverUrls[0] ? sanitizeMediaUrl(coverUrls[0]) : sanitizeMediaUrl(store.cover_url);
    const coverIsVideo = Boolean(primaryCover && isStoreBannerVideoUrl(primaryCover));
    const logoSrc = resolveImageSrc(normalizedLogoUrl, failedLogoUrl, "store");
    const coverFallbackSrc =
        primaryCover && !coverIsVideo && failedCoverUrl !== primaryCover ? primaryCover : null;
    const avatarSrc = store.logo_url ? logoSrc : coverFallbackSrc || logoSrc;
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

    const invalidateStoreQueries = () => {
        queryClient.invalidateQueries({ queryKey: ["stores", "search"] });
        queryClient.invalidateQueries({ queryKey: ["storeProfile", store.slug] });
        queryClient.invalidateQueries({ queryKey: ["storePageData", store.slug] });
        queryClient.invalidateQueries({ queryKey: ["homeSpecialMerchants"] });
        queryClient.invalidateQueries({ queryKey: ["favorite-lists", "list"] });
    };

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
                "group relative flex h-full min-h-65 w-full min-w-0 cursor-pointer flex-col items-center rounded-2xl border border-[#E0E0E0] bg-white px-3 pb-3 pt-5 text-center transition-all duration-300 hover:shadow-md sm:min-h-85 sm:px-4 sm:pb-4 sm:pt-6 md:min-h-100 md:px-5 md:pb-5 md:pt-8",
                className
            )}
        >
            <div
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                className="absolute top-2 inset-e-2 z-10 size-8 sm:size-10 rounded-full bg-white flex items-center justify-center shadow-md hover:scale-110 transition-transform"
            >
                <FavoriteButton
                    id={store.id}
                    type="store"
                    isFavorite={store.is_favorite}
                    onSuccess={invalidateStoreQueries}
                />
            </div>


            <div className="flex w-full min-h-0 flex-1 flex-col items-center justify-center">
                <div className="relative mb-2.5 aspect-square w-[68%] max-w-28 shrink-0 overflow-hidden rounded-full bg-gray-100 sm:mb-3 sm:w-[74%] sm:max-w-36 md:mb-4 md:max-w-40 lg:max-w-44">
                    {store.logo_url || coverFallbackSrc ? (
                        <Image
                            src={avatarSrc}
                            alt={store.name}
                            fill
                            className="object-cover"
                            onError={() => {
                                if (store.logo_url) {
                                    setFailedLogoUrl(normalizedLogoUrl || null);
                                } else if (primaryCover) {
                                    setFailedCoverUrl(primaryCover);
                                }
                            }}
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <StoreIcon className="h-10 w-10 text-gray-400 md:h-12 md:w-12" />
                        </div>
                    )}
                </div>

                <h3 className="mb-1.5 line-clamp-2 w-full px-1 text-sm font-bold text-gray-900 sm:mb-2 sm:text-base md:mb-3 md:text-lg">
                    {store.name}
                </h3>

                <div className="mb-1 flex w-full items-center justify-center gap-1 text-xs text-gray-500 sm:mb-1.5 sm:gap-1.5 sm:text-sm md:mb-2" dir="rtl">
                    <MapPin className="size-3.5 shrink-0 text-blue-4 sm:size-4" />
                    <span className="line-clamp-1">{store.city?.name || "--"}</span>
                </div>

                <div className="inline-flex items-center justify-center gap-1 text-xs leading-4 text-gray-400 sm:gap-1.5 sm:text-sm" dir="rtl">
                    <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400 sm:size-4" aria-hidden />
                    <span className="translate-y-px font-medium tabular-nums leading-4">{rating.toFixed(1)}</span>
                </div>
            </div>

            <div className="w-full shrink-0 pt-2.5 sm:pt-3">
                {followed ? (
                    <div className="flex gap-1.5 sm:gap-2">
                        <button
                            type="button"
                            disabled={isPending}
                            onClick={(e) => {
                                e.stopPropagation();
                                unfollow(
                                    { followed_type: "store", followed_id: store.id },
                                    {
                                        onSuccess: () => {
                                            setFollowOverride(false);
                                            onFollowClick?.(store.id);
                                            invalidateStoreQueries();
                                        },
                                    }
                                );
                            }}
                            className="flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-gray-100 px-2 py-2.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50 sm:px-4 sm:py-3 sm:text-sm"
                        >
                            <span className="truncate">{isPending ? "جاري الإلغاء..." : "إلغاء المتابعة"}</span>
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCardClick();
                            }}
                            className="flex w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-gray-50 py-2.5 text-blue-4 transition-colors hover:bg-gray-100 sm:w-12 sm:py-3"
                            title="زيارة المتجر"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        disabled={isPending}
                        onClick={(e) => {
                            e.stopPropagation();
                            follow(
                                { followed_type: "store", followed_id: store.id },
                                {
                                    onSuccess: () => {
                                        setFollowOverride(true);
                                        onFollowClick?.(store.id);
                                        invalidateStoreQueries();
                                    },
                                }
                            );
                        }}
                        className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-blue-4 px-2 py-2.5 text-xs font-medium text-white transition-colors hover:bg-blue-3 disabled:opacity-50 sm:gap-2 sm:px-4 sm:py-3 sm:text-sm"
                    >
                        <UserPlus className="size-4 shrink-0 sm:size-5" />
                        <span className="truncate">{isPending ? "جاري المتابعة..." : "متابعة المتجر"}</span>
                    </button>
                )}
            </div>
        </div>
    );
});

StoreCard.displayName = "StoreCard";

export default StoreCard;
