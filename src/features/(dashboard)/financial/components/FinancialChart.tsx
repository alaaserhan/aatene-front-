import { useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Loader2, BarChart3 } from "lucide-react";
import { useGetCoinsGrowth } from "../../coins/hooks";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { cn } from "@/src/lib/utils";

interface FinancialChartProps {
    storeId?: number | string;
    className?: string;
}

export function FinancialChart({ storeId, className }: FinancialChartProps) {
    const [period, setPeriod] = useState("current_day");
    const { data: growthData, isLoading } = useGetCoinsGrowth(period, storeId);
    const chartData = growthData?.growth_chart?.map(item => ({
        ...item,
        gained_coins: Number(item.gained_coins),
        spent_coins: Number(item.spent_coins),
    })) || [];
    const periodOptions = [
        { label: "اليوم الحالي", value: "current_day" },
        { label: "أمس", value: "last_day" },
        { label: "الأسبوع الحالي", value: "current_week" },
        { label: "الأسبوع الماضي", value: "last_week" },
        { label: "الشهر الحالي", value: "current_month" },
        { label: "الشهر الماضي", value: "last_month" },
        { label: "السنة الحالية", value: "current_year" },
        { label: "السنة الماضية", value: "last_year" },
    ];
    const lines = [
        { key: "gained_coins", color: "#406896", name: "عملات مكتسبة" },
        { key: "spent_coins", color: "#EF4444", name: "عملات مصروفة" },
    ];
    return (
        <div className={cn("bg-white rounded-lg p-6 border border-gray-100 flex flex-col h-[500px]", className)}>
            <div className="flex items-center justify-between mb-6 shrink-0">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-blue-4" />
                    </div>
                    تحليل صرف العملات عبر الزمن
                </h3>
                <div className="w-44">
                    <ReusableDropdown options={periodOptions} value={period} onChange={setPeriod} placeholder="الفترة" className="h-10" />
                </div>
            </div>
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-4" />
                </div>
            ) : chartData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-2">لا توجد بيانات للعرض في هذه الفترة</div>
            ) : (
                <div className="flex-1 w-full min-h-0" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                            <defs>
                                {lines.map((line, i) => (
                                    <linearGradient key={i} id={`color-${line.key}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={line.color} stopOpacity={0.1} />
                                        <stop offset="95%" stopColor={line.color} stopOpacity={0} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9CA3AF" }} tickMargin={15} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9CA3AF" }} />
                            <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} labelStyle={{ color: "#374151", marginBottom: "0.25rem" }} />
                            {lines.map((line) => (
                                <Area key={line.key} type="monotone" dataKey={line.key} name={line.name} stroke={line.color} fill={`url(#color-${line.key})`} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 6, strokeWidth: 0 }} />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
            <div className="flex items-center justify-center gap-6 mt-4 shrink-0">
                {lines.map((line) => (
                    <div key={line.key} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: line.color }} />
                        <span className="text-xs text-gray-2 font-medium">{line.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
