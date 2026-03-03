// src/components/(dashboard)/SidebarFilterPanel.tsx
"use client";

import { ChevronLeft } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { ReactNode } from "react";

interface FilterOption {
  name: string;
  value: string;
}

interface SidebarFilterPanelProps {
  options: FilterOption[];
  activeValue: string;
  onValueChange: (value: string) => void;
  className?: string;
  action?: ReactNode;
  totalItemsCount?: number;
}

export function SidebarFilterPanel({
  options,
  activeValue,
  onValueChange,
  className,
  action,
  totalItemsCount,
}: SidebarFilterPanelProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-sm overflow-hidden h-full flex flex-col",
        className
      )}
    >
      <ScrollArea className="flex-1">
        <ul className="">
          {options.map((option) => {
            const isActive = option.value === activeValue;
            return (
              <li key={option.value}>
                <button
                  onClick={() => onValueChange(option.value)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 transition-colors cursor-pointer",
                    isActive
                      ? "bg-blue-5 text-blue-3 font-medium"
                      : "text-gray-2 hover:bg-gray-50",
                    option.value === "other" && !activeValue ? "bg-blue-5 text-blue-3 font-medium" : "" // Handle default selection style
                  )}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="flex-1 text-right text-base mx-2">
                    {option.name}
                    {option.value === "other" && totalItemsCount !== undefined && (
                      <span className={cn("mr-1 text-base font-medium", (isActive || !activeValue) ? "text-blue-3" : "text-gray-400")}>
                        ({totalItemsCount})
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {action && <div className="p-3 border-t border-gray-100">{action}</div>}
      </ScrollArea>
    </div>
  );
}