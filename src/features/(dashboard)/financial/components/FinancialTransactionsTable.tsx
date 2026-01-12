import { Loader2, ArrowDownLeft, Plus, CirclePlus, CircleMinus } from "lucide-react";
import { CoinTransaction } from "../../coins/api";
import { Pagination } from "@/src/components/ui/Pagination";
import { cn } from "@/src/lib/utils";

interface FinancialTransactionsTableProps {
    transactions: CoinTransaction[];
    isLoading: boolean;
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    onPageChange: (page: number) => void;
}

export function FinancialTransactionsTable({
    transactions,
    isLoading,
    currentPage,
    totalPages,
    totalRecords,
    onPageChange,
}: FinancialTransactionsTableProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] bg-white rounded-lg border border-gray-100">
                <Loader2 className="w-8 h-8 animate-spin text-[#3A5779]" />
            </div>
        );
    }

    if (transactions.length === 0) {
        return (
            <div className="flex flex-col min-h-[300px] items-center justify-center bg-white rounded-lg border border-gray-100">
                <p className="text-gray-2">لا توجد معاملات لعرضها</p>
            </div>
        );
    }

    const getTypeConfig = (type: string) => {
        switch (type) {
            case "purchase":
            case "deposit": // Assuming 'deposit' might be a type for "Added by admin"
                return {
                    label: "شراء عملات",
                    valueClass: "text-emerald-500",
                    badgeClass: "text-emerald-500 ",
                    icon: CirclePlus,
                    sign: "+"
                };
            case "deduction":
                return {
                    label: "صرف عملات",
                    valueClass: "text-red-500",
                    badgeClass: "text-red-500",
                    icon: CircleMinus,
                    sign: "-"
                };
            default: // Fallback
                return {
                    label: type,
                    valueClass: "text-gray-2",
                    badgeClass: "text-gray-2",
                    icon: Plus,
                    sign: ""
                };
        }
    };

    return (
        <div className="flex flex-col bg-white rounded-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-sm font-medium text-start w-16">#</th>
                            <th className="px-6 py-4 text-sm font-medium text-start">نوع العملية</th>
                            <th className="px-6 py-4 text-sm font-medium text-start">رقم الحملة</th>
                            <th className="px-6 py-4 text-sm font-medium text-start">التاريخ والوقت</th>
                            <th className="px-6 py-4 text-sm font-medium text-start">عدد العملات</th>
                            <th className="px-6 py-4 text-sm font-medium text-start w-1/3">وصف/ملاحظة</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {transactions.map((tx) => {
                            const config = getTypeConfig(tx.type);
                            const Icon = config.icon;

                            return (
                                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium ">
                                        #{tx.id}
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium", config.badgeClass)}>
                                            <Icon className="w-3.5 h-3.5" />
                                            {config.label}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-sm text-gray-2 font-medium">
                                        {/* Assuming description might contain campaign ID or it's a separate field not yet in interface, using placeholder logic */}
                                        {tx.description.includes("#") ? tx.description.match(/#\s?\w+\s?-\s?\d+/)?.[0] || "--" : "--"}
                                    </td>

                                    <td className="px-6 py-4 text-sm text-gray-2" dir="ltr">
                                        <span className="block text-right">{tx.created_at}</span>
                                    </td>

                                    <td className="px-6 py-4 text-sm font-bold" dir="ltr">
                                        <span className={cn("block text-right", config.valueClass)}>
                                            {tx.coins_amount} {config.sign}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-sm text-gray-2 max-w-xs truncate" title={tx.description}>
                                        {tx.description}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-2">
                        عرض {(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, totalRecords)} من {totalRecords} نتيجة
                    </span>
                    <Pagination
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </div>
    );
}
