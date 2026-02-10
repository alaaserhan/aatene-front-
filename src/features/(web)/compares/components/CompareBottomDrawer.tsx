"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronUp, ChevronDown, Trash2, ArrowRight } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface CompareItem {
    id: number;
    name: string;
    image: string;
}

interface CompareBottomDrawerProps {
    isOpen: boolean;
    selectedItems: CompareItem[];
    onRemoveItem: (id: number) => void;
    onClearAll: () => void;
    onGoToCompare: () => void;
    isAdding: boolean;
    type: "products" | "services";
}

export default function CompareBottomDrawer({
    isOpen,
    selectedItems,
    onRemoveItem,
    onClearAll,
    onGoToCompare,
    isAdding,
    type,
}: CompareBottomDrawerProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    if (!isOpen || selectedItems.length === 0) return null;

    const count = selectedItems.length;
    const typeLabel = type === "products" ? "منتجات" : "خدمات";

    return (
        <div className="fixedbottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <div
                className={cn(
                    "bg-white shadow-[0_-5px_20px_rgba(0,0,0,0.1)] rounded-t-2xl w-full max-w-4xl mx-4 transition-all duration-300 pointer-events-auto",
                    isCollapsed ? "translate-y-[calc(100%-60px)]" : "translate-y-0"
                )}
            >
                {/* Header / Toggle */}
                <div
                    className="flex items-center justify-between px-6 py-3 border-b border-gray-100 cursor-pointer"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-[#3D5E83] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                            {count}
                        </div>
                        <span className="font-bold text-gray-800">
                            مقارنة {count} {typeLabel}
                        </span>
                    </div>
                    <button className="text-gray-500 hover:text-[#3D5E83]">
                        {isCollapsed ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col gap-6">
                    {/* Items List */}
                    <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {selectedItems.map((item) => (
                            <div key={item.id} className="relative group shrink-0 w-24">
                                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                                    <Image
                                        src={item.image || "/placeholder.png"}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveItem(item.id);
                                        }}
                                        className="absolute top-1 right-1 bg-white/90 p-1 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                                <p className="text-[10px] text-center mt-1 truncate px-1 font-medium text-gray-700">
                                    {item.name}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onClearAll}
                                className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                            >
                                <Trash2 className="w-4 h-4" />
                                مسح الكل
                            </button>
                            <span className="text-sm text-gray-400 hidden sm:inline">
                                اتمام الاختيار والذهاب لصفحة المقارنة
                            </span>
                        </div>

                        <button
                            onClick={onGoToCompare}
                            disabled={isAdding}
                            className="bg-[#3D5E83] text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-[#2d4a6b] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                        >
                            {isAdding ? "جاري الإضافة..." : "الذهاب للمقارنة"}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
