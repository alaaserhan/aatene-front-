// src/components/ui/OptionTag.tsx
import { X, Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface OptionTagProps {
  label: string;
  onRemove?: () => void;
  showRemoveButton?: boolean;
  className?: string;
  disabled?: boolean;
}

export function OptionTag({
  label,
  onRemove,
  showRemoveButton = true,
  className,
  disabled = false,
}: OptionTagProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 ",
        "px-4 py-1 pb-1.5",
        "rounded-full",
        "border border-blue-3 bg-blue-5",
        "cursor-default",
        disabled && "opacity-60",
        className
      )}
    >
      <span className="text-xs font-medium pt-1  text-blue-3">{label}</span>

      {showRemoveButton && onRemove && (
        <>
          <div className="h-4 w-px bg-gray-300" />

          <button
            type="button"
            onClick={disabled ? undefined : onRemove}
            disabled={disabled}
            className="flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
            aria-label={`حذف ${label}`}
          >
            {disabled
              ? <Loader2 className="w-4 h-4 text-gray-2 animate-spin" />
              : <X className="w-4 h-4 text-gray-2 hover:" />
            }
          </button>
        </>
      )}
    </div>
  );
}