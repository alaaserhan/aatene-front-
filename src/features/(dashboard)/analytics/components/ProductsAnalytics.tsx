// src/components/(admin)/analytics/ProductsAnalytics.tsx
"use client";

import { Loader2 } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useGetAnalyticsOverview } from "../hooks";

export function ProductsAnalytics() {
    const { data, isLoading } = useGetAnalyticsOverview();

    // تجهيز بيانات الشارت (أمس واليوم)
    const barChartData = [
        { name: "أمس", value: data?.totalProductsYesterday || 0 },
        { name: "اليوم", value: data?.totalProductsThisDay || 0 },
    ];

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg p-6 h-[320px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#3A5779]" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-6 h-[320px] flex flex-col ">

            {/* 1. Header: Title & Total Count */}
            <div className="flex flex-col mb-6">
                <span className="text-xs text-gray-2 font-medium mb-1">إحصائيات</span>
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium ">المنتجات</h3>
                    <span className="text-lg font-medium ">
                        ( {data?.totalProducts || 0} )
                    </span>
                </div>
            </div>

            {/* 2. Content Grid */}
            <div className="flex-1 flex flex-col">

                {/* Top Half */}
                <div className="flex flex-1 items-center pb-4 border-b border-gray-100">

                    {/* Top Right: Month Stats */}
                    <div className="w-1/2 flex flex-col gap-1 pl-4">
                        <span className="text-sm text-gray-2 font-medium">منتجات الشهر</span>
                        <span className="text-2xl font-medium text-[#3A5779]">
                            {data?.totalProductsThisMonth || 0} منتج
                        </span>
                        <div className="bg-gray-100/80 px-2 py-0.5 rounded-sm w-fit text-[11px] text-gray-2 mt-1">
                            الشهر الماضي <span className="font-medium">{data?.totalProductsLastMonth || 0}</span> منتج
                        </div>
                    </div>

                    {/* Top Left: Chart (Bar Chart for Products) */}
                    <div className="w-1/2 h-full flex flex-col justify-end pr-4 border-r border-transparent">
                        <div className="h-[80px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barChartData} barSize={20}>
                                    <XAxis dataKey="name" hide />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        formatter={(value: number) => [`العدد : ${value} `]}
                                        contentStyle={{ borderRadius: "8px", border: "none", fontSize: "12px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}
                                    />
                                    <Bar
                                        dataKey="value"
                                        fill="#3A5779"
                                        radius={[4, 4, 4, 4]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <span className="text-[10px] text-gray-2 text-center mt-2">منتجات الايام الماضية</span>
                    </div>

                </div>

                {/* Bottom Half */}
                <div className="flex flex-1 items-center py-2">

                    {/* Bottom Right: Today Stats */}
                    <div className="w-1/2 flex flex-col gap-1 pl-4">
                        <span className="text-sm text-gray-2 font-medium">منتجات اليوم</span>
                        <span className="text-2xl font-medium ">
                            {data?.totalProductsThisDay || 0} منتج
                        </span>
                        <div className="bg-gray-100/80 px-2 py-0.5 w-fit rounded-sm text-[11px] text-gray-2 mt-1">
                            منتجات الامس <span className="font-medium">{data?.totalProductsYesterday || 0}</span> منتج
                        </div>
                    </div>

                    {/* Bottom Left: All/Year Stats */}
                    <div className="w-1/2 flex flex-col gap-1 border-r border-transparent">
                        <span className="text-sm text-gray-2 font-medium">جميع المنتجات</span>
                        <span className="text-2xl font-medium ">
                            {data?.totalProducts || 0} منتج
                        </span>
                        <div className="bg-gray-100/80 px-2 py-0.5 rounded-sm w-fit text-[11px] text-gray-2 mt-1">
                            هذه السنة <span className="font-medium">{data?.totalProductsThisYear || 0}</span> منتج
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}