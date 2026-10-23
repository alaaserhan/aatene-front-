"use client";

import { X } from "lucide-react";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetTitle,
} from "@/src/components/ui/sheet";
import SearchFilters from "./SearchFilters";
import type { SearchFilterOptions } from "../hooks";
import type { FilterState, SearchType } from "../types";

interface MobileFilterSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: SearchType;
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    options: SearchFilterOptions;
}

/** Full-screen filter panel for small screens; filters apply as they change. */
export default function MobileFilterSheet({
    open,
    onOpenChange,
    type,
    filters,
    onFilterChange,
    options,
}: MobileFilterSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                showCloseButton={false}
                className="inset-0 h-full w-full gap-0 overflow-y-auto border-0 bg-white p-0 sm:max-w-none lg:hidden"
                dir="rtl"
            >
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white p-4">
                    <SheetTitle className="text-xl font-bold text-c2-navy-900">فلتر</SheetTitle>
                    <SheetDescription className="sr-only">اختر ما يناسبك لتضييق نتائج البحث</SheetDescription>
                    <SheetClose className="cursor-pointer rounded-full p-2 transition-colors hover:bg-gray-100" aria-label="إغلاق">
                        <X className="h-6 w-6 text-gray-600" />
                    </SheetClose>
                </div>

                <div className="p-4">
                    <SearchFilters
                        type={type}
                        filters={filters}
                        onFilterChange={onFilterChange}
                        options={options}
                        className="border-0 p-0"
                    />
                </div>

                <div className="sticky bottom-0 flex flex-col gap-3 border-t border-gray-100 bg-white p-4">
                    <SheetClose className="w-full cursor-pointer rounded-xl bg-c2-navy-600 py-3.5 font-medium text-white transition-colors hover:bg-c2-navy-700">
                        عرض النتائج
                    </SheetClose>
                    <button
                        type="button"
                        onClick={() => onFilterChange({})}
                        className="w-full cursor-pointer py-2 text-sm font-medium text-c2-navy-600 hover:underline"
                    >
                        إعادة
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
