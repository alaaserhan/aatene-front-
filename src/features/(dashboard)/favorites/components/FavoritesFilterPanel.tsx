"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { ChevronLeft } from "lucide-react";

interface FavoritesFilterPanelProps {
    userId: string;
}

export function FavoritesFilterPanel({ userId }: FavoritesFilterPanelProps) {
    const searchParams = useSearchParams();
    const currentType = searchParams.get("type") || "product";

    const filters = [
        { label: "المنتجات المفضلة", value: "product" },
        { label: "المتاجر المفضلة", value: "store" },
        { label: "الخدمات المفضلة", value: "service" },
    ];

    return (
        <div className="bg-[#E0E7FF]/30 rounded-xl p-4 min-h-[300px]">
            <div className="flex flex-col gap-2">
                {filters.map((filter) => {
                    const isActive = currentType === filter.value;
                    return (
                        <Link
                            key={filter.value}
                            href={`/admin/favorites/${userId}?type=${filter.value}`}
                            className={cn(
                                "flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-[#Dbeafe] text-[#3A5779] font-bold"
                                    : "text-gray-2 hover:bg-white hover:text-gray-700"
                            )}
                        >
                            <span>{filter.label}</span>
                            {isActive && <ChevronLeft className="w-4 h-4" />}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}