// src/components/ui/ReusableDropdown.tsx
"use client";

import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { ChevronDown, Loader2, Search, Plus } from "lucide-react"; // Added Search and Plus icons
import { cn } from "@/src/lib/utils";

interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownRef {
  open: () => void;
  close: () => void;
  toggle: () => void;
}

interface ReusableDropdownProps {
  options: DropdownOption[];
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  triggerIcon?: React.ReactNode;
  className?: string;
  error?: string;
  dropdownPosition?: "top" | "bottom";
  onReachEnd?: () => void;
  isLoadingMore?: boolean;
  // New Props for Search
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  // New Props for Add New
  onAddNew?: () => void;
  addNewLabel?: string;
}

export const ReusableDropdown = forwardRef<DropdownRef, ReusableDropdownProps>(({
  options,
  value,
  onChange,
  placeholder = "اختر...",
  triggerIcon,
  className,
  error,
  dropdownPosition = "bottom",
  onReachEnd,
  isLoadingMore = false,
  onSearch,
  searchPlaceholder = "بحث...",
  onAddNew,
  addNewLabel = "إضافة جديد",
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  }));

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

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 20) {
      if (onReachEnd && !isLoadingMore) {
        onReachEnd();
      }
    }
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-2 px-4 h-10 border rounded-sm bg-white hover:bg-gray-50 transition-colors cursor-pointer justify-between",
          error ? "border-red-500" : "border-gray-200",
          className
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {triggerIcon}
          <span
            className={cn(
              "text-sm whitespace-nowrap truncate",
              selectedOption ? "font-medium " : "text-gray-2"
            )}
          >
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
        <div
          className={cn(
            "absolute start-0 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden max-h-[280px] flex flex-col",
            dropdownPosition === "top"
              ? "bottom-full mb-2"
              : "top-full mt-2"
          )}
        >
          {/* Search Input Section */}
          {onSearch && (
            <div className="p-2 sticky top-0 bg-white border-b border-gray-100 z-10">
              <div className="relative">
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  onChange={(e) => onSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-3 text-right"
                  autoFocus
                />
                <Search className="w-3.5 h-3.5 text-gray-2 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div
            className="overflow-y-auto p-1 flex-1"
            onScroll={handleScroll}
            ref={listRef}
          >
            {options.length > 0 ? (
              <>
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
                        "w-full flex items-center gap-3 px-3 py-2.5 text-start rounded-md hover:bg-gray-50 transition-colors cursor-pointer",
                        isSelected && "bg-blue-50"
                      )}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors",
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
                })}
                {isLoadingMore && (
                  <div className="flex justify-center py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-4" />
                  </div>
                )}
              </>
            ) : (
              <div className="p-3 text-center text-sm text-gray-2">
                لا توجد خيارات
              </div>
            )}

            {onAddNew && (
              <div className="w-full bg-white">
                <button
                  type="button"
                  onClick={() => {
                    onAddNew();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2 bg-blue-5 rounded-sm cursor-pointer text-sm text-blue-3 font-medium  sticky bottom-0"
                >
                  <Plus className="w-4 h-4" />
                  {addNewLabel}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
});

ReusableDropdown.displayName = "ReusableDropdown";