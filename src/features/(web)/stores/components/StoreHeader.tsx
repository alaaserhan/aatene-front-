"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { StoreProfile, WhoFavoritedUser } from "../api";
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
    Loader2,
    X,
    Lock,
    ShoppingBag,
    MoreHorizontal,
    Share2,
    Flag,
} from "lucide-react";
import { useFollowUserOrStore, useUnfollowUserOrStore } from "@/src/features/(web)/settings/hooks";
import { FavoriteButton } from "@/src/features/(web)/fav/components/FavoriteButton";
import { useQueryClient } from "@tanstack/react-query";
import { ShowStoryModal } from "@/src/features/(dashboard)/stories/components/ShowStoryModal";
import { Story } from "@/src/features/(dashboard)/stories/api";
import { useStoreWhoFavorited } from "../hooks";
import { ShareModal } from "@/src/components/ui/ShareModal";
import { ReportAbuseModal } from "@/src/features/(web)/reports/components/ReportAbuseModal";
import { useAuthStore } from "@/src/stores/auth-store";
import { isStoreBannerVideoUrl } from "@/src/features/(web)/stores/utils/storeBannerMedia";

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

function FollowerCard({
    user,
    onFollowToggle,
    isPending,
}: {
    user: WhoFavoritedUser;
    onFollowToggle: (user: WhoFavoritedUser) => void;
    isPending: boolean;
}) {
    const visibleFavs = user.favorites.slice(0, 5);
    const remainingCount = Math.max(0, Number(user.favorites_count) - visibleFavs.length);
    const hasFavorites = user.favorites.length > 0;
    const isPrivate = !hasFavorites && Number(user.favorites_count) > 0;
    const profileId = user.slug || String(user.id);

    return (
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 py-5 border-b border-gray-100 last:border-none">
            <div className="flex items-center justify-between w-full lg:max-w-[300px] shrink-0">
                <div className="flex items-center gap-3  ">
                    <Link href={`/profile/${profileId}`} className="shrink-0">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200 relative flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-gray-400 absolute" />
                            {user.avatar_url && (
                                <Image
                                    src={user.avatar_url}
                                    fill
                                    className="object-cover z-10"
                                    alt={user.name}
                                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                                />
                            )}
                        </div>
                    </Link>
                    <div className="min-w-0">
                        <Link href={`/profile/${profileId}`}>
                            <p className="text-sm font-medium truncate hover:underline">{user.name}</p>
                        </Link>
                        <p className="text-xs text-gray-400">عدد المتابعين: {user.followers_count}</p>
                    </div>
                </div>

                <div className="">
                    <button
                        onClick={() => onFollowToggle(user)}
                        disabled={isPending}
                        className={cn(
                            "h-8 px-5 rounded-full text-sm font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 min-w-[130px]",
                            user.am_i_following
                                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                : "bg-blue-4 text-white hover:bg-blue-3"
                        )}
                    >
                        {isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : user.am_i_following ? (
                            "إلغاء المتابعة"
                        ) : (
                            "متابعة"
                        )}
                    </button>
                </div>
            </div>

            <div className="flex-1 w-full lg:w-auto max-w-[600px]">
                {isPrivate ? (
                    <div className="flex items-center justify-center gap-2 py-4 text-gray-400 text-sm bg-blue-5 rounded-xl">
                        <Lock className="w-4 h-4" />
                        <span>مفضلة هذا الشخص مخفية</span>
                    </div>
                ) : hasFavorites ? (
                    <div className="flex items-center gap-1.5 bg-blue-5 rounded-xl p-2 overflow-hidden">
                        {visibleFavs.map((fav) => (
                            <Link
                                key={fav.id}
                                href={`/product/${fav.favs.slug}`}
                                className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-gray-200 shrink-0 relative"
                            >
                                {fav.favs.cover ? (
                                    <Image src={fav.favs.cover} fill className="object-cover" alt={fav.favs.name} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ShoppingBag className="w-5 h-5 text-gray-400" />
                                    </div>
                                )}
                            </Link>
                        ))}
                        {remainingCount > 0 && (
                            <Link
                                href={`/profile/${profileId}/favorites`}
                                className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-amber-400/80 shrink-0 flex items-center justify-center hover:bg-amber-500/80 transition-colors"
                                title="عرض جميع المفضلة"
                            >
                                <span className="text-white font-bold text-lg">+{remainingCount}</span>
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-2 py-4 text-blue-3 font-bold text-sm bg-blue-5 h-20 rounded-xl">
                        <span>لا يوجد أي منتجات مفضلة عند هذا الشخص حتى الآن</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function WhoFavoritedSection({
    slug,
    isOpen,
    onClose,
}: {
    slug: string;
    isOpen: boolean;
    onClose: () => void;
}) {
    const { data, isLoading } = useStoreWhoFavorited(slug, isOpen);
    const queryClient = useQueryClient();
    const { mutate: follow, isPending: isFollowing } = useFollowUserOrStore();
    const { mutate: unfollow, isPending: isUnfollowing } = useUnfollowUserOrStore();
    const [pendingUserId, setPendingUserId] = useState<number | null>(null);

    const users = data?.users || [];

    const handleFollowToggle = (user: WhoFavoritedUser) => {
        setPendingUserId(user.id);

        // قراءة الحالة الحقيقية من الـ cache قبل أي تعديل
        const currentCache = queryClient.getQueryData<any>(["storeWhoFavorited", slug]);
        const currentUser = currentCache?.users?.find((u: WhoFavoritedUser) => u.id === user.id);
        const isCurrentlyFollowing = currentUser ? currentUser.am_i_following : user.am_i_following;

        // Optimistic update: flip am_i_following immediately in cache
        queryClient.setQueryData(["storeWhoFavorited", slug], (old: any) => {
            if (!old) return old;
            return {
                ...old,
                users: old.users.map((u: WhoFavoritedUser) =>
                    u.id === user.id ? { ...u, am_i_following: !isCurrentlyFollowing } : u
                ),
            };
        });

        const onDone = () => {
            setPendingUserId(null);
            queryClient.invalidateQueries({ queryKey: ["storeWhoFavorited", slug] });
        };

        if (isCurrentlyFollowing) {
            unfollow(
                { followed_type: "user", followed_id: user.id },
                { onSettled: onDone }
            );
        } else {
            follow(
                { followed_type: "user", followed_id: user.id },
                { onSettled: onDone }
            );
        }
    };

    if (!isOpen) return null;

    return (
        <div className="">
            <div className="container bg-white rounded-xl p-4 md:p-6 shadow-sm mt-6">
                <div className="flex  justify-between mb-4 pt-4">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold">من فضّل هذا المتجر؟</h2>
                        <p className="text-sm text-gray-400 mt-1">
                            {users.length} من الأشخاص فضّلوا المتجر
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-3" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
                        لا يوجد من فضّل هذا المتجر حتى الآن
                    </div>
                ) : (
                    <div className="">
                        {users.map((user) => (
                            <FollowerCard
                                key={user.id}
                                user={user}
                                onFollowToggle={handleFollowToggle}
                                isPending={(isFollowing || isUnfollowing) && pendingUserId === user.id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function StoreHeader({ store, followers, stories = [], isOwnStore = false }: StoreHeaderProps) {
    const router = useRouter();
    const params = useParams();
    const lang = params?.locale || params?.lang || "ar";
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [showWhoFavorited, setShowWhoFavorited] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const { mutate: follow, isPending: isFollowing } = useFollowUserOrStore();
    const { mutate: unfollow, isPending: isUnfollowing } = useUnfollowUserOrStore();
    const covers = store.cover_urls || [];
    const currentCoverUrl = covers[currentImageIndex] || "";
    const currentCoverIsVideo = Boolean(
        currentCoverUrl && isStoreBannerVideoUrl(currentCoverUrl)
    );

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
        <>
            <div className="relative bg-white shadow-[0_4px_20px_-4px_rgba(15,23,42,0.1)] pb-4">
                <div className="relative h-48 md:h-[250px] lg:h-[300px] w-full overflow-hidden group">
                    {covers.length > 0 ? (
                        currentCoverIsVideo ? (
                            <video
                                key={currentCoverUrl}
                                src={currentCoverUrl}
                                className="absolute inset-0 h-full w-full object-cover transition-all duration-700"
                                muted
                                playsInline
                                loop
                                autoPlay
                                preload="metadata"
                            />
                        ) : (
                            <Image
                                key={currentCoverUrl}
                                src={currentCoverUrl}
                                alt="Store Cover"
                                fill
                                className="object-cover transition-all duration-700"
                            />
                        )
                    ) : (
                        <div className="w-full h-full" />
                    )}
                    <div className="absolute inset-0 bg-black/10 pointer-events-none" />

                    {covers.length > 1 && (
                        <>
                            <button
                                onClick={handleNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 hover:bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer text-white"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                            <button
                                onClick={handlePrev}
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

                <div
                    className="relative w-full max-w-[1400px] mx-auto px-5 sm:px-6 pb-4"
                    dir="rtl"
                >
                    <div className="-mt-14 sm:-mt-16 lg:-mt-20 z-10">
                        <div className="flex flex-col gap-4 w-full lg:flex-row lg:items-end lg:justify-between lg:gap-8">
                            {/* الشعار على الجانب (يمين) + التقييم والمتابعين تحته */}
                            <div className="flex flex-col items-center gap-2 me-auto ms-0 lg:me-0 shrink-0 w-[100px] sm:w-[108px] lg:w-[150px]">
                                <div
                                    className={cn("relative group", hasStories && "cursor-pointer")}
                                    onClick={() => hasStories && setAvatarStoryOpen(true)}
                                >
                                    <div
                                        className={cn(
                                            "w-[100px] h-[100px] sm:w-[108px] sm:h-[108px] lg:w-[150px] lg:h-[150px] rounded-full shrink-0 bg-gray-100 overflow-hidden relative flex items-center justify-center",
                                            hasStories
                                                ? "border-[3.5px] border-[#F05A28] shadow-md p-[3px]"
                                                : "border-[3px] border-[#FACC15] shadow-md lg:border-2 lg:border-white lg:shadow-sm"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "w-full h-full rounded-full overflow-hidden relative flex items-center justify-center bg-gray-100",
                                                hasStories && "border-2 border-white"
                                            )}
                                        >
                                            {store.logo_url ? (
                                                <Image
                                                    src={store.logo_url}
                                                    alt={store.name}
                                                    fill
                                                    className="object-contain"
                                                />
                                            ) : (
                                                <StoreIcon className="w-14 h-14 sm:w-16 sm:h-16 text-gray-400" />
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

                                <div className="flex flex-col items-center w-full">
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={cn(
                                                    "w-4 h-4 lg:w-[18px] lg:h-[18px]",
                                                    i < Math.round(Number(store.review_rate || 0))
                                                        ? "fill-[#FACC15] text-[#FACC15]"
                                                        : "fill-[#D4D4D8] text-[#D4D4D8]"
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-gray-500 text-xs font-medium mt-0.5">
                                        ( {store.review_count || 0} مراجعة )
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowWhoFavorited((prev) => !prev)}
                                    className="flex flex-col items-center gap-1.5 lg:flex-row lg:gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                                >
                                    <span className="flex -space-x-2 space-x-reverse shrink-0">
                                        {followers && followers.length > 0 ? (
                                            followers.slice(0, 3).map((fItem, idx) => {
                                                const avatarUrl =
                                                    fItem.follower_type === "store"
                                                        ? fItem.follower.logo_url
                                                        : fItem.follower.avatar_url;
                                                return (
                                                    <div
                                                        key={fItem.id || idx}
                                                        className="w-7 h-7 lg:w-8 lg:h-8 rounded-full border-2 border-white overflow-hidden relative shadow-sm bg-gray-100 flex items-center justify-center"
                                                    >
                                                        <UserIcon className="w-3.5 h-3.5 text-gray-400 absolute" />
                                                        {avatarUrl && (
                                                            <Image
                                                                src={avatarUrl}
                                                                fill
                                                                className="object-cover z-10"
                                                                alt="follower"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = "none";
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <span className="w-7 h-7 lg:w-8 lg:h-8 rounded-full border-2 border-white bg-gray-100 block" />
                                        )}
                                    </span>
                                    <span className="text-gray-600 text-[11px] sm:text-xs lg:text-sm font-medium text-center leading-tight">
                                        {followersCount > 0
                                            ? `${followersCount} متابع`
                                            : "لا يوجد متابعين"}
                                    </span>
                                </button>
                            </div>

                            {/* الاسم والأزرار — متناسقة مع تصميم Etnix (بدون وصف) */}
                            <div className="w-full flex flex-col gap-3 lg:gap-4 lg:flex-1 lg:min-w-0 lg:pb-2">
                                <div className="w-full text-right">
                                    <h1 className="text-2xl font-bold text-[#1e3a5f] leading-tight break-words">
                                        {store.name}
                                    </h1>
                                    {store.address && (
                                        <p className="text-gray-400 text-sm mt-1.5">{store.address}</p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-3 w-full lg:flex-row lg:flex-wrap lg:items-center lg:gap-2">
                                <button
                                    type="button"
                                    disabled={isFollowing || isUnfollowing}
                                    onClick={() => {
                                        if (store.am_i_following) {
                                            unfollow(
                                                { followed_type: "store", followed_id: store.id },
                                                {
                                                    onSuccess: () => {
                                                        queryClient.invalidateQueries({
                                                            queryKey: ["storeProfile"],
                                                        });
                                                        queryClient.invalidateQueries({
                                                            queryKey: ["storePageData"],
                                                        });
                                                    },
                                                }
                                            );
                                        } else {
                                            follow(
                                                { followed_type: "store", followed_id: store.id },
                                                {
                                                    onSuccess: () => {
                                                        queryClient.invalidateQueries({
                                                            queryKey: ["storeProfile"],
                                                        });
                                                        queryClient.invalidateQueries({
                                                            queryKey: ["storePageData"],
                                                        });
                                                    },
                                                }
                                            );
                                        }
                                    }}
                                    className={cn(
                                        "w-full h-12 px-5 rounded-full text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50",
                                        "lg:w-auto lg:h-10 lg:px-6",
                                        store.am_i_following
                                            ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                            : "bg-blue-4 text-white hover:bg-blue-3"
                                    )}
                                >
                                    <UserPlus className="w-5 h-5 shrink-0" strokeWidth={2} />
                                    <span>
                                        {store.am_i_following ? "إلغاء المتابعة" : "تابع المتجر"}
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    disabled={isChatLoading}
                                    onClick={() => {
                                        if (!user) {
                                            router.push(`/${lang}/login`);
                                            return;
                                        }
                                        setIsChatLoading(true);
                                        router.push(`/${lang}/chat?type=store&id=${store.id}`);
                                        setIsChatLoading(false);
                                    }}
                                    className="w-full h-12 px-5 rounded-full text-sm border border-blue-4 text-blue-4 font-medium flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors cursor-pointer disabled:opacity-50 lg:w-auto lg:h-10 lg:px-6"
                                >
                                    {isChatLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                                    ) : (
                                        <MessageCircle className="w-5 h-5 shrink-0" strokeWidth={2} />
                                    )}
                                    <span>الدردشة</span>
                                </button>
                                </div>

                                <div className="flex items-center justify-center gap-2 w-full lg:w-auto lg:justify-start">
                                    <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer shrink-0">
                                        <FavoriteButton
                                            id={store.id}
                                            type="store"
                                            isFavorite={store.is_favorite}
                                            onSuccess={() => {
                                                queryClient.invalidateQueries({
                                                    queryKey: ["storeProfile"],
                                                });
                                                queryClient.invalidateQueries({
                                                    queryKey: ["storePageData"],
                                                });
                                            }}
                                            className="w-full h-full"
                                            iconClassName="w-4 h-4"
                                        />
                                    </div>

                                    <div className="relative">
                                        <button
                                            onClick={() => setShowMoreMenu((v) => !v)}
                                            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
                                        >
                                            <MoreHorizontal className="w-4 h-4 text-gray-500" />
                                        </button>
                                        {showMoreMenu && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-10"
                                                    onClick={() => setShowMoreMenu(false)}
                                                />
                                                <div className="absolute left-0 top-12 z-20 bg-white rounded-xl shadow-lg border border-gray-100 min-w-[150px] py-1 overflow-hidden">
                                                    <button
                                                        onClick={() => {
                                                            setShowMoreMenu(false);
                                                            setShowShareModal(true);
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                                                    >
                                                        <Share2 className="w-4 h-4 text-gray-500" />
                                                        مشاركة
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setShowMoreMenu(false);
                                                            setShowReportModal(true);
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                                    >
                                                        <Flag className="w-4 h-4 text-red-500" />
                                                        إبلاغ
                                                    </button>
                                                </div>
                                            </>
                                        )}
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
            </div>

            {showWhoFavorited && (
                <WhoFavoritedSection
                    slug={store.slug}
                    isOpen={showWhoFavorited}
                    onClose={() => setShowWhoFavorited(false)}
                />
            )}

            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                shareUrl={typeof window !== "undefined" ? window.location.href : `https://aatene.com/store/${store.slug}`}
                title="مشاركة المتجر"
            />

            <ReportAbuseModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                type="store"
                id={store.id}
            />
        </>
    );
}
