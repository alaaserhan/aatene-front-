// src/features/(dashboard)/ai-agent/pages/UserProfilePage.tsx
"use client";

import { useState } from "react"; // تمت إزالة useMemo
import { useParams, useRouter } from "next/navigation";
import {
    MessageSquare,
    Star,
    Gauge,
    MessageCircle,
    Search,
    TrendingUp,
} from "lucide-react";
import { Mosa3edySidebar } from "../home/components/Mosa3edySidebar";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { useGetUserReviews } from "../hooks";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { cn } from "@/src/lib/utils";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";

export function UserProfilePage() {
    const params = useParams();
    const router = useRouter();
    const chatId = params?.chatId as string;

    const { data, isLoading } = useGetUserReviews(chatId);

    // States for filtering and sorting
    const [ratingFilter, setRatingFilter] = useState("all");
    const [sortOption, setSortOption] = useState("newest");
    const [searchQuery, setSearchQuery] = useState("");

    const ratingOptions = [
        { value: "all", label: "جميع التقييمات" },
        { value: "5", label: "5 نجوم" },
        { value: "4", label: "4 نجوم" },
        { value: "3", label: "3 نجوم" },
        { value: "2", label: "نجمتان" },
        { value: "1", label: "نجمة واحدة" },
    ];

    const sortOptions = [
        { value: "newest", label: "أحدث التقييمات" },
        { value: "oldest", label: "أقدم التقييمات" },
        { value: "highest", label: "الأعلى تقييماً" },
        { value: "lowest", label: "الأقل تقييماً" },
    ];

    // Logic to process reviews (بدون useMemo - المترجم سيقوم بذلك تلقائياً)
    let processedReviews = data?.reviews ? [...data.reviews] : [];

    // 1. Filter by Rating
    if (ratingFilter !== "all") {
        const targetRating = parseInt(ratingFilter);
        processedReviews = processedReviews.filter(r => Math.round(r.rating) === targetRating);
    }

    // 2. Filter by Search
    if (searchQuery) {
        processedReviews = processedReviews.filter(r =>
            r.review?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            format(new Date(r.timestamp), "yyyy-MM-dd").includes(searchQuery)
        );
    }

    // 3. Sort
    processedReviews.sort((a, b) => {
        switch (sortOption) {
            case "newest":
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            case "oldest":
                return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
            case "highest":
                return b.rating - a.rating;
            case "lowest":
                return a.rating - b.rating;
            default:
                return 0;
        }
    });

    if (isLoading || !chatId) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F8F9FA]">
                <Loader2 className="w-10 h-10 text-blue-4 animate-spin" />
            </div>
        );
    }

    if (!data?.success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FA] gap-4">
                <p className="text-gray-2 font-bold">لم يتم العثور على بيانات المستخدم</p>
                <Button onClick={() => router.back()} variant="outline">العودة للخلف</Button>
            </div>
        );
    }

    const { user_info, reviews_summary } = data;
    const starBreakdown = reviews_summary.star_breakdown;

    const getPercentage = (count: number) => {
        if (reviews_summary.total_reviews === 0) return 0;
        return (count / reviews_summary.total_reviews) * 100;
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] p-6" dir="rtl">
            <div className="flex flex-col lg:flex-row gap-6 items-start">

                {/* Sidebar */}
                <div className="hidden lg:block shrink-0 sticky top-25">
                    <Mosa3edySidebar isCollapsed />
                </div>

                {/* Main Content */}
                <div className="flex-1 w-full space-y-6">

                    {/* 1. User Info Card */}
                    <div className="bg-white rounded-lg p-6 border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h2 className="text-blue-4 text-xl font-bold mb-4">معلومات المستخدم</h2>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full  flex items-center justify-center overflow-hidden">
                                    <img src="/icons/dashboard/user.svg" className="w-16 h-16 " alt="User" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-medium  mb-1">
                                        {user_info.username || "اسم العميل"}
                                    </h3>
                                    <div className="flex items-center gap-2 text-blue-4 font-medium text-sm">
                                        <span >{user_info.chat_id}</span>
                                        <img src="/icons/dashboard/whatsapp.svg" className="w-5 h-5" alt="Phone" />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 text-sm text-gray-2">
                                تاريخ آخر محادثة <br />
                                <span className="font-bold ">
                                    {user_info.last_seen
                                        ? format(new Date(user_info.last_seen), "EEEE dd MMMM yyyy", { locale: arSA })
                                        : "-"}
                                </span>
                            </div>
                        </div>

                        <div>
                            <Button
                                onClick={() => router.push(`/admin/mosa3edy/messages?chatId=${chatId}`)}
                                className="bg-blue-3 hover:bg-[#2c4460] text-white h-12 px-8 rounded-lg font-medium"
                            >
                                الذهاب للدردشة
                            </Button>
                        </div>
                    </div>

                    {/* 2. Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* بطاقة إجمالي التقييمات */}
                        <div className="bg-white rounded-lg p-6 border border-gray-100  flex flex-col justify-between min-h-[150px]">
                            <div className="flex items-center justify-center w-full">
                                <div className="flex items-center  gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#FFFBEB] flex items-center justify-center">
                                        <Star className="w-5 h-5 text-[#F59E0B] fill-current" />
                                    </div>
                                    <span className="text-gray-2 font-medium text-sm">إجمالي التقييمات</span>
                                </div>

                            </div>
                            <div className="flex justify-center items-center mt-2">
                                <h3 className="text-4xl font-bold ">{reviews_summary.total_reviews}</h3>
                            </div>
                        </div>

                        {/* بطاقة جميع الرسائل */}
                        <div className="bg-white rounded-lg p-6 border border-gray-100  flex flex-col  min-h-[150px]">
                            <div className="flex items-center justify-center w-full">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center">
                                        <MessageCircle className="w-5 h-5 text-[#3B82F6] fill-current" />
                                    </div>
                                    <span className="text-gray-2 font-medium text-sm">جميع الرسائل</span>
                                </div>

                            </div>
                            <div className="flex justify-center items-center mt-2">
                                <h3 className="text-4xl font-bold ">{reviews_summary.total_messages || 0}</h3>
                            </div>
                        </div>

                        {/* بطاقة متوسط التقييمات */}
                        <div className="bg-white rounded-lg p-6 border border-gray-100  flex flex-col justify-between min-h-[150px]">
                            <div className="flex items-center justify-center gap-3 w-full">
                                <div className="w-10 h-10 rounded-full bg-[#E7F8F0] flex items-center justify-center border border-green-100">
                                    <Star className="w-5 h-5 text-[#10B981]" />
                                </div>
                                <span className="text-gray-2 font-medium text-sm">متوسط التقييمات</span>
                            </div>
                            <div className="flex justify-center items-center mt-2">
                                <h3 className="text-4xl font-bold ">{reviews_summary.average_reviews.toFixed(1)}</h3>
                            </div>
                        </div>
                    </div>

                    {/* 3. Ratings Distribution */}
                    <div className="bg-white rounded-lg p-6 border border-gray-100">
                        <h2 className="text-blue-4 text-xl font-bold mb-6 text-right">توزيع التقييمات</h2>
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-bold  mb-6 text-right">تصنيف التقييم</h3>

                            <div className="space-y-4">
                                {[
                                    { stars: 5, count: starBreakdown.five_star },
                                    { stars: 4, count: starBreakdown.four_star },
                                    { stars: 3, count: starBreakdown.three_star },
                                    { stars: 2, count: starBreakdown.two_star },
                                    { stars: 1, count: starBreakdown.one_star },
                                ].map((item) => (
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

                    {/* 4. Reviews List */}
                    <div className="bg-white rounded-lg p-6 border border-gray-100">
                        <h2 className="text-blue-4 text-xl font-bold mb-6">عرض التقييمات</h2>

                        {/* Filters & Search Row */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Input
                                    placeholder="بحث..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-white border-gray-200 h-11 text-right pr-10"
                                />
                                <Search className="w-4 h-4 text-gray-2 absolute right-3 top-1/2 -translate-y-1/2" />
                            </div>
                            {/* Sort Dropdown */}
                            <div className="w-full sm:w-[240px]">
                                <ReusableDropdown
                                    options={sortOptions}
                                    value={sortOption}
                                    onChange={setSortOption}
                                    placeholder="ترتيب حسب"
                                    className="bg-white h-11 border-gray-200"
                                />
                            </div>

                            {/* Filter Dropdown */}
                            <div className="w-full sm:w-[240px]">
                                <ReusableDropdown
                                    options={ratingOptions}
                                    value={ratingFilter}
                                    onChange={setRatingFilter}
                                    placeholder="تصنيف التقييم"
                                    className="bg-white h-11 border-gray-200"
                                />
                            </div>
                        </div>

                        {/* Reviews List Items */}
                        <div className="space-y-4">
                            {processedReviews.map((review, idx) => (
                                <div key={idx} className="flex items-center justify-between px-6 border border-gray-100 rounded-md bg-[#FCFCFC] hover:bg-gray-50 transition-colors p-3">
                                    {/* Right: Stars + Rating */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-1.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={cn(
                                                        "w-5 h-5",
                                                        i < Math.round(review.rating) ? "text-[#FFC107] fill-[#FFC107]" : "text-gray-200 fill-gray-200"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <span className="font-bold  text-lg">{review.rating.toFixed(1)}</span>
                                    </div>
                                    {/* Left: Date (LTR) */}
                                    <span className="font-medium  dir-ltr font-sans text-base">
                                        {format(new Date(review.timestamp), "dd-MM-yyyy")}
                                    </span>
                                </div>
                            ))}

                            {processedReviews.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-16 text-gray-2">
                                    <Star className="w-12 h-12 text-gray-200 mb-2" />
                                    <p>لا توجد تقييمات مطابقة</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}