import { LucideIcon, ArrowUpRight, ArrowDownLeft, HandCoins } from "lucide-react";
import { useGetCoinsGeneral } from "../../coins/hooks";
import { Skeleton } from "@/src/components/ui/skeleton";

interface StatCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    variant: "blue" | "red" | "green";
    isLoading?: boolean;
}

function StatCard({ title, value, icon: Icon, variant, isLoading }: StatCardProps) {
    const variants = {
        blue: { bg: "bg-blue-4", text: "text-blue-4", iconBg: "bg-blue-1", iconColor: "text-blue-4" },
        red: { bg: "bg-red-50", text: "text-red-600", iconBg: "bg-red-100", iconColor: "text-red-600" },
        green: { bg: "bg-green-50", text: "text-emerald-600", iconBg: "bg-green-100", iconColor: "text-green-600" },
    };
    const style = variants[variant];
    return (
        <div className={`p-6 rounded-lg bg-white border border-gray-100 flex items-center gap-4 `}>
            <div className={`w-12 h-12 rounded-lg ${style.iconBg} flex items-center justify-center`}>
                <Icon className={`w-7 h-7 ${style.iconColor}`} />
            </div>
            <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-2">{title}</span>
                {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                ) : (
                    <div className="flex items-center gap-1">
                        <span className={`text-2xl font-bold ${style.text}`}>{value}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export function FinancialStatsCards({ storeId }: { storeId?: number | string }) {
    const { data: generalData, isLoading } = useGetCoinsGeneral(storeId);
    const stats = generalData || { total_bought_coins: 0, total_spent_coins: 0, current_balance: 0 };
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="مجموع العملات التي تم شراؤها" value={stats.total_bought_coins || 0} icon={ArrowDownLeft} variant="green" isLoading={isLoading} />
            <StatCard title="مجموع العملات المصروفة" value={stats.total_spent_coins || 0} icon={ArrowUpRight} variant="red" isLoading={isLoading} />
            <StatCard title="الرصيد المتبقي" value={stats.current_balance || 0} icon={HandCoins} variant="blue" isLoading={isLoading} />
        </div>
    );
}
