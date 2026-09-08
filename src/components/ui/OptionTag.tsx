// src/components/ui/OptionTag.tsx
import Image from "next/image";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface OptionTagProps {
  label: string;
  onRemove?: () => void;
  showRemoveButton?: boolean;
  className?: string;
  disabled?: boolean;
  /** Optional thumbnail shown at the start of the tag (product cover, avatar, ...) */
  image?: string | null;
}

export function OptionTag({
  label,
  onRemove,
  showRemoveButton = true,
  className,
  disabled = false,
  image,
}: OptionTagProps) {
  // next/image only accepts absolute URLs or root-relative paths
  const src = image?.trim() ?? "";
  const hasImage = src.startsWith("http") || src.startsWith("/");

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 ",
        hasImage ? "ps-1 pe-2 py-1" : "px-4 py-1 pb-1.5",
        hasImage ? "rounded-lg" : "rounded-full",
        "border border-blue-3 bg-blue-5",
        "cursor-default",
        disabled && "opacity-60",
        className
      )}
    >
      {hasImage && (
        <span className="relative w-8 h-8 shrink-0 overflow-hidden rounded-md bg-white">
          <Image
            src={src}
            alt={label}
            fill
            unoptimized
            className="object-cover"
          />
        </span>
      )}

      <span className={cn("text-xs font-medium text-blue-3", !hasImage && "pt-1")}>{label}</span>

      {showRemoveButton && onRemove && (
        <>
          <div className={cn("w-px bg-gray-300", hasImage ? "h-6" : "h-4")} />

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