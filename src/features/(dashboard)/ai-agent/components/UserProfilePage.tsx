// src/features/(dashboard)/ai-agent/pages/UserProfilePage.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { 
  MessageSquare, 
  Star, 
  Gauge, 
  ArrowLeft, 
  Phone, 
  Calendar,
  MessageCircle,
  Search,
  ChevronDown
} from "lucide-react";
import { Mosa3edySidebar } from "../home/components/Mosa3edySidebar";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { useGetUserReviews } from "../hooks";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { cn } from "@/src/lib/utils";

export function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params?.chatId as string;

  const { data, isLoading } = useGetUserReviews(chatId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F9FA]">
        <Loader2 className="w-10 h-10 text-[#3A5779] animate-spin" />
      </div>
    );
  }

  if (!data?.success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FA]">
         <p className="text-gray-500 mb-4">لم يتم العثور على بيانات المستخدم</p>
         <Button onClick={() => router.back()}>العودة للخلف</Button>
      </div>
    );
  }

  const { user_info, reviews, reviews_summary } = data;
  const starBreakdown = reviews_summary.star_breakdown;

  // حساب النسب المئوية لأشرطة التقدم
  const getPercentage = (count: number) => {
    if (reviews_summary.total_reviews === 0) return 0;
    return (count / reviews_summary.total_reviews) * 100;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6" dir="rtl">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Sidebar */}
        <div className="hidden lg:block shrink-0 sticky top-6">
            <Mosa3edySidebar isCollapsed />
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full space-y-6">
            
            {/* 1. User Info Card */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-[#3A5779] text-xl font-bold mb-4">معلومات المستخدم</h2>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                             {/* Placeholder Avatar */}
                             <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                             </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                {user_info.first_name || "اسم العميل"}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <span dir="ltr">{user_info.phone_number}</span>
                                <MessageCircle className="w-4 h-4 text-green-500 fill-current" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-500">
                        تاريخ آخر محادثة <br />
                        <span className="font-bold text-gray-900">
                            {user_info.last_seen 
                                ? format(new Date(user_info.last_seen), "EEEE dd MMMM yyyy", { locale: arSA }) 
                                : "-"}
                        </span>
                    </div>
                </div>

                <div>
                    <Button 
                        onClick={() => router.push(`/admin/mosa3edy/messages?chatId=${chatId}`)}
                        className="bg-[#3A5779] hover:bg-[#2c4460] text-white h-12 px-8 rounded-lg font-bold"
                    >
                        الذهاب للدردشة
                    </Button>
                </div>
            </div>

            {/* 2. Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Total Reviews */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center mb-3">
                        <Star className="w-6 h-6 text-yellow-500 fill-current" />
                    </div>
                    <p className="text-gray-500 text-sm font-medium mb-1">إجمالي التقييمات</p>
                    <div className="flex items-center gap-2">
                        <h3 className="text-3xl font-bold text-gray-900">{reviews_summary.total_reviews}</h3>
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">+20</span>
                    </div>
                </div>

                {/* Total Messages */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                        <MessageSquare className="w-6 h-6 text-blue-500 fill-current" />
                    </div>
                    <p className="text-gray-500 text-sm font-medium mb-1">جميع الرسائل</p>
                    <div className="flex items-center gap-2">
                        <h3 className="text-3xl font-bold text-gray-900">{user_info.total_messages}</h3>
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">+200</span>
                    </div>
                </div>

                {/* Avg Rating */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
                        <Gauge className="w-6 h-6 text-green-500" />
                    </div>
                    <p className="text-gray-500 text-sm font-medium mb-1">متوسط التقييمات</p>
                    <div className="flex items-center gap-2">
                        <h3 className="text-3xl font-bold text-gray-900">{reviews_summary.average_reviews.toFixed(1)}</h3>
                    </div>
                </div>
            </div>

            {/* 3. Ratings Distribution */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
                <h2 className="text-[#3A5779] text-xl font-bold mb-6 text-right">توزيع التقييمات</h2>
                <h3 className="font-bold text-gray-900 mb-6 text-right">تصنيف التقييم</h3>

                <div className="space-y-4">
                    {[
                        { stars: 5, count: starBreakdown.five_star },
                        { stars: 4, count: starBreakdown.four_star },
                        { stars: 3, count: starBreakdown.three_star },
                        { stars: 2, count: starBreakdown.two_star },
                        { stars: 1, count: starBreakdown.one_star },
                    ].map((item) => (
                        <div key={item.stars} className="flex items-center gap-4">
                            <span className="w-16 text-sm font-medium text-gray-500 shrink-0">{item.stars} نجوم</span>
                            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-[#3A5779] rounded-full" 
                                    style={{ width: `${getPercentage(item.count)}%` }}
                                />
                            </div>
                            <span className="w-20 text-sm font-medium text-gray-400 text-left shrink-0">{item.count} تقييم</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 4. Reviews List */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
                <h2 className="text-[#3A5779] text-xl font-bold mb-6">عرض التقييمات</h2>
                
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative w-full sm:w-64">
                         <div className="flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-lg cursor-pointer">
                            <span className="text-sm">أحدث التقييمات</span>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                         </div>
                    </div>
                     <div className="relative w-full sm:w-64">
                         <div className="flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-lg cursor-pointer">
                            <span className="text-sm">جميع التقييمات</span>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                         </div>
                    </div>
                    <div className="relative flex-1">
                        <Input 
                            placeholder="بحث..." 
                            className="bg-white border-gray-200 h-11 text-right pr-10"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                {/* List */}
                <div className="space-y-4">
                    {reviews.map((review, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-white hover:bg-gray-50 transition-colors">
                            <span className="font-medium text-gray-900 dir-ltr">
                                {format(new Date(review.timestamp), "dd-MM-yyyy")}
                            </span>
                            
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 text-lg">{review.rating.toFixed(1)}</span>
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star 
                                            key={i} 
                                            className={cn(
                                                "w-5 h-5",
                                                i < Math.round(review.rating) ? "text-yellow-400 fill-current" : "text-gray-200 fill-current"
                                            )} 
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}

                    {reviews.length === 0 && (
                        <div className="text-center py-10 text-gray-400">لا توجد تقييمات لعرضها</div>
                    )}
                </div>

                {/* Pagination (Static Mock as per UI) */}
                <div className="flex justify-center gap-2 mt-8 dir-ltr">
                    <button className="w-8 h-8 rounded-full bg-[#3A5779] text-white flex items-center justify-center text-sm font-bold">1</button>
                    <button className="w-8 h-8 rounded-full bg-blue-100 text-[#3A5779] flex items-center justify-center text-sm font-bold">2</button>
                    <span className="flex items-end px-2 text-gray-400">...</span>
                    <button className="w-8 h-8 rounded-full bg-blue-100 text-[#3A5779] flex items-center justify-center text-sm font-bold">3</button>
                    <button className="w-8 h-8 rounded-full bg-blue-100 text-[#3A5779] flex items-center justify-center text-sm font-bold">4</button>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}