// src/components/(dashboard)/SidebarFilterPanel.tsx
"use client";

import { ChevronLeft } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { ScrollArea } from "@/src/components/ui/scroll-area";

interface FilterOption {
  name: string;
  value: string ;
}

interface SidebarFilterPanelProps {
  options: FilterOption[];
  activeValue: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function SidebarFilterPanel({
  options,
  activeValue,
  onValueChange,
  className,
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
                      : "text-gray-2 hover:bg-gray-50"
                  )}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{option.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </ScrollArea>
    </div>
  );
}