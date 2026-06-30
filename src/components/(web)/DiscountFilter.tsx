"use client";

import { BadgePercent } from "lucide-react";
import { ToggleSwitch } from "@/src/components/ui/ToggleSwitch";
import { cn } from "@/src/lib/utils";

interface DiscountFilterProps {
  /** Current value: 1 = only discounted, undefined/0 = all */
  value?: number;
  onChange: (value: number | undefined) => void;
  className?: string;
}

export default function DiscountFilter({
  value,
  onChange,
  className,
}: DiscountFilterProps) {
  const enabled = value === 1;

  const toggle = () => onChange(enabled ? undefined : 1);

  return (
    <div
      onClick={toggle}
      role="switch"
      aria-checked={enabled}
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors select-none",
        enabled
          ? "border-[#F38744] bg-[#FFF4EC]"
          : "border-gray-200 bg-white hover:border-gray-300",
        className,
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
            enabled ? "bg-[#F38744] text-white" : "bg-gray-100 text-gray-500",
          )}
        >
          <BadgePercent className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800">تخفيضات</p>
          {/* <p className="text-xs text-gray-500 truncate">المنتجات التي عليها خصم فقط</p> */}
        </div>
      </div>

      <div onClick={(e) => e.stopPropagation()} className="shrink-0">
        <ToggleSwitch enabled={enabled} onChange={() => toggle()} />
      </div>
    </div>
  );
}
