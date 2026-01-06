// src/features/(dashboard)/analytics/components/merchants/MerchantProfileViews.tsx
"use client";

import { Loader2, Eye } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { useGetMerchantAnalyticsOverview } from "../../hooks";

export function MerchantProfileViews() {
    const { data, isLoading } = useGetMerchantAnalyticsOverview();

    // تجهيز بيانات الشارت (أمس واليوم) لتطابق نمط StoresAnalytics
    const lineChartData = [
        { name: "أمس", value: data?.yesterday_views || 0 },
        { name: "اليوم", value: data?.current_day_views || 0 },
    ];

    // تنسيق الأرقام الكبيرة
    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg p-6 h-[320px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#3A5779]" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-6 h-[320px] flex flex-col">

            {/* 1. Header: Title & Total Count */}
            <div className="flex flex-col mb-6">
                <span className="text-xs text-gray-2 font-medium mb-1">إحصائيات</span>
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium ">مشاهدة الملف الشخصي</h3>
                    <span className="text-lg font-medium ">
                        ( {formatNumber(data?.all_time_views || 0)} )
                    </span>
                </div>
            </div>

            {/* 2. Content Grid */}
            <div className="flex-1 flex flex-col">

                {/* Top Half */}
                <div className="flex flex-1 items-center pb-4 border-b border-gray-100">
                    
                    {/* Top Right: Month Stats */}
                    <div className="w-1/2 flex flex-col gap-1 pl-4">
                        <span className="text-sm text-gray-2 font-medium">مشاهدات الشهر</span>
                        <span className="text-2xl font-medium text-[#3A5779]">
                            {data?.current_month_views || 0} مشاهدة
                        </span>
                        <div className="bg-gray-100/80 px-2 py-0.5 rounded-sm w-fit text-[11px] text-gray-500 mt-1">
                            الشهر الماضي <span className="font-medium">{data?.last_month_views || 0}</span> مشاهدة
                        </div>
                    </div>

                    {/* Top Left: Chart */}
                    <div className="w-1/2 h-full flex flex-col justify-end pr-4 border-r border-transparent">
                        <div className="h-[80px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={lineChartData}>
                                    <Tooltip
                                        contentStyle={{ 
                                            borderRadius: "8px", 
                                            border: "none", 
                                            fontSize: "12px", 
                                            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                                            textAlign: "right"
                                        }}
                                        cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                                        formatter={(value: number) => [`${value} مشاهدة`, ""]}
                                    />
                                    <Line
                                        type="linear"
                                        dataKey="value"
                                        stroke="#3A5779"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: "#3A5779", strokeWidth: 2, stroke: "#fff" }}
                                        activeDot={{ r: 6, fill: "#3A5779" }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <span className="text-[10px] text-gray-2 text-center mt-2">مشاهدات الايام الماضية</span>
                    </div>

                </div>

                {/* Bottom Half */}
                <div className="flex flex-1 items-center py-2">

                    {/* Bottom Right: Today Stats */}
                    <div className="w-1/2 flex flex-col gap-1 pl-4">
                        <span className="text-sm text-gray-2 font-medium">مشاهدات اليوم</span>
                        <span className="text-2xl font-medium ">
                            {data?.current_day_views || 0} مشاهدة
                        </span>
                        <div className="bg-gray-100/80 px-2 py-0.5 w-fit rounded-sm text-[11px] text-gray-500 mt-1">
                            مشاهدات الامس <span className="font-medium">{data?.yesterday_views || 0}</span> مشاهدة
                        </div>
                    </div>

                    {/* Bottom Left: All/Year Stats */}
                    <div className="w-1/2 flex flex-col gap-1 border-r border-transparent">
                        <span className="text-sm text-gray-2 font-medium">جميع المشاهدات</span>
                        <span className="text-2xl font-medium ">
                            {formatNumber(data?.all_time_views || 0)} مشاهدة
                        </span>
                        <div className="bg-gray-100/80 px-2 py-0.5 rounded-sm w-fit text-[11px] text-gray-500 mt-1">
                            هذه السنة <span className="font-medium">{formatNumber(data?.current_year_views || 0)}</span> مشاهدة
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}