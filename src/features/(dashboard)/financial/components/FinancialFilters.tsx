import { useState } from "react";
import { Search, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/src/components/ui/popover";
import { Calendar } from "@/src/components/ui/calendar";
import { cn } from "@/src/lib/utils";

interface FinancialFiltersProps {
    createdAtFrom: string;
    onCreatedAtFromChange: (val: string) => void;
    createdAtTo: string;
    onCreatedAtToChange: (val: string) => void;
    transactionType: string;
    onTransactionTypeChange: (val: string) => void;
    searchQuery: string;
    onSearchQueryChange: (val: string) => void;
    isLoading?: boolean;
}


export function FinancialFilters({
    createdAtFrom,
    onCreatedAtFromChange,
    createdAtTo,
    onCreatedAtToChange,
    transactionType,
    onTransactionTypeChange,
    searchQuery,
    onSearchQueryChange,
    isLoading,
}: FinancialFiltersProps) {
    const [dateFrom, setDateFrom] = useState<Date | undefined>(
        createdAtFrom ? new Date(createdAtFrom) : undefined
    );
    const [dateTo, setDateTo] = useState<Date | undefined>(
        createdAtTo ? new Date(createdAtTo) : undefined
    );

    const handleDateFromChange = (date: Date | undefined) => {
        setDateFrom(date);
        if (date) {
            onCreatedAtFromChange(format(date, "yyyy-MM-dd"));
        } else {
            onCreatedAtFromChange("");
        }
    };

    const handleDateToChange = (date: Date | undefined) => {
        setDateTo(date);
        if (date) {
            onCreatedAtToChange(format(date, "yyyy-MM-dd"));
        } else {
            onCreatedAtToChange("");
        }
    };

    const typeOptions = [
        { label: "شراء عملات", value: "purchase" },
        { label: "صرف عملات", value: "deduction" },
    ];

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-100 w-full">

            {/* Filters Group - 4 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">

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

                {/* Date From */}
                <div className="w-full">
                    <span className="text-sm text-gray-2 mb-1 block">تاريخ من</span>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full h-10 border-gray-200 bg-white hover:bg-gray-50 flex justify-between rounded-sm shadow-none",
                                    !dateFrom && "text-muted-foreground",
                                    isLoading && "opacity-50 pointer-events-none"
                                )}
                            >
                                {dateFrom ? (
                                    <span className="text-sm font-medium">
                                        {format(dateFrom, "PPP", { locale: arSA })}
                                    </span>
                                ) : (
                                    <span>اختر التاريخ</span>
                                )}
                                <CalendarIcon className="ml-2 h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={dateFrom}
                                onSelect={handleDateFromChange}
                                initialFocus
                                locale={arSA}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Date To */}
                <div className="w-full">
                    <span className="text-sm text-gray-2 mb-1 block">تاريخ الى</span>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full h-10 border-gray-200 bg-white hover:bg-gray-50 flex justify-between rounded-sm shadow-none",
                                    !dateTo && "text-muted-foreground",
                                    isLoading && "opacity-50 pointer-events-none"
                                )}
                            >
                                {dateTo ? (
                                    <span className="text-sm font-medium">
                                        {format(dateTo, "PPP", { locale: arSA })}
                                    </span>
                                ) : (
                                    <span>اختر التاريخ</span>
                                )}
                                <CalendarIcon className="ml-2 h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={dateTo}
                                onSelect={handleDateToChange}
                                initialFocus
                                locale={arSA}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
    );
}
