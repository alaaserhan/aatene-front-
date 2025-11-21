"use client";

import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { Loader2 } from "lucide-react";

interface StoreFormActionsProps {
  onBack?: () => void;
  onNext?: () => void;
  isSubmitting?: boolean;
  nextLabel?: string;
  backLabel?: string;
  className?: string;
  showBack?: boolean;
}

export function StoreFormActions({
  onBack,
  onNext,
  isSubmitting = false,
  nextLabel = "حفظ والتالي",
  backLabel = "رجوع",
  className,
  showBack = true,
}: StoreFormActionsProps) {
  return (
    <div
      className={cn(
        "flex gap-4 justify-between mt-6 bg-white shadow-2xl p-6 rounded-sm",
        className
      )}
    >
      <Button
        type="button"
        onClick={onNext}
        disabled={isSubmitting}
        className="px-12 py-5 cursor-pointer rounded-sm disabled:opacity-50 disabled:cursor-not-allowed text-white"
        style={{ backgroundColor: "var(--blue-3)" }}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="animate-spin h-5 w-5" />
            جاري الحفظ...
          </span>
        ) : (
          nextLabel
        )}
      </Button>

      {showBack && (
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          disabled={isSubmitting}
          className="px-12 py-5 bg-gray-4 border-none cursor-pointer rounded-sm disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 hover:bg-gray-200"
        >
          {backLabel}
        </Button>
      )}
    </div>
  );
}