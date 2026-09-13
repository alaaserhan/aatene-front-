"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { Pagination } from "@/src/components/ui/Pagination";
import { useDebounce } from "@/src/hooks/use-debounce";
import type { Review, ReviewTargetType } from "../api";
import { DEFAULT_REVIEW_TYPE, REVIEWS_PER_PAGE, isReviewType } from "../constants";
import { useDeleteReview, useGetReviews } from "../hooks";
import { ReviewDetailsDialog } from "./ReviewDetailsDialog";
import { ReviewsTable } from "./ReviewsTable";
import { ReviewsToolbar } from "./ReviewsToolbar";
import { ReviewsTypeTabs } from "./ReviewsTypeTabs";

export function ReviewsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // The active tab lives in the URL so a filtered view stays shareable.
    const typeParam = searchParams.get("type");
    const type: ReviewTargetType = isReviewType(typeParam) ? typeParam : DEFAULT_REVIEW_TYPE;

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [rate, setRate] = useState("");
    const [reviewToView, setReviewToView] = useState<Review | null>(null);
    const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

    const debouncedSearch = useDebounce(search, 400);

    const { data, isFetching } = useGetReviews({
        type,
        page,
        per_page: REVIEWS_PER_PAGE,
        search: debouncedSearch || undefined,
        rate: rate ? Number(rate) : undefined,
    });
    const { mutate: deleteReview, isPending: isDeleting, variables: deletingId } = useDeleteReview();

    const reviews = data?.data || [];
    const totalPages = data?.total_pages ?? 0;

    // Every filter change narrows the result set, so the current page can fall
    // out of range — send the user back to the first one.
    const handleTypeChange = (nextType: ReviewTargetType) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("type", nextType);
        router.replace(`${pathname}?${params.toString()}`);
        setPage(1);
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleRateChange = (value: string) => {
        setRate(value);
        setPage(1);
    };

    // The modal stays open until the request resolves, so a failed delete keeps
    // the row in front of the admin to retry.
    const handleConfirmDelete = () => {
        if (!reviewToDelete) return;
        deleteReview(reviewToDelete.id, {
            onSuccess: () => setReviewToDelete(null),
        });
    };

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-c2-neutral-950">إدارة التقييمات</h1>
                <p className="text-sm text-c2-slate-600">
                    مراجعة وحذف تقييمات وتعليقات المستخدمين على مختلف أقسام المنصة
                </p>
            </div>

            <ReviewsTypeTabs value={type} onChange={handleTypeChange} />

            <div className="overflow-hidden rounded-2xl border border-c2-neutral-200 bg-white">
                <ReviewsToolbar
                    search={search}
                    onSearchChange={handleSearchChange}
                    rate={rate}
                    onRateChange={handleRateChange}
                    isFetching={isFetching}
                />

                <ReviewsTable
                    reviews={reviews}
                    type={type}
                    isLoading={isFetching && reviews.length === 0}
                    deletingId={isDeleting ? (deletingId ?? null) : null}
                    onView={setReviewToView}
                    onDelete={setReviewToDelete}
                />

                {totalPages > 1 && (
                    <div className="flex justify-center border-t border-c2-neutral-200 px-4 py-4">
                        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                    </div>
                )}
            </div>

            <ReviewDetailsDialog review={reviewToView} onClose={() => setReviewToView(null)} />

            <ConfirmDeleteModal
                isOpen={reviewToDelete !== null}
                onClose={() => setReviewToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="هل أنت متأكد من حذف التقييم؟"
                description="سيتم حذف التقييم نهائياً. لا يمكن التراجع عن هذا الإجراء."
                confirmPosition="start"
                isLoading={isDeleting}
                autoCloseOnConfirm={false}
            />
        </div>
    );
}
