// src/features/(dashboard)/analytics/components/merchants/MerchantFollowersAnalytics.tsx
"use client";

import { useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { Loader2, Calendar, Users } from "lucide-react";
import { useGetMerchantAnalyticsFollowers } from "../../hooks";

export function MerchantFollowersAnalytics() {
    const [period, setPeriod] = useState("current_week");

    const periodOptions = [
        { label: "الكل", value: "all_time" },
        { label: "اليوم الحالي", value: "current_day" },
        { label: "أمس", value: "last_day" },
        { label: "الأسبوع الحالي", value: "current_week" },
        { label: "الأسبوع الماضي", value: "last_week" },
        { label: "الشهر الحالي", value: "current_month" },
        { label: "الشهر الماضي", value: "last_month" },
        { label: "السنة الحالية", value: "current_year" },
        { label: "السنة الماضية", value: "last_year" },
    ];

    const queryParams = new URLSearchParams();
    if (period) {
        queryParams.set("period", period);
    }

    const { data, isLoading } = useGetMerchantAnalyticsFollowers(queryParams);

    // 1. حساب إجمالي المتابعين وأعلى قيمة للتقسيم
    const followerValues = data?.followers ? Object.values(data.followers).map(Number) : [];
    const totalFollowers = followerValues.reduce((sum, val) => sum + val, 0);
    const maxValue = Math.max(...followerValues, 0) || 10;

    // نقسم القيمة القصوى على 4 لنحدد حجم كل "درجة" لونية
    const step = Math.ceil(maxValue / 4);

    // 2. تحويل البيانات للرسم البياني المتراكم (Stacked)
    const dayMapping: Record<string, string> = {
        "Monday": "الاثنين",
        "Tuesday": "الثلاثاء",
        "Wednesday": "الأربعاء",
        "Thursday": "الخميس",
        "Friday": "الجمعة",
        "Saturday": "السبت",
        "Sunday": "الأحد",
        "Mon": "الاثنين",
        "Tue": "الثلاثاء",
        "Wed": "الأربعاء",
        "Thu": "الخميس",
        "Fri": "الجمعة",
        "Sat": "السبت",
        "Sun": "الأحد",
    };

    const chartData = data?.followers
        ? Object.entries(data.followers).map(([key, value]) => {
            const val = Number(value);
            const translatedName = dayMapping[key] || key;
            return {
                name: translatedName,
                total: val,
                part1: Math.min(val, step),
                part2: Math.max(0, Math.min(val - step, step)),
                part3: Math.max(0, Math.min(val - (step * 2), step)),
                part4: Math.max(0, val - (step * 3)),
            };
        })
        : [];

    // الألوان المتطابقة مع CustomersAnalytics
    const colors = {
        part2: "#C8D7E8", // blue-1
        part1: "#5B88BA33", // blue-4
        part4: "#38587A", // blue-2
        part3: "#406896", // blue-3
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg p-6 h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#38587A]" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-6 flex flex-col gap-4 h-full">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-2 font-medium mb-1">إحصائيات</span>
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-2" />
                        <h3 className="text-lg font-medium">المتابعين لك</h3>
                        <span className="text-lg font-medium">
                            ( {totalFollowers} )
                        </span>
                    </div>
                </div>
                <div>
                    <ReusableDropdown
                        options={periodOptions}
                        value={period}
                        onChange={setPeriod}
                        placeholder="الكل"
                        triggerIcon={<Calendar className="w-4 h-4 text-gray-2" />}
                        className="h-10 text-xs"
                    />
                </div>
            </div>

            {/* Chart */}
            <div className="flex-1 w-full mt-4" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barSize={32}>
                        <CartesianGrid
                            strokeDasharray="4 4"
                            vertical={false}
                            stroke="#F1F5F9"
                        />

                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: "#64748B" }}
                            dy={10}
                        />

                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: "#64748B" }}
                            dx={-10}
                        />

                        <Tooltip
                            cursor={{ fill: "transparent" }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white p-2 border border-gray-100 shadow-lg rounded-lg text-xs text-right">
                                            <p className="font-medium text-gray-700 mb-1">{payload[0].payload.name}</p>
                                            <p className="text-[#2D496A]">
                                                العدد: <span className="font-medium">{payload[0].payload.total}</span>
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />

                        {/* Stacked Bars - الترتيب مطابق لـ CustomersAnalytics */}
                        <Bar dataKey="part1" stackId="a" fill={colors.part1} radius={[0, 0, 0, 0]} />
                        <Bar dataKey="part2" stackId="a" fill={colors.part2} radius={[0, 0, 0, 0]} />
                        <Bar dataKey="part3" stackId="a" fill={colors.part3} radius={[0, 0, 0, 0]} />
                        <Bar dataKey="part4" stackId="a" fill={colors.part4} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}