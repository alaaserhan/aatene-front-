"use client";

import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label: string;
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "اختر",
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleRemove = (optionValue: string) => {
    onChange(value.filter((v) => v !== optionValue));
  };

  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label */}
      <label className="block text-sm font-medium text-brand-black-1 text-right">
        {label} <span className="text-red-500">*</span>
      </label>

      {/* Dropdown Trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg hover:border-brand-blue-2 transition-colors bg-white text-right"
        >
          <ChevronDown 
            className={cn(
              "w-5 h-5 text-brand-blue-3 transition-transform",
              isOpen && "rotate-180"
            )} 
          />
          <span className="text-gray-500">{placeholder}</span>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleToggle(option.value)}
                className={cn(
                  "w-full text-right px-4 py-3 hover:bg-gray-50 transition-colors",
                  value.includes(option.value) && "bg-brand-blue-1 text-brand-blue-3 font-medium"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Tags */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-end">
          {selectedOptions.map((option) => (
            <div
              key={option.value}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-brand-blue-2 rounded-full text-sm"
            >
              <button
                type="button"
                onClick={() => handleRemove(option.value)}
                className="hover:bg-gray-100 rounded-full p-0.5 transition-colors"
              >
                <X className="w-4 h-4 text-brand-blue-3" />
              </button>
              <span className="text-brand-black-1">{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}