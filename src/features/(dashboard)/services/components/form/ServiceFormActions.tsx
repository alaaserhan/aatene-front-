// src/features/(dashboard)/services/components/form/ServiceFormActions.tsx
"use client";

import { Button } from "@/src/components/ui/button";

interface ServiceFormActionsProps {
  submitLabel: string;
  loadingLabel?: string;
  isSubmitting?: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

/**
 * Sticky bottom bar for the service form: cancel at the start, publish at the end.
 * Publishing is available from any step because the advanced step is fully optional.
 */
export function ServiceFormActions({
  submitLabel,
  loadingLabel = "جاري النشر...",
  isSubmitting = false,
  onSubmit,
  onCancel,
}: ServiceFormActionsProps) {
  return (
    <div className="sticky bottom-0 left-0 right-0 z-30 w-full bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="container mx-auto max-w-full">
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6" dir="rtl">
          {/* Start (right in RTL): cancel */}
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            disabled={isSubmitting}
            className="px-6 sm:px-12 py-5 bg-gray-4 border-none cursor-pointer rounded-sm text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            إلغاء
          </Button>

          {/* End (left in RTL): publish */}
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="px-6 sm:px-12 py-5 cursor-pointer rounded-sm text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "var(--blue-3)" }}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {loadingLabel}
              </span>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
