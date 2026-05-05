"use client";

import { X } from "lucide-react";
import SearchFilters, { SearchType, FilterState } from "./SearchFilters";
import { Category, City, Tag, PriceRange } from "@/src/features/(web)/searchAndFilter/api";

interface MobileFilterDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    type: SearchType;
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    onApply: () => void;
    categories?: Category[];
    cities?: City[];
    tags?: Tag[];
    priceRange?: PriceRange;
}

export default function MobileFilterDrawer({
    isOpen,
    onClose,
    type,
    filters,
    onFilterChange,
    onApply,
    categories = [],
    cities = [],
    tags = [],
    priceRange,
}: MobileFilterDrawerProps) {
    if (!isOpen) return null;

    const handleApply = () => {
        onApply();
        onClose();
    };

    const handleReset = () => {
        onFilterChange({});
    };

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            {/* Drawer */}
            <div className="absolute inset-0 bg-white overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-[#1F2A37]">فلتر</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                    >
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {/* Filters Content */}
                <div className="p-4">
                    <SearchFilters
                        type={type}
                        filters={filters}
                        onFilterChange={onFilterChange}
                        categories={categories}
                        cities={cities}
                        tags={tags}
                        priceRange={priceRange}
                        className="border-0 p-0"
                    />
                </div>

                {/* Fixed Bottom Actions */}
                <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex flex-col gap-3">
                    <button
                        onClick={handleApply}
                        className="w-full py-3.5 bg-[#3D5E83] text-white rounded-xl font-medium hover:bg-[#2D496A] transition-colors cursor-pointer"
                    >
                        تطبيق الفلتر
                    </button>
                    <button
                        onClick={handleReset}
                        className="w-full py-2 text-[#3D5E83] text-sm font-medium hover:underline cursor-pointer"
                    >
                        إعادة
                    </button>
                </div>
            </div>
        </div>
    );
}
