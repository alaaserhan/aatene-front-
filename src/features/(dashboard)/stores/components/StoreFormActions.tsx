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
  sticky?: boolean;
}

export function StoreFormActions({
  onBack,
  onNext,
  isSubmitting = false,
  nextLabel = "حفظ والتالي",
  backLabel = "رجوع",
  className,
  showBack = true,
  sticky = false,
}: StoreFormActionsProps) {
  const inner = (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 sm:justify-between",
        sticky ? "" : "mt-6",
        "p-4 sm:p-6",
        className
      )}
    >
      <Button
        type="button"
        onClick={onNext}
        disabled={isSubmitting}
        className="w-full sm:w-auto sm:min-w-[140px] px-6 sm:px-12 py-3 sm:py-5 cursor-pointer rounded-sm disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm sm:text-base"
        style={{ backgroundColor: "var(--blue-3)" }}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="animate-spin h-5 w-5" />
            جاري الحفظ...
          </span>
        ) : (
          nextLabel
        )}
      </Button>

      {showBack && onBack && (
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          disabled={isSubmitting}
          className="w-full sm:w-auto sm:min-w-[120px] px-6 sm:px-12 py-3 sm:py-5 bg-gray-4 border-none cursor-pointer rounded-sm disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 hover:bg-gray-200 text-sm sm:text-base"
        >
          {backLabel}
        </Button>
      )}
    </div>
  );

  if (sticky) {
    return (
      <div className="sticky bottom-0 left-0 right-0 z-30 w-full bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom)]">
        <div className="container mx-auto max-w-full px-3 sm:px-4">{inner}</div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="container mx-auto max-w-full px-3 sm:px-4">{inner}</div>
    </div>
  );
}
