// src/features/(dashboard)/home/components/HomePage.tsx
"use client";

import { useGetAgentOverview, useGetKnowledgeBank, useGetWebAnalytics } from "../../hooks";
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

/** عدد تقييمات بنجمة واحدة من توزيع Laravel (مفاتيح نصية أو رقمية في JSON). */
function ratingDistCount(dist: Record<string, number> | undefined, star: 1 | 2 | 3 | 4 | 5): number {
    if (!dist) return 0;
    const n = dist[String(star)];
    if (typeof n === "number" && !Number.isNaN(n)) return n;
    const alt = (dist as Record<number, number>)[star];
    return typeof alt === "number" && !Number.isNaN(alt) ? alt : 0;
}

/** يدمج صفّي web وwebsite في صف واحد باسم website (نفس مصدر «الموقع» في المنتج). */
function mergeWebWebsiteUserRows(rows: { platform: string; number_of_users: number }[]): { platform: string; number_of_users: number }[] {
    let sum = 0;
    const rest: { platform: string; number_of_users: number }[] = [];
    let hadWebLike = false;
    for (const r of rows) {
        const k = r.platform.toLowerCase();
        if (k === "web" || k === "website") {
            hadWebLike = true;
            sum += r.number_of_users;
        } else {
            rest.push(r);
        }
    }
    if (!hadWebLike) return rows;
    return [...rest, { platform: "website", number_of_users: sum }];
}

type RatingRowIn = { platform: string; average_rating: number; count: number };

/** متوسط مرجّح عند وجود count؛ وإلا متوسط الحسابي لصفّي web وwebsite. */
function mergeWebWebsiteRatingRows(rows: RatingRowIn[]): { platform: string; average_rating: number }[] {
    const webLike: RatingRowIn[] = [];
    const rest: RatingRowIn[] = [];
    for (const r of rows) {
        const k = r.platform.toLowerCase();
        if (k === "web" || k === "website") {
            webLike.push(r);
        } else {
            rest.push(r);
        }
    }
    const out = rest.map(({ platform, average_rating }) => ({ platform, average_rating }));
    if (webLike.length === 0) {
        return rows.map(({ platform, average_rating }) => ({ platform, average_rating }));
    }
    const totalCount = webLike.reduce((s, r) => s + r.count, 0);
    const avg =
        totalCount > 0
            ? webLike.reduce((s, r) => s + r.average_rating * r.count, 0) / totalCount
            : webLike.reduce((s, r) => s + r.average_rating, 0) / webLike.length;
    return [...out, { platform: "website", average_rating: avg }];
}

export function HomePage() {
    const { data: overviewResponse, isLoading, isError } = useGetAgentOverview();
    const { data: knowledgeBankResponse } = useGetKnowledgeBank();
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

    /** إجمالي محادثات ومسار الويب من Laravel (مصدر webhook / ai-support). */
    const webConvTotal = webConversations?.total ?? 0;

    // Total users: من api1 + محادثات الويب المسجّلة في Laravel
    const mergedTotalUsers = (raw.total_users || 0) + webConvTotal;

    // Total messages: رسائل المنصات القديمة + رسائل الويب من Laravel
    const platformMsgsTotal = Object.values(raw.messages_by_platform || {}).reduce((a, b) => a + b, 0);
    const mergedTotalMessages = platformMsgsTotal + (webMessages?.total || 0);

    /**
     * جلسات الشات: جانب الويب من Laravel بشكل صريح (needs_human / done_by_bot كما في ConversationService::getAnalytics).
     * جانب api1: تقدير «بدون موظف» = إجمالي المستخدمين/المحادثات في overview − المحتاجة لموظف (تقريب للمنصات غير الويب).
     */
    const legacyTotal = raw.total_users ?? 0;
    const legacyNeeds = raw.needs_human_count ?? 0;
    const legacyBotEstimate = Math.max(0, legacyTotal - legacyNeeds);
    const laravelNeeds = webConversations?.needs_human ?? 0;
    const laravelDoneByBot = webConversations?.done_by_bot ?? 0;

    const mergedConversationTypes = {
        ratio: "0:0",
        needs_human_true: legacyNeeds + laravelNeeds,
        needs_human_false: legacyBotEstimate + laravelDoneByBot,
    };

    // Users per platform: derive from messages_by_platform
    const existingPlatforms = Object.entries(raw.messages_by_platform || {}).map(([platform, count]) => ({
        platform,
        number_of_users: count as number,
    }));
    const hasWebsiteKey = existingPlatforms.some((p) => p.platform.toLowerCase() === "website");
    const hasWebKey = existingPlatforms.some((p) => p.platform.toLowerCase() === "web");
    const extraWebMsgs = webMessages?.total || 0;

    let mergedUsersPerPlatform: { platform: string; number_of_users: number }[];
    if (hasWebsiteKey) {
        mergedUsersPerPlatform = existingPlatforms.map((p) =>
            p.platform.toLowerCase() === "website"
                ? { ...p, number_of_users: p.number_of_users + extraWebMsgs }
                : p
        );
    } else if (hasWebKey) {
        mergedUsersPerPlatform = existingPlatforms.map((p) =>
            p.platform.toLowerCase() === "web" ? { ...p, number_of_users: p.number_of_users + extraWebMsgs } : p
        );
    } else {
        mergedUsersPerPlatform = [...existingPlatforms, { platform: "website", number_of_users: extraWebMsgs }];
    }
    mergedUsersPerPlatform = mergeWebWebsiteUserRows(mergedUsersPerPlatform);

    // Reviews
    const webDist = webRatings?.distribution;

    // by_stars من overview (api1) + توزيع Laravel (webhook → تقييمات ai-support)
    const apiByStars = raw.reviews?.by_stars || {};
    const mergedBreakdown: Record<string, number> = {
        five_star: (apiByStars["5"] || 0) + ratingDistCount(webDist, 5),
        four_star: (apiByStars["4"] || 0) + ratingDistCount(webDist, 4),
        three_star: (apiByStars["3"] || 0) + ratingDistCount(webDist, 3),
        two_star: (apiByStars["2"] || 0) + ratingDistCount(webDist, 2),
        one_star: (apiByStars["1"] || 0) + ratingDistCount(webDist, 1),
    };

    /** مجموع التقييمات من التوزيع فقط — بدون جمع count مع مجموع النجوم (كان يضاعف العدد). */
    const totalReviewsCalculated =
        mergedBreakdown.five_star +
        mergedBreakdown.four_star +
        mergedBreakdown.three_star +
        mergedBreakdown.two_star +
        mergedBreakdown.one_star;

    const webTotal = webDist ? Object.values(webDist).reduce((a, b) => a + Number(b || 0), 0) : 0;

    /** متوسط واحد مطابق لمجموع أشرطة النجوم المدمَجة (api1 + Laravel). */
    const mergedAverage =
        totalReviewsCalculated > 0
            ? (5 * mergedBreakdown.five_star +
                  4 * mergedBreakdown.four_star +
                  3 * mergedBreakdown.three_star +
                  2 * mergedBreakdown.two_star +
                  1 * mergedBreakdown.one_star) /
              totalReviewsCalculated
            : 0;

    // platform ratings: من الـ API (web + website → صف واحد) ثم إضافة متوسط Laravel إن لم يُدرَج الموقع في overview
    const apiPlatformRatingsWithCounts: RatingRowIn[] = (raw.reviews?.by_platform || []).map((p) => ({
        platform: p.platform,
        average_rating: p.average_rating,
        count: p.count ?? 0,
    }));
    const hadWebsiteOrWebInOverview = (raw.reviews?.by_platform || []).some((p) => {
        const k = p.platform.toLowerCase();
        return k === "website" || k === "web";
    });
    let mergedPlatformRatings = mergeWebWebsiteRatingRows(apiPlatformRatingsWithCounts);
    if (!hadWebsiteOrWebInOverview && webTotal > 0 && webRatings?.average != null) {
        mergedPlatformRatings = [
            ...mergedPlatformRatings,
            { platform: "website", average_rating: webRatings.average },
        ];
    }

    const data = {
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
                            value={knowledgeBankResponse?.data?.length ?? 0}
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