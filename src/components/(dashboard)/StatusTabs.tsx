// src/components/(dashboard)/StatusTabs.tsx
"use client";

import { cn } from "@/src/lib/utils";

/** حالات المراجعة المشتركة بين المتاجر والخدمات والمنتجات */
export type ReviewStatus = "approved" | "pending" | "rejected";

type Tone = "emerald" | "amber" | "red";

const TONE_CLASSES: Record<Tone, { active: string; badge: string }> = {
  emerald: { active: "border-emerald-500 text-emerald-500", badge: "bg-emerald-500" },
  amber: { active: "border-amber-400 text-amber-400", badge: "bg-amber-400" },
  red: { active: "border-red-500 text-red-500", badge: "bg-red-500" },
};

export interface StatusTabItem<T extends string = ReviewStatus> {
  key: T;
  label: string;
  tone: Tone;
}

/** التبويبات الافتراضية: تمت الموافقة / قيد المراجعة / مرفوض */
export const REVIEW_STATUS_TABS: StatusTabItem<ReviewStatus>[] = [
  { key: "approved", label: "تمت الموافقة عليه", tone: "emerald" },
  { key: "pending", label: "قيد المراجعة", tone: "amber" },
  { key: "rejected", label: "مرفوض", tone: "red" },
];

interface StatusTabsProps<T extends string> {
  activeKey: T;
  onChange: (key: T) => void;
  /** عدد العناصر لكل تبويب */
  getCount?: (key: T) => number;
  tabs?: StatusTabItem<T>[];
  /** كلاسات إضافية للحاوية الخارجية */
  className?: string;
}

export function StatusTabs<T extends string>({
  activeKey,
  onChange,
  getCount,
  tabs,
  className,
}: StatusTabsProps<T>) {
  const items = tabs ?? (REVIEW_STATUS_TABS as unknown as StatusTabItem<T>[]);

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-6 pt-4 border-b border-gray-100 overflow-x-auto",
        className
      )}
    >
      {items.map((tab) => {
        const isActive = activeKey === tab.key;
        const tone = TONE_CLASSES[tab.tone];

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              "flex cursor-pointer items-center gap-2 pb-3 px-6 border-b-[3px] transition-all duration-200 shrink-0",
              isActive ? tone.active : "border-transparent text-gray-2 hover:text-gray-2"
            )}
          >
            <span className="font-bold text-sm whitespace-nowrap">{tab.label}</span>
            {getCount && (
              <span
                className={cn(
                  "flex items-center justify-center min-w-6 h-6 px-1.5 pt-1 rounded text-xs font-bold text-white",
                  tone.badge
                )}
              >
                {getCount(tab.key)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
