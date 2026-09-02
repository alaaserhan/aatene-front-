"use client";

import { Dispatch, ReactNode, RefObject, SetStateAction, useRef } from "react";
import { Loader2, MessageSquareText } from "lucide-react";
import { Pagination } from "@/src/components/ui/Pagination";
import { ReviewComposer } from "./ReviewComposer";
import { useReviewsPagination } from "./useReviewsPagination";
import type { ReviewFormRef } from "./ReviewForm";
import type { ReviewSubmitPayload } from "./types";

interface ReviewsSectionProps {
    /** Rating summary rendered above the composer */
    stats?: ReactNode;
    isLoading?: boolean;
    /** The rendered review items */
    children: ReactNode;
    /** Reviews on the current page — drives the empty state and the page size */
    itemsOnPage: number;
    /** Total reviews reported by the API */
    total?: number;
    page: number;
    setPage: Dispatch<SetStateAction<number>>;
    emptyMessage?: string;

    // Composer — the ref lets a page open/scroll to it from elsewhere
    composerRef?: RefObject<ReviewFormRef | null>;
    onSubmit: (data: ReviewSubmitPayload) => Promise<void> | void;
    isSubmitting: boolean;
}

/**
 * Shared layout for every reviews list in the app: summary, composer, list and
 * pagination. The composer sits above the list so adding a review never means
 * scrolling past every existing one.
 */
export function ReviewsSection({
    stats,
    isLoading,
    children,
    itemsOnPage,
    total,
    page,
    setPage,
    emptyMessage = "لا توجد مراجعات بعد — كن أول من يشارك رأيه",
    composerRef,
    onSubmit,
    isSubmitting,
}: ReviewsSectionProps) {
    const listRef = useRef<HTMLDivElement>(null);
    const { totalPages, goToPage } = useReviewsPagination({ page, setPage, total, itemsOnPage, scrollTargetRef: listRef });

    return (
        <div className="space-y-6">
            {stats}

            <ReviewComposer ref={composerRef} onSubmit={onSubmit} isSubmitting={isSubmitting} />

            <div ref={listRef} className="scroll-mt-24">
                {isLoading ? (
                    <div className="flex justify-center p-10">
                        <Loader2 className="animate-spin text-c2-navy-700" />
                    </div>
                ) : itemsOnPage === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-c2-neutral-200 bg-c2-neutral-50 py-10 text-center">
                        <MessageSquareText size={26} className="text-c2-navy-300" />
                        <p className="text-sm text-c2-neutral-600">{emptyMessage}</p>
                    </div>
                ) : (
                    <div className="space-y-4">{children}</div>
                )}
            </div>

            {!isLoading && totalPages > 1 && (
                <Pagination totalPages={totalPages} currentPage={page} onPageChange={goToPage} />
            )}
        </div>
    );
}
