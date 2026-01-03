// src/components/(admin)/analytics/CustomersAnalytics.tsx
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
import { Loader2, Calendar } from "lucide-react";
import { useGetAnalyticsCustomers } from "../hooks";

export function CustomersAnalytics() {
    const [period, setPeriod] = useState("last_year");

    const periodOptions = [
        // { label: "الكل", value: "" },
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

    const { data, isLoading } = useGetAnalyticsCustomers(queryParams);

    // 1. حساب أعلى قيمة (Max Value) لجعل التقسيم ديناميكياً
    const customerValues = data?.customers ? Object.values(data.customers).map(Number) : [];
    const maxValue = Math.max(...customerValues, 0) || 10; // Default 10 if empty to avoid div by zero

    // نقسم القيمة القصوى على 4 لنحدد حجم كل "درجة" لونية
    const step = Math.ceil(maxValue / 4);

    // 2. تحويل البيانات ديناميكياً
    const chartData = data?.customers
        ? Object.entries(data.customers).map(([key, value]) => {
            const val = Number(value);
            return {
                name: key,
                total: val,
                // الطبقة الأولى (القاعدة)
                part1: Math.min(val, step),
                // الطبقة الثانية
                part2: Math.max(0, Math.min(val - step, step)),
                // الطبقة الثالثة
                part3: Math.max(0, Math.min(val - (step * 2), step)),
                // الطبقة الرابعة (القمة)
                part4: Math.max(0, val - (step * 3)),
            };
        })
        : [];

    // الألوان المطلوبة (من الفاتح للداكن)
    const colors = {
        part2: "#C8D7E8", // blue-1 (القاعدة - الأفتح)
        part1: "#5B88BA33", // blue-4
        part4: "#38587A", // blue-2
        part3: "#406896", // blue-3 (القمة - الأغمق)
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg p-6 h-[350px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#38587A]" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-6 flex flex-col gap-4 h-[350px]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">

                <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-medium mb-1">إحصائيات</span>
                    <div className="flex items-center gap-2 ">
                        <h3 className="text-lg font-medium ">العملاء</h3>
                        <span className="text-lg font-medium ">
                            ( {data?.totalCustomers || 0} )
                        </span>
                    </div>
                </div>
                <div >
                    <ReusableDropdown
                        options={periodOptions}
                        value={period}
                        onChange={setPeriod}
                        placeholder="الكل"
                        triggerIcon={<Calendar className="w-4 h-4 text-gray-500" />}
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

                        {/* Stacked Bars - الترتيب من الأسفل للأعلى (من الأفتح للأغمق) */}

                        {/* Base Layer: Blue-1 */}
                        <Bar dataKey="part1" stackId="a" fill={colors.part1} radius={[0, 0, 0, 0]} />

                        {/* Layer 2: Blue-4 (Medium) */}
                        <Bar dataKey="part2" stackId="a" fill={colors.part2} radius={[0, 0, 0, 0]} />

                        {/* Layer 3: Blue-2 (Dark) */}
                        <Bar dataKey="part3" stackId="a" fill={colors.part3} radius={[0, 0, 0, 0]} />

                        {/* Top Layer: Blue-3 (Darkest) */}
                        <Bar dataKey="part4" stackId="a" fill={colors.part4} radius={[4, 4, 0, 0]} />

                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}