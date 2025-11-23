// src/components/ui/ReusableDropdown.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface DropdownOption {
  value: string;
  label: string;
}

interface ReusableDropdownProps {
  options: DropdownOption[];
  value?: string | null; // Allow null or undefined
  onChange: (value: string) => void;
  placeholder?: string;
  triggerIcon?: React.ReactNode;
  className?: string;
  error?: string; // Add error support
}

export function ReusableDropdown({
  options,
  value,
  onChange,
  placeholder = "اختر...",
  triggerIcon,
  className,
  error,
}: ReusableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find selected option only if value exists
  const selectedOption = value 
    ? options.find((opt) => opt.value === value) 
    : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative ", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-2 px-4 h-10 border rounded-sm bg-white hover:bg-gray-50 transition-colors cursor-pointer justify-between",
          error ? "border-red-500" : "border-gray-300",
          className
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {triggerIcon}
          <span className={cn(
            "text-sm whitespace-nowrap truncate",
            selectedOption ? "font-medium " : "text-gray-2"
          )}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-gray-2 transition-transform flex-shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full start-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden max-h-[240px] overflow-y-auto">
          <div className="p-1">
            {options.length > 0 ? (
              options.map((option) => {
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
                      "w-full flex items-center gap-3 px-3 py-2 text-start rounded-md hover:bg-gray-50 transition-colors cursor-pointer",
                      isSelected && "bg-blue-50"
                    )}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0",
                        isSelected
                          ? "border-blue-3 bg-blue-3"
                          : "border-gray-300 bg-white"
                      )}
                    >
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
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
              })
            ) : (
              <div className="p-3 text-center text-sm text-gray-2">
                لا توجد خيارات
              </div>
            )}
          </div>
        </div>
      )}
      {error && <p className="text-xs text-red-1">{error}</p>}
    </div>
  );
}