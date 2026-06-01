// src/features/(dashboard)/products/components/ProductFormActions.tsx
"use client";

import type { ReactNode } from "react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

interface ProductFormActionsProps {
    onNext: () => void;
    onBack?: () => void;
    onCancel?: () => void;
    onSaveDraft?: () => void;
    nextLabel?: string;
    backLabel?: string;
    cancelLabel?: string;
    loadingLabel?: string;
    /** محتوى بعد نص الزر الأساسي (مثل › في إضافة منتج) */
    nextTrailing?: ReactNode;
    isSubmitting?: boolean;
    showBack?: boolean;
    showCancel?: boolean;
    showSaveDraft?: boolean;
    /** شريط سفلي ثابت بنفس ظل وارتفاع أزرار التصميم القديم */
    sticky?: boolean;
}

export function ProductFormActions({
    onNext,
    onBack,
    onCancel,
    onSaveDraft,
    nextLabel = "التالي",
    backLabel = "رجوع",
    cancelLabel = "إلغاء",
    loadingLabel = "جاري الحفظ...",
    nextTrailing,
    isSubmitting = false,
    showBack = true,
    showCancel = false,
    showSaveDraft = false,
    sticky = false,
}: ProductFormActionsProps) {
    const inner = (
        <div className={cn("flex flex-wrap gap-4 justify-between", sticky ? "" : "mt-6", "p-4 sm:p-6")}>
            <div className="flex items-center gap-3">
                <Button
                    type="button"
                    onClick={onNext}
                    disabled={isSubmitting}
                    className="px-6 sm:px-12 py-5 cursor-pointer rounded-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
                    style={{ backgroundColor: "var(--blue-3)" }}
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            {loadingLabel}
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-2">
                            {nextLabel}
                            {nextTrailing}
                        </span>
                    )}
                </Button>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
                {showBack && onBack && (
                    <Button
                        type="button"
                        onClick={onBack}
                        variant="outline"
                        disabled={isSubmitting}
                        className="px-6 sm:px-12 py-5 bg-gray-4 border-none cursor-pointer rounded-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                        {backLabel}
                    </Button>
                )}

                {showCancel && onCancel && (
                    <Button
                        type="button"
                        onClick={onCancel}
                        variant="outline"
                        disabled={isSubmitting}
                        className="px-6 sm:px-12 py-5 bg-gray-4 border-none cursor-pointer rounded-sm disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                        {cancelLabel}
                    </Button>
                )}
            </div>
        </div>
    );

    if (sticky) {
        return (
            <div className="sticky bottom-0 left-0 right-0 z-30 w-full bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
                <div className="container mx-auto max-w-full">{inner}</div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
            <div className="container mx-auto max-w-full">{inner}</div>
        </div>
    );
}