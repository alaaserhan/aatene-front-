// src/components/(admin)/analytics/StoresAnalytics.tsx
"use client";

import { Loader2 } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { useGetAnalyticsOverview } from "../hooks";

export function StoresAnalytics() {
    const { data, isLoading } = useGetAnalyticsOverview();

    // تجهيز بيانات الشارت بناءً على المتاح (أمس واليوم)
    const lineChartData = [
        { name: "أمس", value: data?.totalStoresYesterday || 0 },
        { name: "اليوم", value: data?.totalStoresThisDay || 0 },
    ];

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg p-6 h-[300px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#3A5779]" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-6 h-[320px] flex flex-col">

            {/* 1. Header: Title & Total Count */}
            <div className="flex flex-col mb-6">
                <span className="text-xs text-gray-2 font-medium mb-1">إحصائيات</span>
                <div className="flex items-center gap-2 ">
                    <h3 className="text-lg font-medium ">المتاجر</h3>
                    <span className="text-lg font-medium ">
                        ( {data?.totalStores || 0} )
                    </span>
                </div>
            </div>

            {/* 2. Content Grid */}
            <div className="flex-1 flex flex-col">

                {/* Top Half */}
                <div className="flex flex-1 items-center pb-4 border-b border-gray-100">
                    {/* Top Right: Month Stats */}
                    <div className="w-1/2 flex flex-col  gap-1 pl-4">
                        <span className=" text-gray-2 font-medium">متاجر الشهر</span>
                        <span className="text-2xl font-medium text-[#3A5779] ">
                            {data?.totalStoresThisMonth || 0} متجر
                        </span>
                        <div className="bg-gray-100/80 px-2 py-0.5 rounded-xs text-[11px] w-fit text-gray-500 mt-1">
                            الشهر الماضي <span className="font-medium">{data?.totalStoresLastMonth || 0}</span> متجر
                        </div>
                    </div>

                    {/* Top Left: Chart */}
                    <div className="w-1/2 h-full flex flex-col justify-end pr-4 border-r border-transparent">
                        <div className="h-[80px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={lineChartData}>
                                    <Tooltip
                                        contentStyle={{ borderRadius: "8px", border: "none", fontSize: "12px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}
                                        cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
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
                        <span className="text-[10px] text-gray-2 text-center mt-2">متاجر الايام الماضية</span>
                    </div>



                </div>

                {/* Bottom Half */}
                <div className="flex flex-1 items-center py-2">

                    {/* Bottom Right: Today Stats */}
                    <div className="w-1/2 flex flex-col gap-1 pl-4">
                        <span className="text-sm text-gray-2 font-medium">متاجر اليوم</span>
                        <span className="text-2xl font-medium  ">
                            {data?.totalStoresThisDay || 0} متجر
                        </span>
                        <div className="bg-gray-100/80 px-2 py-0.5 w-fit rounded-xs text-[11px] text-gray-500 mt-1">
                            متاجر الامس <span className="font-medium">{data?.totalStoresYesterday || 0}</span> متجر
                        </div>
                    </div>

                    {/* Bottom Left: All/Year Stats */}
                    <div className="w-1/2 flex flex-col  gap-1 border-r border-transparent">
                        <span className="text-sm text-gray-2 font-medium">جميع المتاجر</span>
                        <span className="text-2xl font-medium  ">
                            {data?.totalStores || 0} متجر
                        </span>
                        <div className="bg-gray-100/80 px-2 py-0.5 rounded-xs w-fit text-[11px] text-gray-500 mt-1">
                            هذه السنة <span className="font-medium">{data?.totalStoresThisYear || 0}</span> متجر
                        </div>
                    </div>



                </div>

            </div>
        </div>
    );
}