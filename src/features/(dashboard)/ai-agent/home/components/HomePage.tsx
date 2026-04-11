// src/features/(dashboard)/home/components/HomePage.tsx
"use client";

import { useGetAgentOverview, useGetDriveFiles, useGetWebAnalytics } from "../../hooks";
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
    const { data: webAnalytics } = useGetWebAnalytics();

    const raw = overviewResponse?.overview;
    const web = webAnalytics;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
                <Loader2 className="w-10 h-10 animate-spin text-[#3A5779]" />
            </div>
        );
    }

    if (isError || !raw) {
        return (
            <div className="min-h-[calc(100vh-124px)] flex items-center justify-center bg-[#F8F9FA]">
                <p className="text-red-500 font-bold">حدث خطأ أثناء تحميل البيانات</p>
            </div>
        );
    }

    const webConversations = web?.conversations;
    const webMessages = web?.messages;
    const webRatings = web?.ratings;

    const mergedTotalUsers = (raw.total_users || 0) + (webConversations?.total || 0);
    const mergedTotalMessages = (raw.total_messages || 0) + (webMessages?.total || 0);

    const mergedConversationTypes = {
        ratio: raw.conversation_types?.ratio || "0:0",
        needs_human_true: (raw.conversation_types?.needs_human_true || 0) + (webConversations?.needs_human || 0),
        needs_human_false: (raw.conversation_types?.needs_human_false || 0) + (webConversations?.done_by_bot || 0),
    };

    const webPlatformEntry = { platform: "website", number_of_users: webMessages?.total || 0 };
    const existingPlatforms = raw.users_per_platform || [];
    const hasWebsite = existingPlatforms.some((p) => p.platform.toLowerCase() === "website");
    const mergedUsersPerPlatform = hasWebsite
        ? existingPlatforms.map((p) =>
              p.platform.toLowerCase() === "website"
                  ? { ...p, number_of_users: p.number_of_users + (webMessages?.total || 0) }
                  : p
          )
        : [...existingPlatforms, webPlatformEntry];

    const oldBreakdown = raw.review_stars_breakdown || {};
    const webDist = webRatings?.distribution;
    const mergedBreakdown: Record<string, number> = {
        five_star: (oldBreakdown["five_star"] || 0) + (webDist?.["5"] || 0),
        four_star: (oldBreakdown["four_star"] || 0) + (webDist?.["4"] || 0),
        three_star: (oldBreakdown["three_star"] || 0) + (webDist?.["3"] || 0),
        two_star: (oldBreakdown["two_star"] || 0) + (webDist?.["2"] || 0),
        one_star: (oldBreakdown["one_star"] || 0) + (webDist?.["1"] || 0),
    };

    const totalReviewsCalculated = Object.values(mergedBreakdown).reduce((a, b) => a + b, 0);

    const oldTotal = raw.review_stars_breakdown
        ? Object.values(raw.review_stars_breakdown).reduce((a, b) => a + b, 0)
        : 0;
    const webTotal = webDist
        ? Object.values(webDist).reduce((a, b) => a + b, 0)
        : 0;
    const mergedAverage =
        oldTotal + webTotal > 0
            ? ((raw.average_review_all_platforms || 0) * oldTotal + (webRatings?.average || 0) * webTotal) /
              (oldTotal + webTotal)
            : 0;

    const existingRatings = raw.platforms_average_rating || [];
    const hasWebsiteRating = existingRatings.some((r) => r.platform.toLowerCase() === "website");
    const mergedPlatformRatings = hasWebsiteRating
        ? existingRatings
        : [...existingRatings, { platform: "website", average_rating: webRatings?.average || 0 }];

    const data = {
        ...raw,
        total_users: mergedTotalUsers,
        total_messages: mergedTotalMessages,
        conversation_types: mergedConversationTypes,
        users_per_platform: mergedUsersPerPlatform,
        review_stars_breakdown: mergedBreakdown,
        average_review_all_platforms: mergedAverage,
        platforms_average_rating: mergedPlatformRatings,
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] p-3 lg:p-5" >

            <div className="lg:grid lg:grid-cols-[270px_1fr] flex flex-col gap-4 items-start">

                {/* Sidebar */}
                <div className="w-full lg:sticky lg:top-25">
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
                            icon={"message2"}
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