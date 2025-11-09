// src/components/ui/OptionTag.tsx
"use client";

import { X } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface OptionTagProps {
  label: string;
  onRemove?: () => void;
  showRemoveButton?: boolean;
  className?: string;
}

export function OptionTag({
  label,
  onRemove,
  showRemoveButton = true,
  className,
}: OptionTagProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 border border-blue-1 rounded-full bg-blue-5 transition-colors",
        className
      )}
    >
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {showRemoveButton && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="flex items-center justify-center w-4 h-4 cursor-pointer hover:opacity-70 transition-opacity"
          aria-label={`حذف ${label}`}
        >
          <X className="w-3.5 h-3.5 text-gray-500" />
        </button>
      )}
    </div>
  );
}