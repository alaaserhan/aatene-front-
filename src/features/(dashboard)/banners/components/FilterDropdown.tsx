// src/features/(dashboard)/banners/components/FilterDropdown.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Circle } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface FilterOption {
  value: string;
  label: string;
}

const filterOptions: FilterOption[] = [
  { value: "all", label: "الكل" },
  { value: "active", label: "فعال فقط" },
  { value: "inactive", label: "غير فعال فقط" },
];

interface FilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export function FilterDropdown({ value, onChange }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = filterOptions.find((opt) => opt.value === value) || filterOptions[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-sm bg-white hover:bg-gray-50 transition-colors cursor-pointer min-w-[180px] justify-between"
      >
        <div className="flex items-center gap-2">
          <Circle className="w-4 h-4 text-blue-3 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">حالة الإعلان</span>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-gray-2 transition-transform flex-shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="">
            {filterOptions.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2 text-right hover:bg-gray-50 transition-colors cursor-pointer",
                    isSelected && "bg-blue-50"
                  )}
                >
                  {/* Radio Button */}
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                      isSelected
                        ? "border-blue-3 bg-blue-3"
                        : "border-gray-300 bg-white"
                    )}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isSelected ? "text-blue-3" : "text-gray-700"
                    )}
                  >
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}