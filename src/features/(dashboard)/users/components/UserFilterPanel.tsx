// src/features/(dashboard)/users/components/UserFilterPanel.tsx
"use client";

import { ChevronLeft } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface FilterCategory {
  name: string;
  value: string;
}

interface UserFilterPanelProps {
  categories: FilterCategory[];
  activeFilter: string;
  onFilterChange: (value: string) => void;
  className?: string;
}

export function UserFilterPanel({
  categories,
  activeFilter,
  onFilterChange,
  className,
}: UserFilterPanelProps) {
  return (
    <div className={cn("bg-white  rounded-sm overflow-hidden h-full", className)}>

      {/* Filter List */}
      <ul className="">
        {categories.map((category) => {
          const isActive = category.value === activeFilter;
          return (
            <li key={category.value}>
              <button
                onClick={() => onFilterChange(category.value)}
                className={cn(
                  "w-full flex items-center justify-between p-3  transition-colors cursor-pointer",
                  isActive
                    ? "bg-blue-5 text-blue-3 font-medium"
                    : "text-gray-2 hover:bg-gray-50  "
                )}
              >
                <span>{category.name}</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}