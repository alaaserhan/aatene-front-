// src/components/(merchant)/analytics/MerchantContentAnalytics.tsx
"use client";

import { useState, ReactNode, isValidElement, cloneElement, ReactElement } from "react";
import Cookies from "js-cookie";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import {
    Package,
    Heart,
    MessageCircle,
    Wrench,
    GitCompare,
    CheckCircle,
    Calendar,
    Megaphone,
    LucideIcon,
} from "lucide-react";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useGetMerchantAnalyticsContent } from "../../hooks";

// Stat Card Component
interface StatCardProps {
    title: string;
    count: number | string;
    icon: ReactNode | LucideIcon;
    bgClass: string;
    iconClass?: string;
    countClass: string;
}

function StatCard({
    title,
    count,
    icon,
    bgClass,
    iconClass="",
    countClass,
}: StatCardProps) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-lg bg-white border border-transparent hover:border-gray-100 transition-colors">
            <div
                className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center",
                    bgClass
                )}
            >
                {isValidElement(icon) ? (
                    cloneElement(icon as ReactElement, {
                        className: cn("w-6 h-6", iconClass),
                    })
                ) : (
                    (() => {
                        const Icon = icon as LucideIcon;
                        return <Icon className={cn("w-6 h-6", iconClass)} />;
                    })()
                )}
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold">{title}</span>
                <span className={cn("text-lg font-medium", countClass)}>{count}</span>
            </div>
        </div>
    );
}

export function MerchantContentAnalytics() {
    const [period, setPeriod] = useState("current_month");

    const storeType = Cookies.get("store_type");
    const isServiceStore = storeType === "services";

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

    const queryParams = new URLSearchParams({ period });
    const { data, isLoading } = useGetMerchantAnalyticsContent(queryParams);

    // Prepare chart data
    const chartData = isServiceStore
        ? data?.servicesGrowthChart?.map((item) => ({
            name: item.date,
            value: Number(item.total_count || 0),
        })) || []
        : data?.productsGrowthChart?.map((item) => ({
            name: item.date,
            value: Number(item.count || 0),
        })) || [];

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg p-6 min-h-[550px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#3A5779]" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-6 flex flex-col gap-6 h-full ">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Megaphone className="w-6 h-6" />
                    <h3 className="text-lg font-bold ">تحليل المحتوى</h3>
                </div>
                <div >
                    <ReusableDropdown
                        options={periodOptions}
                        value={period}
                        onChange={setPeriod}
                        placeholder="الفترة"
                        triggerIcon={<Calendar className="w-4 h-4 text-gray-2" />}
                        className="h-9 text-xs"
                    />
                </div>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                {/* 1. Total Items */}
                <StatCard
                    title={isServiceStore ? "إجمالي الخدمات" : "إجمالي المنتجات"}
                    count={isServiceStore ? (data?.totalServices || 0) : (data?.totalProducts || 0)}
                    icon={isServiceStore ? <img src={"/icons/dashboard/nav_services.svg"} /> : <img src={"/icons/dashboard/nav_products.svg"} />}
                    bgClass={"bg-blue-5"}
                    countClass={"text-blue-4"}
                />

                {!isServiceStore && (
                    <StatCard
                        title="الاضافة للمفضلة"
                        count={data?.favoriteProducts || 0}
                        icon={<img src={"/icons/dashboard/heart.svg"} />}
                        bgClass="bg-[#1FC16B1A]"
                        countClass={"text-[#1FC16B]"}
                    />
                )}
                {isServiceStore && (
                    <StatCard
                        title="الاضافة للمفضلة"
                        count={data?.favoriteServices || 0}
                        icon={<img src={"/icons/dashboard/heart.svg"} />}
                        bgClass="bg-[#1FC16B1A]"
                        iconClass={"text-[#F59E0B]"}
                        countClass={"text-[#1FC16B]"}
                    />)}

                <StatCard
                    title="الدردشات"
                    count={data?.converSation || 0}
                    icon={<img src={"/icons/dashboard/chat2.svg"} />}
                    bgClass="bg-[#F3F4F6]"
                    iconClass="text-[#4B5563]"
                    countClass="text-[#4B5563]"
                />



            </div>

            {/* Chart Section */}
            <div className="flex flex-col gap-4 mt-6 flex-1">
                <h4 className="text-sm font-medium text-gray-700 px-2">
                    {isServiceStore ? "نمو الخدمات" : "نمو المنتجات"}
                </h4>
                <div className="h-[250px] w-full dir-ltr">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -40, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3A5779" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#3A5779" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                                tickMargin={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: "8px",
                                    border: "none",
                                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                }}
                                labelStyle={{ textAlign: "right", marginBottom: "5px", color: "#6B7280" }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                name={isServiceStore ? "الخدمات" : "المنتجات"}
                                stroke="#3A5779"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorValue)"
                                dot={{ r: 4, fill: "#3A5779", strokeWidth: 2, stroke: "#fff" }}
                                activeDot={{ r: 6, fill: "#3A5779" }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}