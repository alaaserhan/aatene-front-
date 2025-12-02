// src/features/(dashboard)/products/components/ProductFormActions.tsx
"use client";

import { Button } from "@/src/components/ui/button";
import { Bookmark } from "lucide-react";

interface ProductFormActionsProps {
    onNext: () => void;
    onBack?: () => void;
    onCancel?: () => void;
    onSaveDraft?: () => void;
    nextLabel?: string;
    backLabel?: string;
    cancelLabel?: string;
    isSubmitting?: boolean;
    showBack?: boolean;
    showCancel?: boolean;
    showSaveDraft?: boolean;
}

export function ProductFormActions({
    onNext,
    onBack,
    onCancel,
    onSaveDraft,
    nextLabel = "التالي",
    backLabel = "رجوع",
    cancelLabel = "إلغاء",
    isSubmitting = false,
    showBack = true,
    showCancel = false,
    showSaveDraft = true,
}: ProductFormActionsProps) {
    return (
        <div className="flex gap-4 justify-between mt-6 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-6">
            <div className="flex items-center gap-3">
                <Button
                    type="button"
                    onClick={onNext}
                    disabled={isSubmitting}
                    className="px-12 py-5 cursor-pointer rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                            جاري الحفظ...
                        </span>
                    ) : (
                        nextLabel
                    )}
                </Button>

                {showSaveDraft && onSaveDraft && (
                    <Button
                        type="button"
                        onClick={onSaveDraft}
                        variant="outline"
                        disabled={isSubmitting}
                        className="px-6 py-5 border-blue-6 bg-transparent text-blue-4 hover:bg-transparent cursor-pointer rounded-sm flex items-center gap-2"
                    >
                        <img src="/icons/dashboard/Bookmark.svg" className="w-3" alt="Bookmark" />
                        حفظ كمسودة
                    </Button>
                )}
            </div>

            <div className="flex items-center gap-3">
                {showBack && onBack && (
                    <Button
                        type="button"
                        onClick={onBack}
                        variant="outline"
                        disabled={isSubmitting}
                        className="px-12 py-5 bg-gray-4 border-none cursor-pointer rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="px-12 py-5 bg-gray-4 border-none cursor-pointer rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cancelLabel}
                    </Button>
                )}
            </div>
        </div>
    );
}