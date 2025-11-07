// src/components/ui/ReusableDropdown.tsx
"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface ReusableDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder: string;
  /** هل نعرض القيمة المختارة على الزر؟ */
  showSelectedLabel?: boolean;
  /** أيقونة اختيارية بجانب العنوان */
  triggerIcon?: ReactNode;
  triggerClassName?: string;
  menuClassName?: string;
}

export function ReusableDropdown({
  value,
  onChange,
  options,
  placeholder,
  showSelectedLabel = false,
  triggerIcon,
  triggerClassName,
  menuClassName,
}: ReusableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const triggerText = (showSelectedLabel && selectedOption) ? selectedOption.label : placeholder;

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
        className={cn(
          "flex items-center w-full gap-2 px-4 py-2.5 border border-gray-300 rounded-sm bg-white hover:bg-gray-50 transition-colors cursor-pointer min-w-[180px] justify-between",
          triggerClassName
        )}
      >
        <div className="flex items-center gap-2">
          {triggerIcon}
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
            {triggerText}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-gray-500 transition-transform flex-shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute top-full start-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden",
            menuClassName
          )}
        >
          <div>
            {options.map((option) => {
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
                    "w-full flex items-center gap-3 px-4 py-2 text-start hover:bg-gray-50 transition-colors cursor-pointer",
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