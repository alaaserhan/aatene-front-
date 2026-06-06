// src/components/ui/ReusableDropdown.tsx
"use client";

import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { ChevronDown, Loader2, Search, Plus, Trash2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";

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
  value?: string | string[] | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (value: any) => void;
  multiple?: boolean;
  placeholder?: string;
  triggerIcon?: React.ReactNode;
  className?: string;
  error?: string;
  disabled?: boolean;
  dropdownPosition?: "top" | "bottom";
  onReachEnd?: () => void;
  isLoadingMore?: boolean;
  // New Props for Search
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  // New Props for Add New
  onAddNew?: () => void;
  addNewLabel?: string;
  triggerClassName?: string;
  // New Prop for removing an option
  onRemoveItem?: (value: string) => void;
}

export const ReusableDropdown = forwardRef<DropdownRef, ReusableDropdownProps>(({
  options,
  value,
  onChange,
  multiple = false,
  placeholder = "اختر...",
  triggerIcon,
  className,
  error,
  disabled = false,
  dropdownPosition = "bottom",
  onReachEnd,
  isLoadingMore = false,
  onSearch,
  searchPlaceholder = "بحث...",
  onAddNew,
  addNewLabel = "إضافة جديد",
  triggerClassName,
  onRemoveItem,
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [triggerWidth, setTriggerWidth] = useState<number | undefined>(undefined);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      setTriggerWidth(dropdownRef.current.offsetWidth);
    }
  }, [isOpen]);

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  }));

  const selectedOption = !multiple && value && typeof value === 'string'
    ? options.find((opt) => opt.value === value)
    : null;

  const selectedOptions = multiple && Array.isArray(value)
    ? options.filter((opt) => value.includes(opt.value))
    : [];

  useEffect(() => {
    // We no longer need handleClickOutside manually since Popover handles it.
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
    <div className={cn("w-full", className)} ref={dropdownRef} >
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <button
            type="button"
            className={cn(
              "w-full flex items-center gap-2 px-4 h-10 border rounded-sm bg-white hover:bg-gray-50 transition-colors cursor-pointer justify-between focus:outline-none",
              disabled && "opacity-50 cursor-not-allowed bg-gray-100",
              error ? "border-red-500" : "border-gray-200",
              triggerClassName
            )}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              {triggerIcon}
              <span
                className={cn(
                  "text-sm whitespace-nowrap truncate",
                  (multiple && selectedOptions.length > 0) || (!multiple && selectedOption) ? "font-medium " : "text-gray-2"
                )}
              >
                {multiple
                  ? (selectedOptions.length > 0 ? selectedOptions.map(o => o.label).join(", ") : placeholder)
                  : (selectedOption ? selectedOption.label : placeholder)}
              </span>
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-gray-2 transition-transform shrink-0",
                isOpen && "rotate-180"
              )}
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="p-0 border-gray-200 rounded-lg shadow-xl"
          style={{ width: triggerWidth ? Math.max(triggerWidth, 180) : 180 }}
          side={dropdownPosition}
          sideOffset={4}
          align="start"
          dir="rtl"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col bg-white rounded-lg overflow-hidden max-h-[280px]">
            {onSearch && (
              <div className="p-2 sticky top-0 bg-white border-b border-gray-100 z-10 shrink-0">
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
              className="overflow-y-auto p-1 flex-1 flex flex-col gap-1"
              onScroll={handleScroll}
              ref={listRef}
            >
              {options.length > 0 ? (
                <>
                  {options.map((option) => {
                    const isSelected = multiple
                      ? Array.isArray(value) && value.includes(option.value)
                      : option.value === value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          if (multiple) {
                            const currentVals = Array.isArray(value) ? [...value] : [];
                            if (isSelected) {
                              onChange(currentVals.filter((v: string) => v !== option.value));
                            } else {
                              onChange([...currentVals, option.value]);
                            }
                          } else {
                            onChange(option.value);
                            setIsOpen(false);
                          }
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 text-start rounded-md hover:bg-gray-50 transition-colors cursor-pointer group",
                          isSelected && "bg-blue-50"
                        )}
                      >
                        <div
                          className={cn(
                            "w-4 h-4 border flex items-center justify-center shrink-0 transition-colors",
                            multiple ? "rounded-sm" : "rounded-full",
                            isSelected
                              ? "border-blue-3 bg-blue-3"
                              : "border-gray-300 bg-white"
                          )}
                        >
                          {isSelected && !multiple && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                          {isSelected && multiple && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
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
                        {onRemoveItem && (
                          <div
                            role="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveItem(option.value);
                            }}
                            className="mr-auto p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                  {isLoadingMore && (
                    <div className="flex justify-center py-2 shrink-0">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-4" />
                    </div>
                  )}
                </>
              ) : (
                <div className="p-3 text-center text-sm text-gray-2 shrink-0">
                  لا توجد خيارات
                </div>
              )}

              {onAddNew && (
                <div className="w-full bg-white shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onAddNew();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 p-2 bg-blue-5 rounded-sm cursor-pointer text-sm text-blue-3 font-medium sticky bottom-0"
                  >
                    <Plus className="w-4 h-4" />
                    {addNewLabel}
                  </button>
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
});

ReusableDropdown.displayName = "ReusableDropdown";