// src/components/(dashboard)/GenericSidebarList.tsx
"use client";

import { ReactNode, useEffect, useRef } from "react";
import { Input } from "@/src/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";

export interface FilterOption {
  label: string;
  value: string;
}

interface GenericSidebarListProps<T> {
  data: T[];
  isLoading: boolean;
  isError: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];
  renderItem: (item: T) => ReactNode;
  emptyText?: string;
  className?: string;
  triggerIcon?: ReactNode;
  selectedId?: number | string | null;
  extraHeaderContent?: ReactNode;
  // --- Props الخاصة بالـ Infinite Scroll ---
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}

export function GenericSidebarList<T extends { id: number | string }>({
  data,
  isLoading,
  isError,
  searchQuery,
  onSearchChange,
  filterValue,
  onFilterChange,
  filterOptions,
  renderItem,
  emptyText = "لا توجد بيانات",
  className,
  triggerIcon,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
  extraHeaderContent,
}: GenericSidebarListProps<T>) {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          if (onLoadMore) {
            onLoadMore();
          }
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  return (
    <div
      className={cn(
        "bg-white rounded-lg max-h-[calc(100vh-193px)] h-full min-h-0 border border-gray-200 flex flex-col overflow-hidden",
        className
      )}
    >
      <div className="p-3 border-b border-gray-200 flex gap-2 flex-row">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-2 pointer-events-none" />
          <Input
            type="text"
            placeholder="ابحث..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pr-10 pl-3 py-3 h-10 border-gray-200 rounded-sm text-sm placeholder:text-gray-2 focus:ring-2 focus:ring-[#3A5779] focus:border-transparent"
          />
        </div>

        {filterOptions && filterValue !== undefined && onFilterChange && (
          <ReusableDropdown
            options={filterOptions}
            value={filterValue}
            onChange={onFilterChange}
            triggerIcon={
              triggerIcon || (
                <img
                  src="/icons/dashboard/order.svg"
                  alt="filter"
                  className="w-4 h-4"
                />
              )
            }
            className="w-[120px]"
          />
        )}
      </div>

      {extraHeaderContent}

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y">
        {isLoading ? (
          <div className="flex items-center justify-center h-full min-h-[300px]">
            <Loader2 className="w-6 h-6 animate-spin text-gray-2" />
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-full min-h-[300px]">
            <p className="text-sm text-red-500">حدث خطأ في جلب البيانات</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[300px]">
            <p className="text-sm text-gray-2">{emptyText}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.map((item) => renderItem(item))}

            {/* عنصر المراقبة لنهاية القائمة */}
            <div ref={observerTarget} className="h-4 w-full" />

            {/* لودر التحميل الإضافي */}
            {isFetchingNextPage && (
              <div className="flex justify-center p-4">
                <Loader2 className="w-5 h-5 animate-spin text-[#3A5779]" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}