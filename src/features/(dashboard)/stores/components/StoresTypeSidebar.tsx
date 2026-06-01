"use client";

import { cn } from "@/src/lib/utils";

export type StoreTypeFilter = "all" | "products" | "services";

interface StoresTypeSidebarProps {
  totalCount: number;
  productsCount: number;
  servicesCount: number;
  selected: StoreTypeFilter;
  onSelect: (value: StoreTypeFilter) => void;
}

interface StoreTypeRowProps {
  filter: StoreTypeFilter;
  label: string;
  count: number;
  selected: StoreTypeFilter;
  onSelect: (value: StoreTypeFilter) => void;
}

function StoreTypeRow({
  filter,
  label,
  count,
  selected,
  onSelect,
}: StoreTypeRowProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(filter)}
      className={cn(
        "w-full flex items-center justify-between gap-2 px-4 py-3 text-sm font-medium text-start transition-colors rounded-xs",
        selected === filter ? "bg-blue-5 text-blue-4" : "text-gray-700 hover:bg-gray-50"
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "min-w-[28px] h-7 px-2 inline-flex items-center justify-center rounded-full text-xs font-bold",
          selected === filter ? "bg-blue-3 text-white" : "bg-gray-100 text-gray-2"
        )}
      >
        {count}
      </span>
    </button>
  );
}

export function StoresTypeSidebar({
  totalCount,
  productsCount,
  servicesCount,
  selected,
  onSelect,
}: StoresTypeSidebarProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col max-h-[calc(100vh-193px)]">
      <button
        type="button"
        onClick={() => onSelect("all")}
        className={cn(
          "w-full p-4 border-b border-gray-200 text-start transition-colors",
          selected === "all" ? "bg-blue-5" : "bg-[#EEF2F6] hover:bg-gray-100"
        )}
      >
        <h2 className="text-sm font-bold text-blue-4">
          جميع المتاجر ({totalCount})
        </h2>
      </button>
      <nav className="p-2 flex flex-col gap-1" aria-label="تصفية نوع المتجر">
        <StoreTypeRow
          filter="products"
          label="متاجر منتجات"
          count={productsCount}
          selected={selected}
          onSelect={onSelect}
        />
        <StoreTypeRow
          filter="services"
          label="متاجر خدمات"
          count={servicesCount}
          selected={selected}
          onSelect={onSelect}
        />
      </nav>
    </div>
  );
}
