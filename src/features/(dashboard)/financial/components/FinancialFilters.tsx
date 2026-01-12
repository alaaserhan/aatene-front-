import { Search, Calendar, Filter, Share } from "lucide-react";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";

interface FinancialFiltersProps {
    dateRange: string;
    onDateRangeChange: (val: string) => void;
    transactionType: string;
    onTransactionTypeChange: (val: string) => void;
    searchQuery: string;
    onSearchQueryChange: (val: string) => void;
    onExport: () => void;
}

export function FinancialFilters({
    dateRange,
    onDateRangeChange,
    transactionType,
    onTransactionTypeChange,
    searchQuery,
    onSearchQueryChange,
    onExport,
}: FinancialFiltersProps) {

    const dateOptions = [
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

    const typeOptions = [
        { label: "الكل", value: "all" },
        { label: "شراء عملات", value: "purchase" }, // User bought coins (added to wallet)
        { label: "صرف عملات", value: "deduction" }, // User spent coins (on campaigns)
    ];

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-100 flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">

            {/* Filters Group */}
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <span className="text-sm text-gray-2 mb-1 block">رقم الحملة الاعلانية</span>
                    <div className="relative">
                        <Input
                            placeholder="بحث..."
                            value={searchQuery}
                            onChange={(e) => onSearchQueryChange(e.target.value)}
                            className="h-10 pe-10 bg-white border-gray-200"
                        />
                        <Search className="w-4 h-4 text-gray-2 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                {/* Transaction Type */}
                <div className="w-full md:w-48">
                    <span className="text-sm text-gray-2 mb-1 block">نوع المعاملة</span>
                    <ReusableDropdown
                        options={typeOptions}
                        value={transactionType}
                        onChange={onTransactionTypeChange}
                        placeholder="الكل"
                        className="h-10"
                    />
                </div>

                {/* Date Range */}
                <div className="w-full md:w-48">
                    <span className="text-sm text-gray-2 mb-1 block">تاريخ المعاملة</span>
                    <ReusableDropdown
                        options={dateOptions}
                        value={dateRange}
                        onChange={onDateRangeChange}
                        placeholder="اختر الفترة"
                        triggerIcon={<Calendar className="w-4 h-4 text-gray-2" />}
                        className="h-10"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                {/* <Button
                    variant="outline"
                    className="gap-2 h-10 border-gray-200 text-gray-2 hover:bg-gray-50 bg-white min-w-[100px]"
                    onClick={onExport}
                >
                    <Share className="w-4 h-4" />
                    <span>تصدير</span>
                </Button> */}

                <Button className="h-10 bg-blue-3 hover:bg-blue-4 text-white min-w-[100px] gap-2">
                    <Search className="w-4 h-4" />
                    <span>ابحث</span>
                </Button>
            </div>
        </div>
    );
}
