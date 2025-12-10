// src/features/(dashboard)/home/components/HomePage.tsx
"use client";

import { useGetAgentOverview, useGetDriveFiles } from "../../hooks";
import {
    StatCard,
    SessionsChartCard,
    SourcesCard,
    RatingSourceCard,
    RatingClassificationCard,
    AverageRatingCard,
    PageHeader
} from "./DashboardComponents";
import { Mosa3edySidebar } from "./Mosa3edySidebar";
import { Database, MessageSquare, MessageCircle, Loader2 } from "lucide-react";

export function HomePage() {
    const { data: overviewResponse, isLoading, isError } = useGetAgentOverview();
      const { data: filesData } = useGetDriveFiles();
    
    const data = overviewResponse?.overview;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
                <Loader2 className="w-10 h-10 animate-spin text-[#3A5779]" />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="min-h-[calc(100vh-124px)] flex items-center justify-center bg-[#F8F9FA]">
                <p className="text-red-500 font-bold">حدث خطأ أثناء تحميل البيانات</p>
            </div>
        );
    }

    // Calculate Total Reviews securely
    const totalReviewsCalculated = data.review_stars_breakdown
        ? Object.values(data.review_stars_breakdown).reduce((a, b) => a + b, 0)
        : 0;

    return (
        <div className="min-h-screen bg-[#F8F9FA] p-5" >

            <div className="lg:grid lg:grid-cols-[270px_1fr] flex flex-col gap-4 items-start">

                {/* Sidebar */}
                <div className="hidden lg:block w-full sticky top-25">
                    <Mosa3edySidebar />
                </div>

                {/* Main Content */}
                <div className="w-full space-y-4 min-w-0">

                    <PageHeader />

                    {/* Row 1: Top Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard
                            title="محادثات Live"
                            value={data.total_users || 0}
                            icon={"chat"}
                            trend="+20"
                            iconColor="text-blue-500"
                            iconBg="bg-blue-50"
                        />
                        <StatCard
                            title="جميع الرسائل"
                            value={data.total_messages || 0}
                            icon={"chat"}
                            trend="+20"
                            iconColor="text-[#3A5779]"
                            iconBg="bg-[#EBF1F5]"
                        />
                        <StatCard
                            title="قاعدة المعرفة"
                            value={filesData?.count || 0} // Static value for now
                            icon={"database"}
                            iconColor="text-green-500"
                            iconBg="bg-green-50"
                        />
                    </div>

                    {/* Row 2: Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[420px]">
                        {/* Pass Data Safely */}
                        <SourcesCard
                            usersPerPlatform={data.users_per_platform}
                            totalUsers={data.total_users}
                        />
                        <SessionsChartCard data={data.conversation_types} />
                    </div>

                    {/* Row 3: Ratings Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 ">
                        <AverageRatingCard
                            average={data.average_review_all_platforms}
                            total={totalReviewsCalculated}
                        />
                        <RatingClassificationCard
                            breakdown={data.review_stars_breakdown}
                            totalReviews={totalReviewsCalculated}
                        />
                        <RatingSourceCard ratings={data.platforms_average_rating} />
                    </div>
                </div>

            </div>
        </div>
    );
}