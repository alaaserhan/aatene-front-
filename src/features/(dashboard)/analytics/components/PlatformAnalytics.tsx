// src/components/(admin)/analytics/PlatformAnalytics.tsx
"use client";

import { useState, isValidElement } from "react";
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
    Users,
    Store,
    Package,
    CheckCircle,
    Megaphone,
    Calendar,
    ShoppingCart,
    LucideIcon,
    ListOrdered,
    ShoppingBag,
} from "lucide-react";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useGetAnalyticsContent } from "../hooks";

// 1. تعريف واجهة الخصائص للمكون الفرعي بدقة
interface StatCardProps {
    title: string;
    count: number | string;
    icon: LucideIcon | React.ReactNode;
    bgClass: string;
    iconClass: string;
    countClass: string;
}

// 2. تعريف المكون خارج الدالة الرئيسية
function StatCard({
    title,
    count,
    icon,
    bgClass,
    iconClass,
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
                    icon
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

export function PlatformAnalytics() {
    const [period, setPeriod] = useState("current_month");

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
    const { data, isLoading } = useGetAnalyticsContent(queryParams);

    const chartData =
        data?.storesGrowthChart?.map((item) => ({
            name: item.date,
            value: Number(item.count),
        })) || [];

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg p-6 min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-3" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-6 flex flex-col gap-8 h-full">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <Megaphone className="w-6 h-6" />
                    <h3 className="text-lg font-bold">إحصائيات المنصة</h3>
                </div>
                <div >
                    <ReusableDropdown
                        options={periodOptions}
                        value={period}
                        onChange={setPeriod}
                        placeholder="الفترة"
                        triggerIcon={<Calendar className="w-4 h-4 text-gray-2" />}
                        className="h-10 text-xs"
                    />
                </div>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
                {/* Total Merchants (Blue) */}
                <StatCard
                    title="إجمالي الخدمات"
                    count={data?.totalOrders || 0}
                    icon={ShoppingBag}
                    bgClass="bg-[#EAF5FF]"
                    iconClass="text-[#007AFF]"
                    countClass="text-[#007AFF]"
                />
                <StatCard
                    title="إجمالي التجار"
                    count={data?.totalMerchants || 0}
                    icon={Users}
                    bgClass="bg-blue-5"
                    iconClass="text-blue-4"
                    countClass="text-blue-4"
                />
                {/* Pending Stores (Red) */}
                <StatCard
                    title="متاجر تحتاج لموافقة"
                    count={data?.notActiveStores || 0}
                    icon={<img src="/icons/dashboard/store.svg" alt="" />}
                    bgClass="bg-[#FEF2F2]"
                    iconClass="text-[#EF4444]"
                    countClass="text-[#EF4444]"
                />


                {/* Total Products (Gray) */}
                <StatCard
                    title="إجمالي المنتجات"
                    count={data?.totalProducts || 0}
                    icon={Package}
                    bgClass="bg-[#F3F4F6]"
                    iconClass="text-[#4B5563]"
                    countClass="text-[#4B5563]"
                />

                {/* Total Stores (Green) */}
                <StatCard
                    title="إجمالي المتاجر"
                    count={data?.totalStores || 0}
                    icon={<img src="/icons/dashboard/store2.svg" alt="" />}
                    bgClass="bg-[#ECFDF5]"
                    iconClass="text-[#10B981]"
                    countClass="text-[#10B981]"
                />
                {/* Pending Products (Yellow) */}
                <StatCard
                    title="منتجات تحتاج لموافقة"
                    count={data?.notActiveProducts || 0}
                    icon={ShoppingCart}
                    bgClass="bg-[#FFFBEB]"
                    iconClass="text-[#F59E0B]"
                    countClass="text-[#F59E0B]"
                />
            </div>

            <div className="w-full h-[1px] bg-gray-100 mt-4" />

            {/* Chart */}
            <div className="min-h-[200px] lg:h-[300px] w-full mt-auto" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 0, left: -40, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3A5779" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3A5779" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f0f0f0"
                        />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#9CA3AF" }}
                            tickMargin={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#9CA3AF" }}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: "8px",
                                border: "none",
                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            name="عدد التجار"
                            stroke="#3A5779"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}