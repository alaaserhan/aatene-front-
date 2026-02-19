"use client";

import { useState } from "react";
import MaxWidthWrapper from "@/src/components/(web)/MaxWidthWrapper";
import { UserProfile, UserStory } from "../types";
import Image from "next/image";
import { Star, PenLine, Loader2 } from "lucide-react";
import { useUserProfile, useUserProfilePageData, useUserFavProducts, useUserProducts } from "../hooks";
import { useParams, useRouter } from "next/navigation";
import UserReviews from "../reviews/UserReviews";
import { cn } from "@/src/lib/utils";
import { useAuthStore } from "@/src/stores/auth-store";
import { useFollowUserOrStore, useUnfollowUserOrStore } from "@/src/features/(web)/settings/hooks";
import { ShowStoryModal } from "@/src/features/(dashboard)/stories/components/ShowStoryModal";
import { Story } from "@/src/features/(dashboard)/stories/api";
import ProductCard from "@/src/features/(web)/product/components/ProductCard";
import { Pagination } from "@/src/components/ui/Pagination";

function UserHeader({ user, isOwnProfile }: { user: UserProfile; isOwnProfile: boolean }) {
    const router = useRouter();
    const { mutate: follow, isPending: isFollowing } = useFollowUserOrStore();
    const { mutate: unfollow, isPending: isUnfollowing } = useUnfollowUserOrStore();

    const handleFollowToggle = () => {
        if (user.am_i_following) {
            unfollow({ followed_type: "user", followed_id: user.id });
        } else {
            follow({ followed_type: "user", followed_id: user.id });
        }
    };

    return (
        <div className="relative mb-8">
            <div className="relative h-48 md:h-56 rounded-t-2xl overflow-hidden bg-gradient-to-r from-blue-4 to-blue-3">
                {user.cover_url && (
                    <Image
                        src={user.cover_url}
                        alt="cover"
                        fill
                        className="object-cover"
                    />
                )}
            </div>

            <div className="bg-white rounded-b-2xl shadow-sm border border-gray-100 border-t-0 px-6 pb-6 pt-4">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-4 -mt-16 md:-mt-14">
                    <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg shrink-0 bg-gray-100">
                        <Image
                            src={user.avatar_url || "/default-avatar.png"}
                            alt={user.fullname}
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div className="flex-1 text-center md:text-right mt-2 md:mt-0">
                        <h1 className="text-xl font-bold">{user.fullname}</h1>
                        <p className="text-sm text-blue-3">{user.slug}</p>
                        <p className="text-xs text-gray-500 mt-0.5">فلسطين · الخليل</p>
                    </div>

                    <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={cn(
                                        "w-4 h-4",
                                        i < Math.round(Number(user.review_rate))
                                            ? "fill-amber-400 text-amber-400"
                                            : "fill-gray-200 text-gray-200"
                                    )}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-gray-500">( {user.review_count} مراجعة )</span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between mt-5 gap-4">
                    {isOwnProfile ? (
                        <button
                            onClick={() => router.push("/settings")}
                            className="flex items-center justify-center gap-2 px-10 py-2.5 border border-blue-3 text-blue-3 rounded-full hover:bg-blue-50 transition-colors cursor-pointer text-sm font-medium"
                        >
                            <PenLine className="w-4 h-4" />
                            تعديل
                        </button>
                    ) : (
                        <button
                            onClick={handleFollowToggle}
                            disabled={isFollowing || isUnfollowing}
                            className={cn(
                                "flex items-center justify-center gap-2 px-10 py-2.5 rounded-full transition-colors cursor-pointer text-sm font-medium",
                                user.am_i_following
                                    ? "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                    : "bg-blue-4 text-white hover:bg-blue-3"
                            )}
                        >
                            {(isFollowing || isUnfollowing) && <Loader2 className="w-4 h-4 animate-spin" />}
                            {user.am_i_following ? "إلغاء المتابعة" : "متابعة"}
                        </button>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-bold">{user.followers_count}</span>
                        <span>متابع</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StoriesSection({ stories }: { stories: UserStory[] }) {
    const [storyModalOpen, setStoryModalOpen] = useState(false);
    const [storyIndex, setStoryIndex] = useState(0);

    if (!stories || stories.length === 0) return null;

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
        <div className="mb-8">
            <h2 className="text-lg font-bold mb-4" dir="rtl">أبرز الأحداث</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide" dir="rtl">
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
                                    <span className="text-white text-xs font-bold text-center px-1 line-clamp-2">
                                        {story.text}
                                    </span>
                                )}
                            </div>
                        </div>
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
    const totalPages = data ? Math.ceil(data.total / 12) : 1;

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4" dir="rtl">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold">المفضلة</h2>
                    {data && <span className="text-xs text-gray-500">يحتوي على {data.total} منتج</span>}
                </div>
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
    );
}

function ProductsSection({ userId, sections }: { userId: number; sections: { id: number; name: string; products_count: string }[] }) {
    const [selectedSection, setSelectedSection] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const { data, isLoading } = useUserProducts(userId, selectedSection, page);

    const products = data?.products || [];
    const totalPages = data ? Math.ceil(data.total / 12) : 1;

    const handleSectionChange = (sectionId: number | null) => {
        setSelectedSection(sectionId);
        setPage(1);
    };

    return (
        <div className="mb-8">
            <h2 className="text-lg font-bold mb-4 text-center" dir="rtl">كل المنتجات</h2>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" dir="rtl">
                <aside className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-4">
                        <h3 className="font-bold mb-3 text-sm border-b border-gray-100 pb-2">المتجر</h3>
                        <ul className="space-y-1">
                            <li>
                                <button
                                    onClick={() => handleSectionChange(null)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-2.5 rounded-lg text-sm transition-colors cursor-pointer",
                                        selectedSection === null
                                            ? "bg-blue-50 text-blue-3 font-medium"
                                            : "text-gray-600 hover:bg-gray-50"
                                    )}
                                >
                                    <span>الكل</span>
                                </button>
                            </li>
                            {sections.map(section => (
                                <li key={section.id}>
                                    <button
                                        onClick={() => handleSectionChange(section.id)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-2.5 rounded-lg text-sm transition-colors cursor-pointer",
                                            selectedSection === section.id
                                                ? "bg-blue-50 text-blue-3 font-medium"
                                                : "text-gray-600 hover:bg-gray-50"
                                        )}
                                    >
                                        <span>{section.name}</span>
                                        <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">{section.products_count}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                <div className="lg:col-span-3">
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
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

    const { data: profileData, isLoading: isProfileLoading } = useUserProfile(slugOrId);
    const { data: pageData, isLoading: isPageDataLoading } = useUserProfilePageData(slugOrId);

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

    return (
        <div className="bg-gray-50 min-h-screen pb-20" dir="rtl">
            <MaxWidthWrapper className="py-6">
                <UserHeader user={user} isOwnProfile={isOwnProfile} />

                <StoriesSection stories={stories} />

                <ProfileTabs user={user} />

                <FavoritesSection userId={user.id} />

                {sections.length > 0 && (
                    <ProductsSection userId={user.id} sections={sections} />
                )}
            </MaxWidthWrapper>
        </div>
    );
}
