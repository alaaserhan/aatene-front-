"use client";

import { cn } from "@/src/lib/utils";
import { FavoritesType } from "../FavoritesPage";

interface FavoritesSidebarProps {
    selectedType: FavoritesType;
    onSelect: (type: FavoritesType) => void;
}

export default function FavoritesSidebar({
    selectedType,
    onSelect,
}: FavoritesSidebarProps) {
    const items: { label: string; value: FavoritesType }[] = [
        { label: "جميع العناصر", value: "all" },
        { label: "المنتجات المفضلة", value: "product" },
        { label: "المتاجر المفضلة", value: "store" },
        { label: "الخدمات المفضلة", value: "service" },
    ];

    return (
        <div className=" border border-gray-200 rounded-md p-4 flex flex-col gap-4">
            {items.map((item) => (
                <button
                    key={item.value}
                    onClick={() => onSelect(item.value)}
                    className={cn(
                        "w-full py-3 px-4 cursor-pointer rounded-md text-center transition-colors duration-200 text-sm font-medium  ",
                        selectedType === item.value
                            ? "bg-blue-3 text-white border border-[#C8D7E8]"
                            : "bg-blue-5 text-[#3D5E83] hover:bg-[#E5E7EB]"
                    )}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
}
