// src/features/(dashboard)/home/components/DashboardComponents.tsx
"use client";

import { cn } from "@/src/lib/utils";
import { Star, Phone, Instagram, Facebook, Globe, Download, MessageSquare, MessageCircle, Database } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { OverviewData } from "../../ai-agent/api";

// --- 1. Stat Card ---
interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: string;
    iconColor?: string;
    iconBg?: string;
}

export function StatCard({ title, value, icon: Icon, trend, iconColor, iconBg }: StatCardProps) {
    return (
        <div className="bg-white rounded-lg p-4 border border-gray-200 flex flex-col justify-between h-[140px]">
            <div className="flex justify-center items-start">
                {/* Right Side: Icon & Title */}
                <div className="flex items-center justify-center gap-3">
                    <div className={cn("p-2 rounded-full", iconBg)}>
                        <Icon className={cn("w-5 h-5", iconColor)} />
                    </div>
                    <span className="text-gray-2 text-sm font-medium">{title}</span>
                </div>

            </div>

            {/* Center Bottom: Value */}
            <div className="text-3xl font-bold  mt-2 text-center">{value}</div>
        </div>
    );
}

// --- 2. Chart Card (Full Pie - No Hole) ---
interface SessionsChartCardProps {
    data?: OverviewData['conversation_types']; // جعلناها اختيارية لتجنب الخطأ
}

export function SessionsChartCard({ data }: SessionsChartCardProps) {
    // استخدام القيم الافتراضية 0 في حال كانت البيانات غير موجودة
    const needsHuman = data?.needs_human_true || 0;
    const botReply = data?.needs_human_false || 0;

    const chartData = [
        { name: "البوت يرد", value: botReply, color: "#6366F1" }, // Purple
        { name: "يحتاج الي موظف", value: needsHuman, color: "#D97706" }, // Orange/Gold
    ];

    const total = botReply + needsHuman;
    const botPercent = total > 0 ? Math.round((botReply / total) * 100) : 0;
    const humanPercent = total > 0 ? Math.round((needsHuman / total) * 100) : 0;

    return (
        <div className="bg-white rounded-lg p-4 border border-gray-200 h-full flex flex-col">
            <div className="flex flex-col items-start mb-4">
                <h3 className="text-lg font-bold ">جلسات الشات بوت</h3>
                <p className="text-xs text-gray-3 mt-1">توزيع أنواع الجلسات</p>
            </div>

            <div className="flex-1 min-h-[200px] relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            startAngle={90}
                            endAngle={-270}
                            innerRadius={0} // 0 = Full Pie (No Hole)
                            outerRadius={100}
                            paddingAngle={0}
                            dataKey="value"
                            stroke="white"
                            strokeWidth={2}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <RechartsTooltip />
                    </PieChart>
                </ResponsiveContainer>

                {/* Labels Overlay */}
                {total > 0 && (
                    <>
                        <div className="absolute top-[40%] right-[20%] text-white font-bold text-xl drop-shadow-md">{humanPercent}%</div>
                        <div className="absolute bottom-[40%] left-[25%] text-white font-bold text-xl drop-shadow-md">{botPercent}%</div>
                    </>
                )}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2  mt-6 rounded-lg p-4 border-t border-gray-50 bg-[#F9F9F9]">
                {chartData.map((item) => (
                    <div key={item.name} className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-xs" style={{ backgroundColor: item.color }} />
                            <span className="text-xs text-gray-2 font-medium">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium ">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- 3. Sources Card ---
interface SourcesCardProps {
    usersPerPlatform?: OverviewData['users_per_platform'];
    totalUsers?: number;
}

export function SourcesCard({ usersPerPlatform = [] }: SourcesCardProps) {

    // 1. Find Platform with Max Users
    const maxPlatform = usersPerPlatform.reduce((prev, current) => {
        return (prev.number_of_users > current.number_of_users) ? prev : current
    }, { platform: "", number_of_users: 0 });

    // 2. Format the Max Number (Add spaces between digits: "3 0 0")
    const formattedMax = maxPlatform.number_of_users.toString().split('').join(' ');

    // Helper to map API platform names
    const getPlatformDetails = (platformName: string) => {
        switch (platformName.toLowerCase()) {
            case 'whatsapp': return { name: 'الواتساب', icon: <Phone className="w-4 h-4 text-[#25D366]" />, color: 'text-[#25D366]' };
            case 'instagram': return { name: 'الانستجرام', icon: <Instagram className="w-4 h-4 text-[#E1306C]" />, color: 'text-[#E1306C]' };
            case 'messenger': return { name: 'الماسنجر', icon: <div className="font-bold text-[#0084FF] text-[10px]">N</div>, color: 'text-[#0084FF]' };
            default: return { name: platformName, icon: <Globe className="w-4 h-4 text-gray-500" />, color: 'text-gray-500' };
        }
    };

    const topPlatformName = getPlatformDetails(maxPlatform.platform).name;

    return (
        <div className="bg-white rounded-lg p-4 border border-gray-200 h-full flex flex-col">
            <div className=" mb-8">
                <h3 className="text-xl font-medium  mb-1">مصدر المحادثات</h3>
                <div className="flex items-center gap-8">
                    <div>

                        {/* Display Max Value with Tracking */}
                        <div className="text-5xl font-black  my-3 tracking-[0.2em] font-medium">
                            {formattedMax || "0"}
                        </div>

                        <p className="text-sm text-gray-3  mb-1">اكبر عدد رسائل</p>
                    </div>
                    <div className="w-[1px] h-16 bg-blue-1"></div>

                    {/* Dynamic Text based on Max Platform */}
                    <p className="text-sm text-gray-3">
                        تم الحصول على هذا العدد من {topPlatformName}
                    </p>

                </div>
            </div>

            <div className="space-y-4 flex-1">
                {usersPerPlatform?.map((item, index) => {
                    const details = getPlatformDetails(item.platform);
                    return (
                        <div key={index} className="flex items-center justify-between p-2 border-b border-gray-50 last:border-0">
                            {/* Right Side: Icon + Name */}
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-transparent border border-gray-200">
                                    {details.icon}
                                </div>
                                <span className="text-sm text-gray-600 font-bold">{details.name}</span>
                            </div>

                            {/* Left Side: Count */}
                            <span className="font-bold  text-base">{item.number_of_users}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// --- 4. Rating Components ---

interface RatingSourceCardProps {
    ratings?: OverviewData['platforms_average_rating'];
}

export function RatingSourceCard({ ratings = [] }: RatingSourceCardProps) {
    const getIcon = (platform: string) => {
        switch (platform.toLowerCase()) {
            case 'whatsapp': return <Phone className="w-4 h-4 text-gray-600" />;
            case 'instagram': return <Instagram className="w-4 h-4 text-gray-600" />;
            case 'messenger': return <MessageCircle className="w-4 h-4 text-gray-600" />;
            default: return <Globe className="w-4 h-4 text-gray-600" />;
        }
    };

    return (
        <div className="bg-white rounded-lg p-4 border border-gray-200 h-full">
            <h3 className="text-lg font-bold  mb-6 text-center">مصدر التقييم</h3>
            <div className="space-y-5">
                {ratings?.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                        {/* Right: Text + Icon */}
                        <div className="flex items-center gap-2">
                            {getIcon(item.platform)}
                            <span className="text-sm font-bold  capitalize">{item.platform}</span>
                        </div>

                        {/* Left: Rating Badge */}
                        <div className="bg-blue-3 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 min-w-[50px] justify-center">
                            <Star className="w-3 h-3 fill-white" /> {item.average_rating}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

interface RatingClassificationCardProps {
    breakdown?: OverviewData['review_stars_breakdown'];
    totalReviews: number;
}

export function RatingClassificationCard({ breakdown, totalReviews }: RatingClassificationCardProps) {
    const starMap = [
        { label: "five_star", stars: 5 },
        { label: "four_star", stars: 4 },
        { label: "three_star", stars: 3 },
        { label: "two_star", stars: 2 },
        { label: "one_star", stars: 1 },
    ];

    return (
        <div className="bg-white rounded-lg p-4 border border-gray-200 h-full">
            <h3 className="text-lg font-bold  mb-6 text-center">تصنيف التقييم</h3>
            <div className="space-y-4">
                {starMap.map((item) => {
                    // Safe access with default 0
                    const count = breakdown ? (breakdown[item.label] || 0) : 0;
                    const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                    return (
                        <div key={item.stars} className="flex items-center gap-3">
                            {/* Right: Stars Label */}
                            <span className="text-xs text-gray-2 w-12 text-right font-medium flex items-center gap-1">
                                {item.stars} نجوم
                            </span>

                            {/* Middle: Bar */}
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-3 rounded-full transition-all duration-500"
                                    style={{ width: `${percent}%` }}
                                />
                            </div>

                            <span className="text-xs text-gray-2 w-14 text-left font-medium">{count} تقييم</span>
                            {/* Left: Count */}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

interface AverageRatingCardProps {
    average?: number;
    total?: number;
}

export function AverageRatingCard({ average = 0, total = 0 }: AverageRatingCardProps) {
    return (
        <div className="bg-white rounded-lg p-4 border border-gray-200 h-full flex flex-col items-center">
            <h3 className="text-lg font-bold  mb-6">متوسط تقييم العملاء</h3>

            <div className="w-20 h-20 rounded-full bg-blue-3 flex items-center justify-center text-white text-3xl font-bold mb-6 shadow-none">
                {average.toFixed(1)}
            </div>

            <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                        key={s}
                        className={cn(
                            "w-5 h-5",
                            s <= Math.round(average) ? "fill-[#FFD700] text-[#FFD700]" : "text-gray-300 fill-gray-100"
                        )}
                    />
                ))}
            </div>

            <p className=" font-medium text-gray-2">{total} تقييم</p>
        </div>
    );
}

export function PageHeader() {
    return (
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold ">الرئيسية</h1>
            <button className="flex items-center gap-2 px-4 py-2 border border-blue-3 text-blue-3 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm">
                <Download className="w-4 h-4" />
                تصدير التقرير
            </button>
        </div>
    );
}