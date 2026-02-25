"use client";

import { useState, useEffect } from "react";
import { UserProfile, UserStory, UserFollower } from "../types";
import Image from "next/image";
import { Star, Loader2, UserPlus, MessageSquare, Plus, Search, Type, Image as ImageIcon } from "lucide-react";
import { useUserProfile, useUserProfilePageData, useUserFavProducts, useUserProducts } from "../hooks";
import { useParams, useRouter } from "next/navigation";
import UserReviews from "../reviews/UserReviews";
import { cn } from "@/src/lib/utils";
import { useAuthStore } from "@/src/stores/auth-store";
import { useFollowUserOrStore, useUnfollowUserOrStore, useCreateStory } from "@/src/features/(web)/settings/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { ShowStoryModal } from "@/src/features/(dashboard)/stories/components/ShowStoryModal";
import { AddStoryModal } from "@/src/features/(dashboard)/stories/components/AddStoryModal";
import { MediaCenterModal } from "@/src/features/(dashboard)/mediaCenter/components/MediaCenterModal";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { CreateStoryPayload, Story } from "@/src/features/(dashboard)/stories/api";
import ProductCard from "@/src/features/(web)/product/components/ProductCard";
import { Pagination } from "@/src/components/ui/Pagination";

function UserHeader({ user, isOwnProfile, followers }: {
    user: UserProfile;
    isOwnProfile: boolean;
    followers: UserFollower[];
}) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { mutate: follow, isPending: isFollowing } = useFollowUserOrStore();
    const { mutate: unfollow, isPending: isUnfollowing } = useUnfollowUserOrStore();

    const handleFollowToggle = () => {
        const onSuccess = () => {
            queryClient.invalidateQueries({ queryKey: ["userProfile"] });
        };

        if (user.am_i_following) {
            unfollow({ followed_type: "user", followed_id: user.id }, { onSuccess });
        } else {
            follow({ followed_type: "user", followed_id: user.id }, { onSuccess });
        }
    };

    return (
        <div className="relative mb-8 bg-white shadow-sm border-b border-gray-100 pb-2 md:pb-6">
            <div className="relative h-32 md:h-[200px] lg:h-[250px] overflow-hidden w-full">
                <Image
                    src={user.cover_url || "/background.svg"}
                    alt="cover"
                    fill
                    className="object-cover"
                />
            </div>

            <div className="container relative">
                <div className="flex flex-col md:grid md:grid-cols-[max-content_1fr] gap-4 md:gap-8 items-center md:items-start text-center md:text-start">

                    {/* Column 1: Avatar & Meta Stats */}
                    <div className="flex flex-col items-center relative -mt-16 md:-mt-[100px] z-10 w-full md:w-auto">
                        <div className="relative group">
                            <div className="w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] md:w-[150px] md:h-[150px] rounded-full border-2 border-white shadow-sm shrink-0 bg-gray-100 overflow-hidden relative">
                                <Image
                                    src={user.avatar_url || "/default-avatar.png"}
                                    alt={user.fullname}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                        </div>

                        <div className="flex flex-row md:flex-col items-center justify-center gap-6 md:gap-4 mt-1 md:mt-2 px-2">
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
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex -space-x-2 md:-space-x-3 space-x-reverse">
                                    {followers && followers.length > 0 ? (
                                        followers.slice(0, 3).map((follower, idx) => (
                                            <div key={follower.id || idx} className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-white overflow-hidden relative shadow-sm z-10 bg-gray-100">
                                                <Image src={follower.avatar_url || "/default-avatar.png"} fill className="object-cover" alt="follower" />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-white overflow-hidden relative shadow-sm z-10 bg-gray-100" />
                                    )}
                                </div>
                                <span className="text-gray-500 text-xs md:text-sm font-medium">{user.followers_count || 0} متابع</span>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: User Personal Information & Action Buttons */}
                    <div className="flex flex-col py-2">
                        <h1 className="text-2xl md:text-3xl font-medium leading-tight mb-1 ">{user.fullname}</h1>
                        <p className="text-gray-500 text-sm md:text-base font-medium mb-1 ">{user.slug}</p>
                        <p className="text-gray-500 text-sm  font-medium mb-3">{user.city?.name}</p>

                        {/* Dynamic Button Action Mapping */}
                        <div className="flex items-stretch md:items-center justify-center md:justify-start gap-3 flex-1">
                            {isOwnProfile ? (
                                <button
                                    onClick={() => router.push("/settings")}
                                    className="flex items-center justify-center gap-2 px-12 py-1.5 border border-blue-1 text-blue-4 rounded-full hover:bg-blue-50 transition-colors cursor-pointer text-sm font-medium w-full md:w-auto"
                                >
                                    <img src="/icons/dashboard/edit2.svg" alt="" className="w-4" />
                                    تعديل
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleFollowToggle}
                                        disabled={isFollowing || isUnfollowing}
                                        className={cn(
                                            "flex items-center min-w-[100px] justify-center gap-2 px-4 md:px-8 py-2 rounded-full transition-colors cursor-pointer text-sm font-medium flex-1 md:flex-none",
                                            user.am_i_following
                                                ? "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                                : "bg-[#456A8E] text-white hover:bg-[#355A7E]"
                                        )}
                                    >
                                        {(isFollowing || isUnfollowing) ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <UserPlus className="w-4 h-4" />
                                        )}
                                        {user.am_i_following ? "إلغاء المتابعة" : "تابع المستخدم"}
                                    </button>

                                    <button className="flex items-center min-w-[100px] justify-center cursor-pointer gap-2 border border-[#456A8E] text-[#456A8E] bg-white px-4 md:px-8 py-2 rounded-full font-medium hover:bg-blue-50 transition-colors text-sm flex-1 md:flex-none">
                                        <MessageSquare className="w-4 h-4" />
                                        الدردشة
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                </div>
            </div >
        </div >
    );
}

function StoriesSection({ stories, isOwnProfile, onAddStory }: {
    stories: UserStory[];
    isOwnProfile: boolean;
    onAddStory: (mode: "text" | "media") => void;
}) {
    const [storyModalOpen, setStoryModalOpen] = useState(false);
    const [storyIndex, setStoryIndex] = useState(0);

    if (!isOwnProfile && (!stories || stories.length === 0)) return null;

    const mappedStories: Story[] = stories.map(s => ({
        id: s.id,
        image: s.image,
        text: s.text,
        color: s.color,
        created_at: s.created_at,
    }));

    const handleStoryClick = (index: number) => {
        setStoryIndex(index);
        setStoryModalOpen(true);
    };

    return (
        <div className="mb-8 bg-white p-3 rounded-lg border border-gray-100">
            <h2 className=" font-medium mb-2 px-1 border-b border-gray-100 pb-2" dir="rtl">أبرز الأحداث</h2>
            <div className="flex gap-4 overflow-x-auto py-2 px-1 scrollbar-hide" dir="rtl">
                {isOwnProfile && (
                    <DropdownMenu dir="rtl">
                        <DropdownMenuTrigger asChild>
                            <button className="shrink-0 flex flex-col items-center gap-1.5 cursor-pointer group outline-none">
                                <div className="w-[66px] h-[66px] rounded-full overflow-hidden border-[2.5px] border-[#F05A28] p-0.5 group-hover:scale-105 transition-transform flex items-center justify-center bg-white">
                                    <div className="w-full h-full rounded-full border border-gray-100 flex items-center justify-center bg-white">
                                        <Plus className="w-7 h-7 text-[#7352C7]" />
                                    </div>
                                </div>
                                <span className="text-[13px] font-medium text-[#3F3F46]">أضف قصتك</span>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 p-2 rounded-lg border border-gray-200 shadow-none bg-white z-50">
                            <DropdownMenuItem
                                onSelect={() => onAddStory("text")}
                                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg focus:bg-gray-50"
                            >
                                <div className="bg-blue-5 p-2 rounded">
                                    <Type className="w-5 h-5 text-blue-4" />
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="font-medium text-blue-4 text-sm">نص</span>
                                    <span className="text-xs text-gray-2 mt-0.5">قم باضافة نص الي قصتك</span>
                                </div>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onSelect={() => onAddStory("media")}
                                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg mt-1 focus:bg-gray-50"
                            >
                                <div className="bg-blue-5 p-2 rounded">
                                    <ImageIcon className="w-5 h-5 text-blue-4" />
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="font-medium text-blue-4 text-sm">صورة او فيديو</span>
                                    <span className="text-xs text-gray-2 mt-0.5">قم باضافة صورة او فيديو الي قصتك</span>
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                {stories.map((story, index) => (
                    <button
                        key={story.id}
                        onClick={() => handleStoryClick(index)}
                        className="shrink-0 flex flex-col items-center gap-1.5 cursor-pointer group"
                    >
                        <div
                            className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-3 p-0.5 group-hover:scale-105 transition-transform"
                        >
                            <div
                                className="w-full h-full rounded-full overflow-hidden flex items-center justify-center"
                                style={{ backgroundColor: story.color || "#3A5779" }}
                            >
                                {story.image ? (
                                    <Image
                                        src={story.image}
                                        alt=""
                                        width={60}
                                        height={60}
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                ) : (
                                    <span className="text-white text-xs font-medium text-center px-1 line-clamp-2">
                                        {story.text}
                                    </span>
                                )}
                            </div>
                        </div>
                        <span className="text-[13px] font-medium text-[#3F3F46] max-w-[66px] truncate">{story.text || "قصة"}</span>
                    </button>
                ))}
            </div>

            <ShowStoryModal
                isOpen={storyModalOpen}
                onClose={() => setStoryModalOpen(false)}
                stories={mappedStories}
                initialIndex={storyIndex}
                showActions={false}
            />
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
                    البيانات
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

function FavoritesSection({ userId }: { userId: number }) {
    const [page, setPage] = useState(1);
    const { data, isLoading } = useUserFavProducts(userId, page);

    const products = data?.products || [];
    const totalPages = data ? Math.ceil(data.total / 5) : 1;

    return (
        <div className="mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4 border-b border-gray-100 pb-3" dir="rtl">
                <h2 className="text-2xl  font-medium mb-3 sm:mb-0 w-full sm:w-auto text-right">المفضلة</h2>
                {totalPages > 1 && (
                    <div dir="rtl" className="hidden sm:block">
                        <Pagination
                            totalPages={totalPages}
                            currentPage={page}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="flex justify-center p-10">
                    <Loader2 className="animate-spin text-blue-3" />
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">لا توجد منتجات مفضلة</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
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
                    {totalPages > 1 && (
                        <div className="mt-6 flex justify-center sm:hidden" dir="rtl">
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
    );
}

function ProductsSection({ userId, sections }: { userId: number; sections: { id: number; name: string; products_count: string }[] }) {
    const [selectedSection, setSelectedSection] = useState<number | null>(null);
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

    const { data, isLoading } = useUserProducts(userId, selectedSection, page, debouncedSearch);

    const products = data?.products || [];
    const totalPages = data ? Math.ceil(data.total / 12) : 1;

    const handleSectionChange = (sectionId: number | null) => {
        setSelectedSection(sectionId);
        setPage(1);
    };

    return (
        <div className="my-8 mt-16">
            <h2 className=" text-2xl font-medium mb-4 " dir="rtl">كل المنتجات</h2>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6" dir="rtl">
                <aside className="lg:col-span-1">
                    <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-4">
                        <h3 className="font-medium mb-5 text-base border-none pb-0">أقسام المتجر</h3>
                        <ul className="space-y-4">
                            <li>
                                <button
                                    onClick={() => handleSectionChange(null)}
                                    className={cn(
                                        "w-full flex items-center justify-between transition-colors cursor-pointer",
                                        selectedSection === null
                                            ? "text-blue-3 font-medium border-r-2 border-blue-3 pr-2 bg-transparent"
                                            : "text-gray-600 hover:text-gray-900 font-medium border-r-2 border-transparent pr-2 bg-transparent"
                                    )}
                                >
                                    <span className="text-[15px]">الكل</span>
                                    <span className="text-[15px]" dir="ltr">({sections.reduce((acc, s) => acc + Number(s.products_count || 0), 0)})</span>
                                </button>
                            </li>
                            {sections.map(section => (
                                <li key={section.id}>
                                    <button
                                        onClick={() => handleSectionChange(section.id)}
                                        className={cn(
                                            "w-full flex items-center justify-between transition-colors cursor-pointer",
                                            selectedSection === section.id
                                                ? "text-blue-3 font-medium border-r-2 border-blue-3 pr-2 bg-transparent"
                                                : "text-gray-600 hover:text-gray-900 font-medium border-r-2 border-transparent pr-2 bg-transparent"
                                        )}
                                    >
                                        <span className="text-[15px]">{section.name}</span>
                                        <span className="text-[15px]" dir="ltr">({section.products_count})</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                <div className="lg:col-span-4 flex flex-col gap-4">
                    <div className="relative w-full bg-white rounded-full">
                        <input
                            type="text"
                            placeholder="ابحث عن منتج..."
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
                    ) : products.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">لا توجد منتجات</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4  gap-4">
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
                            <div className="mt-6" dir="ltr">
                                <Pagination
                                    totalPages={totalPages}
                                    currentPage={page}
                                    onPageChange={setPage}
                                />
                            </div>
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

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addMode, setAddMode] = useState<"text" | "media">("text");
    const { mutate: createStory, isPending: isCreatingStory } = useCreateStory();

    const { data: profileData, isLoading: isProfileLoading } = useUserProfile(slugOrId);
    const { data: pageData, isLoading: isPageDataLoading } = useUserProfilePageData(slugOrId);

    const handleOpenAdd = (mode: "text" | "media") => {
        setAddMode(mode);
        setIsAddModalOpen(true);
    };

    const handleCreateStory = (payload: CreateStoryPayload, onSuccess?: () => void) => {
        createStory(payload, {
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
        return <div className="py-20 text-center text-gray-500">المستخدم غير موجود</div>;
    }

    const user = profileData.user;
    const isOwnProfile = authUser?.id === user.id;
    const stories = pageData?.stories || [];
    const sections = pageData?.sections || [];
    const followers = pageData?.followers || [];

    return (
        <div className="bg-gray-50 min-h-screen pb-20" dir="rtl">
            <UserHeader
                user={user}
                isOwnProfile={isOwnProfile}
                followers={followers}
            />
            <div className="container ">

                <StoriesSection
                    stories={stories}
                    isOwnProfile={isOwnProfile}
                    onAddStory={handleOpenAdd}
                />

                <ProfileTabs user={user} />

                <FavoritesSection userId={user.id} />

                {sections.length > 0 && (
                    <ProductsSection userId={user.id} sections={sections} />
                )}
            </div>

            <AddStoryModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                mode={addMode}
                onSave={handleCreateStory}
                isPending={isCreatingStory}
                MediaPickerComponent={MediaCenterModal}
            />
        </div>
    );
}
