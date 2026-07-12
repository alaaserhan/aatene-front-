"use client";

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
        "flex items-center justify-between gap-2 rounded-lg cursor-pointer transition-colors select-none",
       
        className,
      )}
    >
      <p className="text-sm font-semibold text-gray-800 min-w-0 truncate">
        تخفيضات
      </p>

      <div onClick={(e) => e.stopPropagation()} className="shrink-0">
        <ToggleSwitch enabled={enabled} onChange={() => toggle()} />
      </div>
    </div>
  );
}
