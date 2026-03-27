// src/features/(dashboard)/home/components/DashboardComponents.tsx
"use client";

import { cn } from "@/src/lib/utils";
import { Star, Phone, Instagram, Facebook, Globe, Download, MessageSquare, MessageCircle, Database } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { OverviewData } from "../../api";

// --- 1. Stat Card ---
interface StatCardProps {
    title: string;
    value: string | number;
    icon: string;
    trend?: string;
    iconColor?: string;
    iconBg?: string;
}

export function StatCard({ title, value, icon, trend, iconColor, iconBg }: StatCardProps) {
    return (
        <div className="bg-white rounded-md p-4 border border-gray-200 flex flex-col justify-between h-[120px]">
            <div className="flex justify-center items-start">
                {/* Right Side: Icon & Title */}
                <div className="flex items-center justify-center gap-3">
                    <div className={cn("p-2 rounded-full", iconBg)}>
                        <img src={`/icons/dashboard/${icon}.svg`} className="w-5 h-5" alt="" />
                    </div>
                    <span className="text-gray-2 text-sm font-medium">{title}</span>
                </div>
            </div>

            {/* Center Bottom: Value */}
            <div className="text-3xl font-bold text-center">{value}</div>
        </div>
    );
}

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    // ضربنا في 0.6 عشان النص يكون في نص الشريحة بالظبط مش على الطرف
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent === 0) return null;

    return (
        <text
            x={x}
            y={y}
            fill="white" // الأفضل أبيض للخلفيات الغامقة (الأزرق والبرتقالي)
            textAnchor="middle" // تعديل مهم: توسيط النص
            dominantBaseline="central"
            className="text-lg font-bold drop-shadow-md" // إضافة ظل لتحسين القراءة
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

// --- 2. Chart Card ---
interface SessionsChartCardProps {
    data?: OverviewData['conversation_types'];
}
export function SessionsChartCard({ data }: SessionsChartCardProps) {
    const needsHuman = data?.needs_human_true || 0;
    const botReply = data?.needs_human_false || 0;

    const chartData = [
        { name: "يحتاج الي موظف", value: needsHuman, color: "#E8E8E8" },
        { name: "البوت يرد", value: botReply, color: "#4D79A8" },
    ];

    return (
        <div className="bg-white rounded-md p-4 border border-gray-200 h-full flex flex-col">
            <div className="flex flex-col items-start mb-4">
                <h3 className="text-xl font-medium ">جلسات الشات بوت</h3>
                <p className="text-xs text-gray-2 mt-1">توزيع أنواع الجلسات</p>
            </div>

            <div className="flex-1 min-h-[180px] sm:min-h-[200px] relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius="80%"
                            fill="#8884d8"
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
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
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 mt-4 sm:mt-6 rounded-md p-3 sm:p-4 border-t border-gray-50 bg-[#F9F9F9]">
                {chartData.map((item) => (
                    <div key={item.name} className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-xs" style={{ backgroundColor: item.color }} />
                            <span className="text-[10px] sm:text-xs text-gray-2 font-medium">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold">{item.value}</span>
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
            case 'whatsapp': return { name: 'الواتساب', icon: <img src="/icons/dashboard/whatsapp2.svg" className="w-5 h-5" alt="" /> };
            case 'instagram': return { name: 'الانستجرام', icon: <img src="/icons/dashboard/instagram2.svg" className="w-4 h-4" alt="" /> };
            case 'website': return { name: 'الموقع', icon: <img src="/logo-sm.svg" className="w-4 h-4" alt="" /> };
            case 'mobile': return { name: 'الموبايل', icon: <img src="/logo-sm.svg" className="w-4 h-4" alt="" /> };
            default: return { name: platformName, icon: <Globe className="w-4 h-4 text-gray-2" />, color: 'text-gray-2' };
        }
    };

    const topPlatformName = getPlatformDetails(maxPlatform.platform).name;

    return (
        <div className="bg-white rounded-md p-4 border border-gray-200 h-full flex flex-col">
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

            <div className="space-y-2 flex-1">
                {usersPerPlatform?.map((item, index) => {
                    const details = getPlatformDetails(item.platform);
                    return (
                        <div key={index} className="flex items-center justify-between p-2 pb-3 border-b border-gray-100 last:border-0">
                            {/* Right Side: Icon + Name */}
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-sm flex items-center justify-center bg-transparent border border-blue-1">
                                    {details.icon}
                                </div>
                                <span className="text-sm text-gray-2 font-bold">{details.name}</span>
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

    // دالة مساعدة لترجمة الأسماء وتحديد الأيقونات
    const getPlatformDetails = (platform: string) => {
        switch (platform.toLowerCase()) {
            case 'whatsapp':
                return { name: "واتساب", icon: <img src="/icons/dashboard/whatsapp3.svg" className="w-6 h-6" alt="" /> };
            case 'instagram':
                return { name: "انستجرام", icon: <img src="/icons/dashboard/instagram.svg" className="w-6 h-6" alt="" /> };
            case 'messenger':
            case 'facebook':
                return { name: "فيسبوك", icon: <img src="/icons/dashboard/facebook3.svg" className="w-6 h-6" alt="" /> };
            default: // Aatene / Website
                return {
                    name: "أعطيني",
                    icon: <div className="w-5 h-5 rounded-full border border-gray-2 flex items-center justify-center text-[10px] font-bold text-gray-2">A</div>
                };
        }
    };

    return (
        <div className="bg-white rounded-md p-4 border border-gray-200 h-full ">
            <div className="flex items-center justify-center gap-2 mb-6">
                <h3 className="text-xl font-medium">مصدر التقييم</h3>
            </div>

            <div className="space-y-3">
                {ratings?.map((item, i) => {
                    const details = getPlatformDetails(item.platform);

                    return (
                        <div
                            key={i}
                            className="flex items-center justify-between pb-3 border-b border-gray-100 last:border-0 last:pb-0"
                        >
                            {/* Right: Text + Icon */}
                            <div className="flex items-center gap-2">
                                <div className="">
                                    {details.icon}
                                </div>
                                <span className="text-sm font-medium ">{details.name}</span>
                            </div>

                            {/* Left: Rating Badge */}
                            <div className="bg-blue-3 text-white text-sm font-medium px-1 py-1 rounded-sm flex items-center gap-1.5 min-w-[60px] justify-center shadow-sm">
                                <p className="pt-1">{item.average_rating}</p>
                                <img src="/icons/dashboard/Star.svg" className="w-4 h-4" alt="" />
                            </div>
                        </div>
                    );
                })}
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
        <div className="bg-white rounded-md p-4 border border-gray-200 h-full">
            <h3 className="text-xl font-medium  mb-6 text-center">تصنيف التقييم</h3>
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
        <div className="bg-white rounded-md p-4 border border-gray-200 h-full flex flex-col items-center">
            <h3 className="text-xl font-medium  mb-5">متوسط تقييم العملاء</h3>

            <div className="w-20 pt-1 h-20 rounded-full bg-blue-3 flex items-center justify-center text-white text-3xl font-bold mb-5 shadow-none">
                {average.toFixed(1)}
            </div>

            <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                        key={s}
                        className={cn(
                            "w-5 h-5",
                            s <= Math.round(average) ? "fill-[#FFD700] text-[#FFD700]" : "text-[#CECDC8] fill-[#CECDC8]"
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
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl lg:text-2xl font-semibold">الرئيسية</h1>
        </div>
    );
}