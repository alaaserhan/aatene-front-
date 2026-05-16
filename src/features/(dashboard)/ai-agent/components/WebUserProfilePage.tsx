"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Star, MessageCircle, Loader2, Phone } from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { Mosa3edySidebar } from "../home/components/Mosa3edySidebar";
import { Button } from "@/src/components/ui/button";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { Pagination } from "@/src/components/ui/Pagination";
import { cn } from "@/src/lib/utils";
import { useGetSingleUserAnalytics, useGetUserAnalyticsReviews } from "../hooks";
import type { UserAnalyticsReview, UserAnalyticsReviewsResponse } from "../api";

const PER_PAGE = 15;

function parseReviewsResponse(res: UserAnalyticsReviewsResponse | undefined) {
    if (!res?.status) {
        return { items: [] as UserAnalyticsReview[], total: 0, lastPage: 1, currentPage: 1 };
    }
    const rating = res.rateing;
    if (Array.isArray(rating)) {
        return {
            items: rating,
            total: res.total ?? rating.length,
            lastPage: 1,
            currentPage: 1,
        };
    }
    const items = rating?.data ?? [];
    const meta = rating?.meta;
    return {
        items,
        total: res.total ?? meta?.total ?? items.length,
        lastPage: meta?.last_page ?? 1,
        currentPage: meta?.current_page ?? 1,
    };
}

const sortOptions = [
    { value: "newest", label: "أحدث التقييمات" },
    { value: "highest", label: "الأعلى تقييماً" },
    { value: "lowest", label: "الأقل تقييماً" },
];

const ratingOptions = [
    { value: "all", label: "جميع التقييمات" },
    { value: "5", label: "5 نجوم" },
    { value: "4", label: "4 نجوم" },
    { value: "3", label: "3 نجوم" },
    { value: "2", label: "نجمتان" },
    { value: "1", label: "نجمة واحدة" },
];

const orderbyMap: Record<string, "recent" | "highest_rate" | "lowest_rate"> = {
    newest: "recent",
    highest: "highest_rate",
    lowest: "lowest_rate",
};

export function WebUserProfilePage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const userId = Number(params?.userId);
    const returnPlatform = searchParams.get("platform") || "website";
    const returnChatId = searchParams.get("chatId");

    const [ratingFilter, setRatingFilter] = useState("all");
    const [sortOption, setSortOption] = useState("newest");
    const [page, setPage] = useState(1);

    const { data: analytics, isLoading: isAnalyticsLoading } = useGetSingleUserAnalytics(userId);

    const reviewParams = useMemo(
        () => ({
            per_page: PER_PAGE,
            page,
            ...(ratingFilter !== "all" ? { rate: ratingFilter } : {}),
            orderby: orderbyMap[sortOption] ?? "recent",
        }),
        [page, ratingFilter, sortOption]
    );

    const { data: reviewsData, isLoading: isReviewsLoading } = useGetUserAnalyticsReviews(userId, reviewParams);

    const parsedReviews = useMemo(() => parseReviewsResponse(reviewsData), [reviewsData]);

    const ratingDistribution = analytics?.rating_distribution ?? {};
    const totalReviews = useMemo(
        () => Object.values(ratingDistribution).reduce((sum, n) => sum + Number(n || 0), 0),
        [ratingDistribution]
    );

    const getPercentage = (count: number) => {
        if (totalReviews === 0) return 0;
        return (count / totalReviews) * 100;
    };

    const goToChat = () => {
        if (returnChatId) {
            router.push(
                `/admin/mosa3edy/messages?platform=${encodeURIComponent(returnPlatform)}&chatId=${encodeURIComponent(returnChatId)}`
            );
            return;
        }
        router.push(`/admin/mosa3edy/messages?platform=${encodeURIComponent(returnPlatform)}`);
    };

    if (!userId || Number.isNaN(userId)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FA] gap-4">
                <p className="text-gray-2 font-bold">معرّف المستخدم غير صالح</p>
                <Button onClick={() => router.back()} variant="outline">العودة</Button>
            </div>
        );
    }

    if (isAnalyticsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F8F9FA]">
                <Loader2 className="w-10 h-10 text-blue-4 animate-spin" />
            </div>
        );
    }

    if (!analytics?.status || !analytics.user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FA] gap-4">
                <p className="text-gray-2 font-bold">لم يتم العثور على بيانات المستخدم</p>
                <Button onClick={() => router.back()} variant="outline">العودة</Button>
            </div>
        );
    }

    const { user } = analytics;
    const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "مستخدم";
    const starRows = [5, 4, 3, 2, 1].map((stars) => ({
        stars,
        count: Number(ratingDistribution[String(stars)] ?? ratingDistribution[stars] ?? 0),
    }));

    return (
        <div className="min-h-screen bg-[#F8F9FA] p-6" dir="rtl">
            <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className="hidden lg:block shrink-0 sticky top-25">
                    <Mosa3edySidebar isCollapsed />
                </div>

                <div className="flex-1 w-full space-y-6">
                    <div className="bg-white rounded-lg p-6 border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h2 className="text-blue-4 text-xl font-bold mb-4">معلومات المستخدم</h2>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden bg-gray-100 border border-gray-200">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} className="w-16 h-16 object-cover" alt="" />
                                    ) : (
                                        <img src="/icons/dashboard/user.svg" className="w-16 h-16" alt="" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-medium mb-1">{displayName}</h3>
                                    {user.phone ? (
                                        <div className="flex items-center gap-2 text-blue-4 font-medium text-sm">
                                            <span dir="ltr">{user.phone}</span>
                                            <Phone className="w-4 h-4 shrink-0" />
                                        </div>
                                    ) : null}
                                    {user.email ? (
                                        <p className="text-xs text-gray-2 mt-1">{user.email}</p>
                                    ) : null}
                                </div>
                            </div>
                            <div className="mt-4 text-sm text-gray-2">
                                تاريخ آخر محادثة <br />
                                <span className="font-bold">
                                    {analytics.last_conversation_at
                                        ? format(new Date(analytics.last_conversation_at), "EEEE dd MMMM yyyy", { locale: arSA })
                                        : "-"}
                                </span>
                            </div>
                        </div>
                        <Button
                            type="button"
                            onClick={goToChat}
                            className="bg-blue-3 hover:bg-[#2c4460] text-white h-12 px-8 rounded-lg font-medium"
                        >
                            الذهاب للدردشة
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg p-6 border border-gray-100 flex flex-col justify-between min-h-[150px]">
                            <div className="flex items-center justify-center w-full">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#FFFBEB] flex items-center justify-center">
                                        <Star className="w-5 h-5 text-[#F59E0B] fill-current" />
                                    </div>
                                    <span className="text-gray-2 font-medium text-sm">إجمالي التقييمات</span>
                                </div>
                            </div>
                            <div className="flex justify-center items-center mt-2">
                                <h3 className="text-4xl font-bold">{totalReviews}</h3>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 border border-gray-100 flex flex-col min-h-[150px]">
                            <div className="flex items-center justify-center w-full">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center">
                                        <MessageCircle className="w-5 h-5 text-[#3B82F6]" />
                                    </div>
                                    <span className="text-gray-2 font-medium text-sm">جميع الرسائل</span>
                                </div>
                            </div>
                            <div className="flex justify-center items-center mt-2">
                                <h3 className="text-4xl font-bold">{analytics.total_messages}</h3>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 border border-gray-100 flex flex-col justify-between min-h-[150px]">
                            <div className="flex items-center justify-center gap-3 w-full">
                                <div className="w-10 h-10 rounded-full bg-[#E7F8F0] flex items-center justify-center border border-green-100">
                                    <Star className="w-5 h-5 text-[#10B981]" />
                                </div>
                                <span className="text-gray-2 font-medium text-sm">متوسط التقييمات</span>
                            </div>
                            <div className="flex justify-center items-center mt-2">
                                <h3 className="text-4xl font-bold">{(analytics.avg_rating ?? 0).toFixed(1)}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 border border-gray-100">
                        <h2 className="text-blue-4 text-xl font-bold mb-6 text-right">توزيع التقييمات</h2>
                        <div className="border border-gray-200 rounded-lg p-4">
                            <div className="space-y-4">
                                {starRows.map((item) => (
                                    <div key={item.stars} className="flex items-center gap-4">
                                        <span className="w-16 text-sm font-medium text-gray-2 shrink-0">{item.stars} نجوم</span>
                                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-4 rounded-full"
                                                style={{ width: `${getPercentage(item.count)}%` }}
                                            />
                                        </div>
                                        <span className="w-20 text-sm font-medium text-gray-2 text-left shrink-0">{item.count} تقييم</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 border border-gray-100">
                        <h2 className="text-blue-4 text-xl font-bold mb-6">عرض التقييمات</h2>

                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <div className="w-full sm:w-[240px]">
                                <ReusableDropdown
                                    options={sortOptions}
                                    value={sortOption}
                                    onChange={(v) => {
                                        setSortOption(v);
                                        setPage(1);
                                    }}
                                    placeholder="ترتيب حسب"
                                    className="bg-white h-11 border-gray-200"
                                />
                            </div>
                            <div className="w-full sm:w-[240px]">
                                <ReusableDropdown
                                    options={ratingOptions}
                                    value={ratingFilter}
                                    onChange={(v) => {
                                        setRatingFilter(v);
                                        setPage(1);
                                    }}
                                    placeholder="تصنيف التقييم"
                                    className="bg-white h-11 border-gray-200"
                                />
                            </div>
                        </div>

                        {isReviewsLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 text-blue-4 animate-spin" />
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {parsedReviews.items.map((review, idx) => (
                                        <div
                                            key={`${review.rate_time}-${idx}`}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-6 border border-gray-100 rounded-md bg-[#FCFCFC] p-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex gap-1.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={cn(
                                                                "w-5 h-5",
                                                                i < Math.round(review.rate)
                                                                    ? "text-[#FFC107] fill-[#FFC107]"
                                                                    : "text-gray-200 fill-gray-200"
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="font-bold text-lg">{Number(review.rate).toFixed(1)}</span>
                                            </div>
                                            <div className="text-sm text-gray-2 text-right sm:text-left">
                                                {review.rate_text ? (
                                                    <p className="mb-1 max-w-md">{review.rate_text}</p>
                                                ) : null}
                                                <span className="font-medium dir-ltr">
                                                    {format(new Date(review.rate_time), "dd-MM-yyyy")}
                                                </span>
                                            </div>
                                        </div>
                                    ))}

                                    {parsedReviews.items.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-16 text-gray-2">
                                            <Star className="w-12 h-12 text-gray-200 mb-2" />
                                            <p>لا توجد تقييمات</p>
                                        </div>
                                    )}
                                </div>

                                {parsedReviews.lastPage > 1 && (
                                    <div className="my-6">
                                        <Pagination
                                            totalPages={parsedReviews.lastPage}
                                            currentPage={page}
                                            onPageChange={(p) => {
                                                setPage(p);
                                                window.scrollTo({ top: 0, behavior: "smooth" });
                                            }}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
