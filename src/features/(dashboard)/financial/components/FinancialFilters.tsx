import { Search, Calendar } from "lucide-react";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { Input } from "@/src/components/ui/input";

interface FinancialFiltersProps {
    dateRange: string;
    onDateRangeChange: (val: string) => void;
    transactionType: string;
    onTransactionTypeChange: (val: string) => void;
    searchQuery: string;
    onSearchQueryChange: (val: string) => void;
    onExport: () => void;
    isLoading?: boolean;
}


export function FinancialFilters({
    dateRange,
    onDateRangeChange,
    transactionType,
    onTransactionTypeChange,
    searchQuery,
    onSearchQueryChange,
    // onExport,
    isLoading,
}: FinancialFiltersProps) {

    const dateOptions = [
        { label: "اليوم الحالي", value: "current_day" },
        { label: "أمس", value: "last_day" },
        { label: "الأسبوع الحالي", value: "current_week" },
        { label: "الأسبوع الماضي", value: "last_week" },
        { label: "الشهر الحالي", value: "current_month" },
        { label: "الشهر الماضي", value: "last_month" },
        { label: "السنة الحالية", value: "current_year" },
        { label: "السنة الماضية", value: "last_year" },
    ];

    const typeOptions = [
        { label: "شراء عملات", value: "purchase" }, // User bought coins (added to wallet)
        { label: "صرف عملات", value: "deduction" }, // User spent coins (on campaigns)
    ];

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-100 w-full">

            {/* Filters Group - 3 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">

                {/* Search */}
                <div className="relative w-full">
                    <span className="text-sm text-gray-2 mb-1 block">رقم الحملة الاعلانية</span>
                    <div className="relative">
                        <Input
                            placeholder="بحث..."
                            value={searchQuery}
                            onChange={(e) => onSearchQueryChange(e.target.value)}
                            className="h-10 pe-10 bg-white border-gray-200"
                            disabled={isLoading}
                        />
                        <Search className="w-4 h-4 text-gray-2 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                {/* Transaction Type */}
                <div className="w-full">
                    <span className="text-sm text-gray-2 mb-1 block">نوع المعاملة</span>
                    <ReusableDropdown
                        options={typeOptions}
                        value={transactionType}
                        onChange={onTransactionTypeChange}
                        placeholder="الكل"
                        className={`h-10 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                    />
                </div>

                {/* Date Range */}
                <div className="w-full">
                    <span className="text-sm text-gray-2 mb-1 block">تاريخ المعاملة</span>
                    <ReusableDropdown
                        options={dateOptions}
                        value={dateRange}
                        onChange={onDateRangeChange}
                        placeholder="اختر الفترة"
                        triggerIcon={<Calendar className="w-4 h-4 text-gray-2" />}
                        className={`h-10 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                    />
                </div>
            </div>
        </div>
    );
}
