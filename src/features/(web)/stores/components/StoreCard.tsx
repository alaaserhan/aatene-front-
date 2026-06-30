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
                "group relative flex h-full min-h-[400px] w-full min-w-0 cursor-pointer flex-col items-center rounded-2xl border border-gray-100 bg-white px-4 pb-4 pt-6 text-center transition-all duration-300 hover:shadow-md md:px-5 md:pb-5 md:pt-8",
                className
            )}
        >
            <div
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                className="absolute top-3 inset-e-3 z-10 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md hover:scale-110 transition-transform"
            >
                <FavoriteButton
                    id={store.id}
                    type="store"
                    isFavorite={store.is_favorite}
                    onSuccess={invalidateStoreQueries}
                />
            </div>    
            

            <div className="flex w-full min-h-0 flex-1 flex-col items-center justify-center">
                <div className="relative mb-3 aspect-square w-[74%] max-w-[11rem] shrink-0 overflow-hidden rounded-full bg-gray-100 md:mb-4 md:max-w-[10rem] lg:max-w-[11rem]">
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

                <h3 className="mb-2 line-clamp-2 w-full px-1 text-base font-bold text-gray-900 md:mb-3 md:text-lg">
                    {store.name}
                </h3>

                <div className="mb-1.5 flex w-full items-center justify-center gap-1.5 text-sm text-gray-500 md:mb-2" dir="rtl">
                    <MapPin className="h-4 w-4 shrink-0 text-blue-4" />
                    <span className="line-clamp-1">{store.city?.name || "--"}</span>
                </div>

                <div className="inline-flex items-center justify-center gap-1.5 text-sm leading-4 text-gray-400" dir="rtl">
                    <Star className="size-4 shrink-0 fill-amber-400 text-amber-400" aria-hidden />
                    <span className="translate-y-px font-medium tabular-nums leading-4">{rating.toFixed(1)}</span>
                </div>
            </div>

            <div className="w-full shrink-0 pt-3">
                {followed ? (
                    <div className="flex gap-2">
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
                            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
                        >
                            <span>{isPending ? "جاري الإلغاء..." : "إلغاء المتابعة"}</span>
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCardClick();
                            }}
                            className="flex w-12 cursor-pointer items-center justify-center rounded-lg bg-gray-50 py-3 text-blue-4 transition-colors hover:bg-gray-100"
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
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-4 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-3 disabled:opacity-50"
                    >
                        <UserPlus className="h-5 w-5" />
                        <span>{isPending ? "جاري المتابعة..." : "متابعة المتجر"}</span>
                    </button>
                )}
            </div>
        </div>
    );
});

StoreCard.displayName = "StoreCard";

export default StoreCard;
