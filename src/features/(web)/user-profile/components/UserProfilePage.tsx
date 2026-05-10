"use client";

import { useState, useEffect } from "react";
import { UserProfile, UserStory, UserFollower, UserProfilePageData } from "../types";
import Image from "next/image";
import { Star, Loader2, UserPlus, MessageSquare, Plus, Search, UserMinus, User as UserIcon, MoreHorizontal, Share2, Flag } from "lucide-react";
import { useUserProfile, useUserProfilePageData } from "../hooks";
import { useParams, useRouter, notFound } from "next/navigation";
import UserReviews from "../reviews/UserReviews";
import { cn, isVideoFile } from "@/src/lib/utils";
import { useAuthStore } from "@/src/stores/auth-store";
import { useFollowUserOrStore, useUnfollowUserOrStore, useCreateHighlight, useGetStories } from "@/src/features/(web)/settings/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { ShowStoryModal } from "@/src/features/(dashboard)/stories/components/ShowStoryModal";
import { CreateHighlightModal } from "@/src/features/(dashboard)/stories/components/CreateHighlightModal";
import { Story } from "@/src/features/(dashboard)/stories/api";
import ProductCard from "@/src/features/(web)/product/components/ProductCard";
import { Pagination } from "@/src/components/ui/Pagination";
import { ShareModal } from "@/src/components/ui/ShareModal";
import { useLanguage } from "@/src/hooks/use-language";
import { ReportAbuseModal } from "@/src/features/(web)/reports/components/ReportAbuseModal";
import { searchProducts, searchServices, searchStores } from "@/src/features/(web)/searchAndFilter/api";
import StoreCard from "@/src/features/(web)/stores/components/StoreCard";
import Link from "next/link";

function UserHeader({ user, isOwnProfile, followers, stories }: {
    user: UserProfile;
    isOwnProfile: boolean;
    followers: UserFollower[];
    stories: UserStory[];
}) {
    const [avatarStoryOpen, setAvatarStoryOpen] = useState(false);
    const hasStories = stories && stories.length > 0;
    const [showShareModal, setShowShareModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const { user: authUser } = useAuthStore();

    const mappedAvatarStories: Story[] = stories.map(s => ({
        id: s.id,
        image: s.image,
        text: s.text,
        color: s.color,
        created_at: s.created_at,
    }));
    const router = useRouter();
    const lang = useLanguage();
    const [isChatLoading, setIsChatLoading] = useState(false);
    const queryClient = useQueryClient();
    const { mutate: follow, isPending: isFollowing } = useFollowUserOrStore();
    const { mutate: unfollow, isPending: isUnfollowing } = useUnfollowUserOrStore();

    const handleFollowToggle = () => {
        const onSuccess = () => {
            queryClient.invalidateQueries({ queryKey: ["userProfile"] });
        };

        if (user.is_following) {
            unfollow({ followed_type: "user", followed_id: user.id }, { onSuccess });
        } else {
            follow({ followed_type: "user", followed_id: user.id }, { onSuccess });
        }
    };

    return (
        <div className="relative mb-8 bg-white shadow-sm border-b border-gray-100 pb-2 md:pb-6">
            <div className="relative h-44 md:h-[200px] lg:h-[250px] overflow-hidden w-full ">
                {user.cover_url ? (
                    isVideoFile(user.cover_url) ? (
                        <video
                            src={user.cover_url}
                            controls
                            playsInline
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    ) : (
                        <Image
                            src={user.cover_url}
                            alt="cover"
                            fill
                            className="object-cover"
                        />
                    )
                ) : (
                    <div className="w-full h-full" />
                )}
            </div>

            <div className="container relative">
                <div className="flex flex-col items-center gap-4 text-center max-md:items-stretch md:grid md:grid-cols-[max-content_1fr] md:gap-8 md:items-start md:text-start">

                    {/* Column 1: Avatar & Meta Stats */}
                    <div className="flex flex-col items-center relative -mt-20 z-10 w-full md:w-auto">
                        <div
                            className={cn("relative group", hasStories && "cursor-pointer")}
                            onClick={() => hasStories && setAvatarStoryOpen(true)}
                        >
                            <div className={cn(
                                "w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] md:w-[150px] md:h-[150px] rounded-full shrink-0 bg-gray-100 overflow-hidden relative flex items-center justify-center",
                                hasStories
                                    ? "border-[3.5px] border-[#F05A28] shadow-md p-[3px]"
                                    : "border-2 border-white shadow-sm"
                            )}>
                                <div className={cn(
                                    "w-full h-full rounded-full overflow-hidden relative flex items-center justify-center bg-gray-100",
                                    hasStories && "border-2 border-white"
                                )}>
                                    <UserIcon className="w-14 h-14 text-gray-400 absolute" />
                                    {user.avatar_url && (
                                        <Image
                                            src={user.avatar_url}
                                            alt={user.fullname}
                                            fill
                                            className="object-cover z-10"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-row md:flex-col items-center justify-center gap-6 md:gap-4 mt-4 md:mt-2 px-2">
                            {/* Stars */}
                            <div className="flex flex-col items-center">
                                <div className="flex items-center gap-1 mb-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={cn(
                                                "w-4 h-4 md:w-[18px] md:h-[18px]",
                                                i < Math.round(Number(user.review_rate))
                                                    ? "fill-[#FACC15] text-[#FACC15]"
                                                    : "fill-[#D4D4D8] text-[#D4D4D8]"
                                            )}
                                        />
                                    ))}
                                </div>
                                <span className="text-gray-500 text-xs md:text-sm font-medium">( {user.review_count} مراجعة )</span>
                            </div>

                            {/* Mobile Divider */}
                            <div className="w-px h-8 bg-gray-200 block md:hidden"></div>

                            {/* Followers */}
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="flex -space-x-1.5 sm:-space-x-2 md:-space-x-3 space-x-reverse">
                                    {followers && followers.length > 0 && (
                                        followers.slice(0, 3).map((fItem, idx) => (
                                            <div key={fItem.id || idx} className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full border border-white overflow-hidden relative shadow-sm z-10 bg-gray-100 flex items-center justify-center">
                                                <UserIcon className="w-4 h-4 text-gray-400 absolute" />
                                                {fItem.follower?.avatar_url && (
                                                    <Image
                                                        src={fItem.follower.avatar_url}
                                                        fill
                                                        className="object-cover z-10"
                                                        alt="follower"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                                <span className="text-gray-500 text-xs md:text-sm font-medium">
                                    {Number(user.followers_count || 0) > 0 ? `${user.followers_count} متابعين` : "لا يوجد متابعين"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: User Personal Information & Action Buttons */}
                    <div className="flex w-full min-w-0 max-w-full flex-col px-1 py-2 sm:px-0">
                        <h1 className="text-xl lg:text-2xl font-medium pt-2">{user.fullname}</h1>
                        <p className="text-gray-500 text-sm  font-medium mb-3">{user.city?.name}</p>

                        {/* الجوال: صف واحد مضغوط | الديسكتوب: كما كان سابقاً */}
                        <div className="flex w-full max-w-full flex-1 flex-row flex-nowrap items-stretch justify-center gap-1.5 max-md:max-w-full md:max-w-none md:items-center md:justify-start md:gap-3">
                            {isOwnProfile ? (
                                <button
                                    onClick={() => router.push("/settings")}
                                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-blue-1 px-6 py-2 text-sm font-medium text-blue-4 hover:bg-blue-50 transition-colors cursor-pointer md:min-h-0 md:w-auto md:px-12 md:py-1.5"
                                >
                                    <img src="/icons/dashboard/edit2.svg" alt="" className="w-4 shrink-0" />
                                    تعديل
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleFollowToggle}
                                        disabled={isFollowing || isUnfollowing}
                                        className={cn(
                                            "flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1 rounded-full px-2 py-2 text-[11px] font-medium transition-colors cursor-pointer max-md:min-w-0 md:h-auto md:min-h-0 md:min-w-[100px] md:flex-none md:gap-2 md:px-8 md:py-2 md:text-sm",
                                            user.is_following
                                                ? "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                                : "bg-[#456A8E] text-white hover:bg-[#355A7E]"
                                        )}
                                    >
                                        
                                        {(isFollowing || isUnfollowing) ? (
                                            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                                        ) :
                                            user.is_following ? <UserMinus className="h-4 w-4 shrink-0" /> : <UserPlus className="h-4 w-4 shrink-0" />
                                        }
                                        <span className="min-w-0 truncate md:hidden">
                                            {user.is_following ? "إلغاء" : "متابعة"}
                                        </span>
                                        <span className="hidden md:inline">
                                            {user.is_following ? "إلغاء المتابعة" : "تابع المستخدم"}
                                        </span>
                                    </button>

                                    <button
                                        disabled={isChatLoading}
                                        onClick={() => {
                                            if (!authUser) { router.push(`/${lang}/login`); return; }
                                            setIsChatLoading(true);
                                            router.push(`/${lang}/chat?type=user&id=${user.id}`);
                                            setIsChatLoading(false);
                                        }}
                                        className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1 rounded-full border border-[#456A8E] bg-white px-2 py-2 text-[11px] font-medium text-[#456A8E] transition-colors hover:bg-blue-50 max-md:min-w-0 md:h-auto md:min-h-0 md:min-w-[100px] md:flex-none md:gap-2 md:px-8 md:py-2 md:text-sm disabled:opacity-50"
                                    >
                                        {isChatLoading ? (
                                            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                                        ) : (
                                            <MessageSquare className="h-4 w-4 shrink-0" />
                                        )}
                                        <span className="shrink-0">دردش</span>
                                    </button>

                                    <div className="relative shrink-0 self-center">
                                        <button
                                            type="button"
                                            onClick={() => setShowMoreMenu(v => !v)}
                                            className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer md:h-10 md:w-10"
                                            aria-expanded={showMoreMenu}
                                            aria-haspopup="menu"
                                        >
                                            <MoreHorizontal className="h-5 w-5 text-gray-500 md:h-4 md:w-4" />
                                        </button>
                                        {showMoreMenu && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setShowMoreMenu(false)} aria-hidden />
                                                <div className="absolute end-0 top-full z-20 mt-1.5 min-w-[160px] rounded-xl border border-gray-100 bg-white py-1 shadow-lg overflow-hidden md:end-auto md:left-0 md:top-12 md:mt-0">
                                                    <button
                                                        onClick={() => { setShowMoreMenu(false); setShowShareModal(true); }}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                                                    >
                                                        <Share2 className="w-4 h-4 text-gray-500" />
                                                        مشاركة
                                                    </button>
                                                    <button
                                                        onClick={() => { setShowMoreMenu(false); setShowReportModal(true); }}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                                    >
                                                        <Flag className="w-4 h-4 text-red-500" />
                                                        إبلاغ
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
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

            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                shareUrl={typeof window !== "undefined" ? window.location.href : `https://aatene.com/profile/${user.slug}`}
                title="مشاركة الملف الشخصي"
            />

            <ReportAbuseModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                type="user"
                id={user.id}
            />
        </div >
    );
}

function HighlightsSection({ highlights, isOwnProfile, onAddHighlight }: {
    highlights: UserProfilePageData["highlights"];
    isOwnProfile: boolean;
    onAddHighlight: () => void;
}) {
    const [storyModalOpen, setStoryModalOpen] = useState(false);
    const [selectedStories, setSelectedStories] = useState<Story[]>([]);

    const filteredHighlights = highlights.filter(h => h.stories && h.stories.length > 0);

    if (!isOwnProfile && filteredHighlights.length === 0) return null;

    const getLastStory = (highlight: UserProfilePageData["highlights"][0]) => {
        if (!highlight.stories || highlight.stories.length === 0) return undefined;
        return highlight.stories[highlight.stories.length - 1];
    };

    const handleHighlightClick = (highlight: UserProfilePageData["highlights"][0]) => {
        const mapped: Story[] = highlight.stories.map(s => ({
            id: s.id,
            image: s.image,
            text: s.text,
            color: s.color,
            created_at: s.created_at,
        }));
        setSelectedStories(mapped);
        setStoryModalOpen(true);
    };

    return (
        <div className="mb-8 bg-white p-3 rounded-lg border border-gray-100">
            <h2 className=" font-medium mb-2 px-1 border-b border-gray-100 pb-2" dir="rtl">أبرز الأحداث</h2>
            <div className="flex gap-4 overflow-x-auto py-2 px-1 scrollbar-hide" dir="rtl">
                {isOwnProfile && (
                    <button
                        onClick={onAddHighlight}
                        className="shrink-0 flex flex-col items-center gap-1.5 cursor-pointer group outline-none"
                    >
                        <div className="w-[66px] h-[66px] rounded-full overflow-hidden border-[2.5px] border-[#F05A28] p-0.5 group-hover:scale-105 transition-transform flex items-center justify-center bg-white">
                            <div className="w-full h-full rounded-full border border-gray-100 flex items-center justify-center bg-white">
                                <Plus className="w-7 h-7 text-[#7352C7]" />
                            </div>
                        </div>
                        <span className="text-[13px] font-medium text-[#3F3F46]">أضف هايلايت</span>
                    </button>
                )}

                {filteredHighlights.map((highlight) => {
                    const lastStory = getLastStory(highlight);
                    return (
                        <button
                            key={highlight.id}
                            onClick={() => handleHighlightClick(highlight)}
                            className="shrink-0 flex flex-col items-center gap-1.5 cursor-pointer group"
                        >
                            <div className="w-18 h-18 rounded-full border-2 border-blue-4 p-1 group-hover:scale-105 transition-transform">
                                <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden relative border border-gray-100 flex items-center justify-center">
                                    {lastStory ? (
                                        lastStory.image ? (
                                            <div className="relative w-full h-full">
                                                {isVideoFile(lastStory.image) ? (
                                                    <video
                                                        src={lastStory.image}
                                                        className="w-full h-full object-cover"
                                                        muted
                                                        playsInline
                                                        preload="metadata"
                                                    />
                                                ) : (
                                                    <Image
                                                        src={lastStory.image}
                                                        alt={highlight.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                )}
                                            </div>
                                        ) : (
                                            <div
                                                className="w-full h-full flex items-center justify-center p-1 text-center text-white text-[10px] font-bold leading-tight"
                                                style={{ backgroundColor: lastStory.color || "#3A5779" }}
                                            >
                                                {lastStory.text}
                                            </div>
                                        )
                                    ) : (
                                        <div className="w-full h-full bg-linear-to-tr from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                            {highlight.name[0]}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <span className="text-[13px] font-medium text-[#3F3F46] max-w-[66px] truncate">{highlight.name}</span>
                        </button>
                    );
                })}
            </div>

            {storyModalOpen && (
                <ShowStoryModal
                    isOpen={storyModalOpen}
                    onClose={() => setStoryModalOpen(false)}
                    stories={selectedStories}
                    initialIndex={0}
                    showActions={false}
                />
            )}
        </div>
    );
}

function ProfileTabs({ user }: { user: UserProfile }) {
    const [activeTab, setActiveTab] = useState<"bio" | "reviews">("bio");

    return (
        <div className="mb-8 overflow-hidden">
            <div className="flex items-center border-b border-gray-200">
                <button
                    onClick={() => setActiveTab("bio")}
                    className={`flex-1 py-4 cursor-pointer text-center font-medium text-sm transition-all duration-300 relative ${activeTab === "bio"
                        ? "text-blue-3 bg-[#F8F7FF]"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                >
                    نظره عامة
                    {activeTab === "bio" && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-4" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("reviews")}
                    className={`flex-1 py-4 cursor-pointer text-center font-medium text-sm transition-all duration-300 relative ${activeTab === "reviews"
                        ? "text-blue-3 bg-[#F8F7FF]"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                >
                    تقييم ومراجعات
                    {activeTab === "reviews" && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-4" />
                    )}
                </button>
            </div>

            <div className="p-4 min-h-[200px]">
                {activeTab === "bio" ? (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap" dir="rtl">
                            {user.bio || "لا توجد بيانات"}
                        </p>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                        <UserReviews userId={user.id} />
                    </div>
                )}
            </div>
        </div>
    );
}

type ActiveFavoritesTab = "all" | "products" | "services" | "stores";

function ServiceCardMini({ service }: { service: any }) {
    const imageUrl = service.image_url || service.images_urls?.[0] || "/placeholder.png";
    return (
        <Link
            href={`/services/${service.slug}`}
            className="group flex flex-col rounded-xl overflow-hidden border border-gray-100 bg-white hover:shadow-md transition-shadow"
        >
            <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                <Image
                    src={imageUrl}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.png"; }}
                />
            </div>
            <div className="p-3 flex flex-col gap-1">
                <p className="font-medium text-sm line-clamp-2 text-gray-800">{service.title}</p>
                {service.store?.name && (
                    <p className="text-xs text-gray-400 truncate">{service.store.name}</p>
                )}
                <p className="text-blue-4 font-semibold text-sm mt-1">{Number(service.price || 0).toFixed(2)} ₪</p>
            </div>
        </Link>
    );
}

function ProductsSection({ userId }: { userId: number }) {
    const [activeTab, setActiveTab] = useState<ActiveFavoritesTab>("all");
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const { data: productsData, isLoading: isProductsLoading } = useQuery({
        queryKey: ["publicProfileFavProducts", userId, page, debouncedSearch, activeTab],
        queryFn: () => searchProducts({ fav_by_id: userId, page, per_page: 12, search: debouncedSearch || undefined }),
        enabled: !!userId,
    });

    const { data: servicesData, isLoading: isServicesLoading } = useQuery({
        queryKey: ["publicProfileFavServices", userId, page, debouncedSearch, activeTab],
        queryFn: () => searchServices({ fav_by_id: userId, page, per_page: 12, search: debouncedSearch || undefined }),
        enabled: !!userId,
    });

    const { data: storesData, isLoading: isStoresLoading } = useQuery({
        queryKey: ["publicProfileFavStores", userId, page, debouncedSearch, activeTab],
        queryFn: () => searchStores({ fav_by_id: userId, page, per_page: 12, search: debouncedSearch || undefined }),
        enabled: !!userId,
    });

    const products = productsData?.products || [];
    const services = servicesData?.services || [];
    const stores = storesData?.stores || [];

    const totalProducts = productsData?.total || 0;
    const totalServices = servicesData?.total || 0;
    const totalStores = storesData?.total || 0;

    const totalPages =
        activeTab === "products"
            ? Math.ceil(totalProducts / 12)
            : activeTab === "services"
                ? Math.ceil(totalServices / 12)
                : activeTab === "stores"
                    ? Math.ceil(totalStores / 12)
                    : 1;

    const isLoading =
        activeTab === "all"
            ? (isProductsLoading || isServicesLoading || isStoresLoading)
            : activeTab === "products"
                ? isProductsLoading
                : activeTab === "services"
                    ? isServicesLoading
                    : isStoresLoading;

    const handleTabChange = (tab: ActiveFavoritesTab) => {
        setActiveTab(tab);
        setPage(1);
    };

    return (
        <div className="my-8 mt-16">
            <h2 className=" text-2xl font-medium mb-4 " dir="rtl">المفضلة</h2>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6" dir="rtl">
                <aside className="lg:col-span-1">
                    <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-4">
                        <ul className="space-y-4">
                            <li>
                                <button
                                    onClick={() => handleTabChange("all")}
                                    className={cn(
                                        "w-full flex items-center justify-between transition-colors cursor-pointer",
                                        activeTab === "all"
                                            ? "text-blue-3 font-medium border-r-2 border-blue-3 pr-2 bg-transparent"
                                            : "text-gray-600 hover:text-gray-900 font-medium border-r-2 border-transparent pr-2 bg-transparent"
                                    )}
                                >
                                    <span className="text-[15px]">الكل</span>
                                    <span className="text-[15px]" dir="ltr">({totalProducts + totalServices + totalStores})</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => handleTabChange("products")}
                                    className={cn(
                                        "w-full flex items-center justify-between transition-colors cursor-pointer",
                                        activeTab === "products"
                                            ? "text-blue-3 font-medium border-r-2 border-blue-3 pr-2 bg-transparent"
                                            : "text-gray-600 hover:text-gray-900 font-medium border-r-2 border-transparent pr-2 bg-transparent"
                                    )}
                                >
                                    <span className="text-[15px]">منتجات</span>
                                    <span className="text-[15px]" dir="ltr">({totalProducts})</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => handleTabChange("services")}
                                    className={cn(
                                        "w-full flex items-center justify-between transition-colors cursor-pointer",
                                        activeTab === "services"
                                            ? "text-blue-3 font-medium border-r-2 border-blue-3 pr-2 bg-transparent"
                                            : "text-gray-600 hover:text-gray-900 font-medium border-r-2 border-transparent pr-2 bg-transparent"
                                    )}
                                >
                                    <span className="text-[15px]">خدمات</span>
                                    <span className="text-[15px]" dir="ltr">({totalServices})</span>
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => handleTabChange("stores")}
                                    className={cn(
                                        "w-full flex items-center justify-between transition-colors cursor-pointer",
                                        activeTab === "stores"
                                            ? "text-blue-3 font-medium border-r-2 border-blue-3 pr-2 bg-transparent"
                                            : "text-gray-600 hover:text-gray-900 font-medium border-r-2 border-transparent pr-2 bg-transparent"
                                    )}
                                >
                                    <span className="text-[15px]">متاجر</span>
                                    <span className="text-[15px]" dir="ltr">({totalStores})</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                </aside>

                <div className="lg:col-span-4 flex flex-col gap-4">
                    <div className="relative w-full bg-white rounded-full">
                        <input
                            type="text"
                            placeholder="ابحث في المفضلة..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pr-4 py-3 border border-blue-4 rounded-full text-sm focus:outline-none focus:border-blue-3 focus:ring-1 focus:ring-blue-3 transition-colors"
                        />
                        <div className="w-8 h-8 bg-blue-4 rounded-full  absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none flex  items-center justify-center">

                            <Search className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center p-10">
                            <Loader2 className="animate-spin text-blue-3" />
                        </div>
                    ) : (
                        <>
                            {(activeTab === "all" || activeTab === "products") && (
                                <section>
                                    {activeTab === "all" && (
                                        <h3 className="text-lg font-semibold mb-3">المنتجات</h3>
                                    )}
                                    {products.length === 0 ? (
                                        <div className="text-center py-10 bg-gray-50 rounded-lg">
                                            <p className="text-gray-500">لا توجد منتجات مفضلة</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {products.map((product) => (
                                                <ProductCard
                                                    key={product.id}
                                                    id={product.id}
                                                    name={product.name}
                                                    slug={product.slug}
                                                    cover={product.cover || "/placeholder.png"}
                                                    price={product.price}
                                                    priceAfterDiscount={product.price_after_discount}
                                                    discountPercent={product.discount_present}
                                                    reviewRate={product.review_rate}
                                                    reviewCount={product.review_count}
                                                    isFavorite={product.is_favorite}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </section>
                            )}

                            {(activeTab === "all" || activeTab === "services") && (
                                <section className={activeTab === "all" ? "mt-6" : ""}>
                                    {activeTab === "all" && (
                                        <h3 className="text-lg font-semibold mb-3">الخدمات</h3>
                                    )}
                                    {services.length === 0 ? (
                                        <div className="text-center py-10 bg-gray-50 rounded-lg">
                                            <p className="text-gray-500">لا توجد خدمات مفضلة</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {services.map((service) => (
                                                <ServiceCardMini key={service.id} service={service} />
                                            ))}
                                        </div>
                                    )}
                                </section>
                            )}

                            {(activeTab === "all" || activeTab === "stores") && (
                                <section className={activeTab === "all" ? "mt-6" : ""}>
                                    {activeTab === "all" && (
                                        <h3 className="text-lg font-semibold mb-3">المتاجر</h3>
                                    )}
                                    {stores.length === 0 ? (
                                        <div className="text-center py-10 bg-gray-50 rounded-lg">
                                            <p className="text-gray-500">لا توجد متاجر مفضلة</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {stores.map((store) => (
                                                <StoreCard key={store.id} store={store} />
                                            ))}
                                        </div>
                                    )}
                                </section>
                            )}

                            {activeTab !== "all" && totalPages > 1 && (
                                <div className="mt-6" dir="ltr">
                                    <Pagination
                                        totalPages={totalPages}
                                        currentPage={page}
                                        onPageChange={setPage}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function UserProfilePage() {
    const params = useParams();
    const slugOrId = params.slugOrId as string;
    const authUser = useAuthStore(state => state.user);
    const queryClient = useQueryClient();

    const [isCreateHighlightOpen, setIsCreateHighlightOpen] = useState(false);
    const { mutate: createHighlight, isPending: isCreatingHighlight } = useCreateHighlight();
    const { data: storiesData } = useGetStories();

    const { data: profileData, isLoading: isProfileLoading } = useUserProfile(slugOrId);
    const { data: pageData, isLoading: isPageDataLoading } = useUserProfilePageData(slugOrId);


    const handleCreateHighlight = (payload: { name: string; stories: number[] }, onSuccess?: () => void) => {
        createHighlight(payload, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["userProfile"] });
                onSuccess?.();
            }
        });
    };

    if (isProfileLoading || isPageDataLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-3" />
            </div>
        );
    }

    if (!profileData?.user) {
        notFound();
    }

    const user = profileData.user;
    const isOwnProfile = authUser?.id === user.id;
    const stories = pageData?.stories || [];
    const highlights = pageData?.highlights || [];
    const followers = pageData?.followers || [];

    return (
        <div className="bg-gray-50 min-h-screen pb-20" dir="rtl">
            <UserHeader
                user={user}
                isOwnProfile={isOwnProfile}
                followers={followers}
                stories={stories}
            />
            <div className="container ">

                <HighlightsSection
                    highlights={highlights}
                    isOwnProfile={isOwnProfile}
                    onAddHighlight={() => setIsCreateHighlightOpen(true)}
                />

                <ProfileTabs user={user} />

                <ProductsSection userId={user.id} />
            </div>

            <CreateHighlightModal
                isOpen={isCreateHighlightOpen}
                onClose={() => setIsCreateHighlightOpen(false)}
                availableStories={storiesData?.data || []}
                onSave={handleCreateHighlight}
                isPending={isCreatingHighlight}
            />
        </div>
    );
}
