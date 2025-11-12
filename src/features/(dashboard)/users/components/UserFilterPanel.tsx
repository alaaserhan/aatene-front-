// src/features/(dashboard)/users/components/UserFilterPanel.tsx
"use client";

import { ChevronLeft } from "lucide-react";


interface FilterCategory {
  name: string;
  value: string;
}

interface UserFilterPanelProps {
  categories: FilterCategory[];
  activeFilter: string;
  onFilterChange: (value: string) => void;
}

export function UserFilterPanel({
  categories,
  activeFilter,
  onFilterChange,
}: UserFilterPanelProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-gray-800">الكل</h2>
        <button className="p-1 rounded-md hover:bg-gray-100 cursor-pointer" title="Toggle Panel">
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
      <ul>
        {categories.map((cat) => (
          <li
            key={cat.value}
            onClick={() => onFilterChange(cat.value)}
            className={`flex justify-between items-center p-2 rounded-md cursor-pointer ${
              cat.value === activeFilter
                ? "bg-blue-50 text-[#3A5779] font-bold"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span className="flex items-center gap-2">{cat.name}</span>
            <ChevronLeft className="w-4 h-4" />
          </li>
        ))}
      </ul>
    </div>
  );
}