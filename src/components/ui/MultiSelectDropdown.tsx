// src/components/ui/MultiSelectDropdown.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { OptionTag } from "./OptionTag";

interface DropdownOption {
  value: string;
  label: string;
}

interface MultiSelectDropdownProps {
  options: DropdownOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

export function MultiSelectDropdown({
  options,
  selectedValues,
  onChange,
  placeholder = "اختر...",
  className,
  error,
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleSelect = (value: string) => {
    if (!selectedValues.includes(value)) {
      onChange([...selectedValues, value]);
    }
    setIsOpen(false);
  };

  const handleRemove = (value: string) => {
    onChange(selectedValues.filter((v) => v !== value));
  };

  const availableOptions = options.filter(
    (opt) => !selectedValues.includes(opt.value)
  );

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-[43px] px-2 py-2 border rounded-sm cursor-pointer transition-colors flex items-center justify-between gap-2",
          error ? "border-red-500" : "border-gray-300",
          isOpen && "border-blue-3 ring-0"
        )}
      >
        <div className="flex flex-wrap gap-2 flex-1 items-center">
          {selectedValues.length > 0 ? (
            selectedValues.map((value) => {
              const label = options.find((opt) => opt.value === value)?.label;
              if (!label) return null;

              return (
                <div key={value} onClick={(e) => e.stopPropagation()}>
                  <OptionTag
                    label={label}
                    onRemove={() => handleRemove(value)}
                    showRemoveButton={true}
                    className="h-8"
                  />
                </div>
              );
            })
          ) : (
            <span className="text-sm text-gray-2 select-none">
              {placeholder}
            </span>
          )}
        </div>

        <ChevronDown
          className={cn(
            "w-5 h-5 text-gray-1 transition-transform flex-shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </div>

      {isOpen && (
        <div className="absolute top-full start-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden max-h-[240px] overflow-y-auto">
          <div className="p-1">
            {availableOptions.length > 0 ? (
              availableOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-start rounded-md hover:bg-gray-50 transition-colors cursor-pointer text-sm font-medium text-gray-700"
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-gray-2">
                لا توجد خيارات إضافية
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}