"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { StoreProfile } from "../api";
import { cn } from "@/src/lib/utils";
import {
    MessageCircle,
    Star,
    ChevronLeft,
    ChevronRight,
    UserPlus,
    User as UserIcon,
    StoreIcon,
    PenLine,
    Loader2
} from "lucide-react";
import { useFollowUserOrStore, useUnfollowUserOrStore } from "@/src/features/(web)/settings/hooks";
import { FavoriteButton } from "@/src/features/(web)/fav/components/FavoriteButton";
import { useQueryClient } from "@tanstack/react-query";
import { ShowStoryModal } from "@/src/features/(dashboard)/stories/components/ShowStoryModal";
import { Story } from "@/src/features/(dashboard)/stories/api";

interface StoreHeaderProps {
    store: StoreProfile;
    followers?: {
        id: number;
        follower_type: string;
        follower: {
            id: number;
            avatar_url: string | null;
            logo?: string | null;
            logo_url?: string | null;
        };
    }[];
    stories?: {
        id: number;
        image: string | null;
        text: string | null;
        color: string | null;
        created_at: string;
    }[];
    isOwnStore?: boolean;
}

export default function StoreHeader({ store, followers, stories = [], isOwnStore = false }: StoreHeaderProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const { mutate: follow, isPending: isFollowing } = useFollowUserOrStore();
    const { mutate: unfollow, isPending: isUnfollowing } = useUnfollowUserOrStore();
    const covers = store.cover_urls || [];

    const [avatarStoryOpen, setAvatarStoryOpen] = useState(false);
    const hasStories = stories && stories.length > 0;

    const mappedAvatarStories: Story[] = stories.map(s => ({
        id: s.id,
        image: s.image,
        text: s.text,
        color: s.color,
        created_at: s.created_at,
    }));

    useEffect(() => {
        if (covers.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev === covers.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(interval);
    }, [covers.length]);

    const handleNext = () => {
        setCurrentImageIndex((prev) => (prev === covers.length - 1 ? 0 : prev + 1));
    };

    const handlePrev = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? covers.length - 1 : prev - 1));
    };

    const followersCount = Number(store.followers_count || 0);

    return (
        <div className="relative bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] pb-4">
            <div className="relative h-48 md:h-[250px] lg:h-[300px] w-full overflow-hidden group">
                {covers.length > 0 ? (
                    <Image
                        src={covers[currentImageIndex]}
                        alt="Store Cover"
                        fill
                        className="object-cover transition-all duration-700"
                    />
                ) : (
                    <div className="w-full h-full" />
                )}
                <div className="absolute inset-0 bg-black/10 pointer-events-none" />

                {covers.length > 1 && (
                    <>
                        <button
                            onClick={handlePrev}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 hover:bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer text-white"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 hover:bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer text-white"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                            {covers.map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-all duration-300",
                                        i === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                                    )}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Profile Info Section */}
            <div className="relative container">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:justify-between items-center lg:items-end text-center lg:text-start" dir="rtl">

                    {/* Left/Main Column: Avatar & Meta Stats */}
                    <div className="flex flex-col lg:flex-row items-center lg:items-start gap-5 lg:gap-8 -mt-16  z-10 w-full lg:w-auto flex-1">

                        {/* Column 1: Avatar & Meta Stats (UserHeader Style) */}
                        <div className="flex flex-col gap-3 items-center relative w-full lg:w-auto shrink-0">
                            {/* Avatar */}
                            <div
                                className={cn("relative group", hasStories && "cursor-pointer")}
                                onClick={() => hasStories && setAvatarStoryOpen(true)}
                            >
                                <div className={cn(
                                    "w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] md:w-[150px] md:h-[150px] rounded-full -mt-5 shrink-0 bg-gray-100 overflow-hidden relative flex items-center justify-center",
                                    hasStories
                                        ? "border-[3.5px] border-[#F05A28] shadow-md p-[3px]"
                                        : "border-2 border-white shadow-sm"
                                )}>
                                    <div className={cn(
                                        "w-full h-full rounded-full overflow-hidden relative flex items-center justify-center bg-gray-100",
                                        hasStories && "border-2 border-white"
                                    )}>
                                        {store.logo_url ? (
                                            <Image
                                                src={store.logo_url}
                                                alt={store.name}
                                                fill
                                                className="object-contain"
                                            />
                                        ) : (
                                            <StoreIcon className="w-16 h-16 text-gray-400" />
                                        )}
                                    </div>
                                </div>
                                {isOwnStore && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push("/admin/stories");
                                        }}
                                        className="absolute bottom-1 left-2 w-8 h-8 bg-blue-4 rounded-full flex items-center justify-center shadow-md border-2 border-white cursor-pointer hover:bg-blue-3 transition-colors z-20"
                                    >
                                        <PenLine className="w-3.5 h-3.5 text-white" />
                                    </button>
                                )}
                            </div>

                            {/* Ratings & Followers */}
                            <div className="flex flex-row lg:flex-col items-center justify-center gap-6 lg:gap-3 mt-2 lg:mt-3 px-2">
                                {/* Stars */}
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center gap-1 mb-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={cn(
                                                    "w-4 h-4 md:w-[18px] md:h-[18px]",
                                                    i < Math.round(Number(store.review_rate || 0))
                                                        ? "fill-[#FACC15] text-[#FACC15]"
                                                        : "fill-[#D4D4D8] text-[#D4D4D8]"
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-gray-500 text-xs md:text-sm font-medium">( {store.review_count || 0} مراجعة )</span>
                                </div>

                                {/* Mobile Divider */}
                                <div className="w-px h-8 bg-gray-200 block lg:hidden"></div>

                                {/* Followers */}
                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:flex -space-x-2 md:-space-x-3 space-x-reverse">
                                        {(followers && followers.length > 0) ? (
                                            followers.slice(0, 3).map((fItem, idx) => {
                                                const avatarUrl = fItem.follower_type === "store" ? fItem.follower.logo_url : fItem.follower.avatar_url;
                                                return (
                                                    <div key={fItem.id || idx} className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-white overflow-hidden relative shadow-sm z-10 bg-gray-100 flex items-center justify-center">
                                                        <UserIcon className="w-4 h-4 text-gray-400 absolute" />
                                                        {avatarUrl && (
                                                            <Image
                                                                src={avatarUrl}
                                                                fill
                                                                className="object-cover z-10"
                                                                alt="follower"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none';
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                )
                                            })
                                        ) : (
                                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-white overflow-hidden relative shadow-sm z-10 bg-gray-100" />
                                        )}
                                    </div>
                                    <span className="text-gray-500 text-xs md:text-sm font-medium">
                                        {followersCount > 0 ? `${followersCount} متابع` : "لا يوجد متابعين"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Title & Description Column */}
                        <div className="flex flex-col items-center lg:items-start gap-1 py-2 lg:mt-20">
                            <h1 className="text-xl lg:text-2xl font-medium ">{store.name}</h1>
                            {store.description && (
                                <p className="text-gray-500 text-sm max-w-lg leading-relaxed">{store.description}</p>
                            )}
                            {store.address && (
                                <p className="text-gray-400 text-xs mt-1">{store.address}</p>
                            )}

                            {/* Action Buttons Row */}
                            <div className="flex items-center justify-center lg:justify-start gap-2 mt-4 flex-wrap">
                                <button
                                    disabled={isFollowing || isUnfollowing}
                                    onClick={() => {
                                        if (store.am_i_following) {
                                            unfollow(
                                                { followed_type: "store", followed_id: store.id },
                                                {
                                                    onSuccess: () => {
                                                        queryClient.invalidateQueries({ queryKey: ["storeProfile"] });
                                                        queryClient.invalidateQueries({ queryKey: ["storePageData"] });
                                                    },
                                                }
                                            );
                                        } else {
                                            follow(
                                                { followed_type: "store", followed_id: store.id },
                                                {
                                                    onSuccess: () => {
                                                        queryClient.invalidateQueries({ queryKey: ["storeProfile"] });
                                                        queryClient.invalidateQueries({ queryKey: ["storePageData"] });
                                                    },
                                                }
                                            );
                                        }
                                    }}
                                    className={cn(
                                        "h-10 px-6 rounded-full text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50",
                                        store.am_i_following
                                            ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                            : "bg-blue-4 text-white hover:bg-blue-3"
                                    )}
                                >
                                    <UserPlus className="w-4 h-4" />
                                    <span>{store.am_i_following ? "إلغاء المتابعة" : "تابع المتجر"}</span>
                                </button>

                                <button
                                    disabled={isChatLoading}
                                    onClick={() => {
                                        setIsChatLoading(true);
                                        router.push(`/chat?type=store&id=${store.id}`);
                                    }}
                                    className="h-10 px-6 rounded-full text-sm border border-blue-4 text-blue-4 font-medium flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    {isChatLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <MessageCircle className="w-4 h-4" />
                                    )}
                                    <span>دردش</span>
                                </button>

                                <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer">
                                    <FavoriteButton
                                        id={store.id}
                                        type="store"
                                        isFavorite={store.is_favorite}
                                        onSuccess={() => {
                                            queryClient.invalidateQueries({ queryKey: ["storeProfile"] });
                                            queryClient.invalidateQueries({ queryKey: ["storePageData"] });
                                        }}
                                        className="w-full h-full"
                                        iconClassName="w-4 h-4"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>

            {avatarStoryOpen && (
                <ShowStoryModal
                    isOpen={avatarStoryOpen}
                    onClose={() => setAvatarStoryOpen(false)}
                    stories={mappedAvatarStories}
                    initialIndex={0}
                    showActions={false}
                />
            )}
        </div >
    );
}
