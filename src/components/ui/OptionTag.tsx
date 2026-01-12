// src/components/ui/OptionTag.tsx
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
        "inline-flex items-center gap-2 ",
        "px-4 py-1 pb-1.5",
        "rounded-full",
        "border border-blue-3 bg-blue-5",
        "cursor-default",
        className
      )}
    >
      <span className="text-xs font-medium  text-blue-3">{label}</span>

      {showRemoveButton && onRemove && (
        <>
          <div className="h-4 w-px bg-gray-300" />

          <button
            type="button"
            onClick={onRemove}
            className="flex items-center justify-center cursor-pointer"
            aria-label={`حذف ${label}`}
          >
            <X className="w-4 h-4 text-gray-2 hover:text-gray-800" />
          </button>
        </>
      )}
    </div>
  );
}