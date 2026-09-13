"use client";

import Link from "next/link";
import { Eye, Loader2, Play, Trash2, TriangleAlert, type LucideIcon } from "lucide-react";
import { VideoOrImageNext } from "@/src/components/ui/VideoOrImageNext";
import { formatDate } from "@/src/lib/date-helper";
import { cn, isVideoFile } from "@/src/lib/utils";
import type { Review, ReviewTargetType } from "../api";
import { REVIEW_TYPE_META, getTargetHref } from "../constants";
import { ReviewStars } from "./ReviewStars";

const COLUMN_COUNT = 8;

interface ReviewThumbnailProps {
    review: Review;
    /** Stands in for a review that carries no media of its own. */
    fallbackIcon: LucideIcon;
    onClick: () => void;
}

/**
 * First piece of media attached to the review. Videos get a play glyph rather
 * than an autoplaying preview — ten of those in a table would be wasteful.
 */
function ReviewThumbnail({ review, fallbackIcon: FallbackIcon, onClick }: ReviewThumbnailProps) {
    const [media] = review.images;
    const tileClass =
        "mx-auto flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-c2-navy-50";

    if (!media) {
        return (
            <div className={tileClass}>
                <FallbackIcon aria-hidden="true" className="h-5 w-5 text-c2-navy-700" />
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={`عرض مرفقات التقييم رقم ${review.id}`}
            className={cn(tileClass, "cursor-pointer transition-opacity hover:opacity-80")}
        >
            {isVideoFile(media) ? (
                <Play aria-hidden="true" className="h-4 w-4 fill-c2-navy-700 text-c2-navy-700" />
            ) : (
                <VideoOrImageNext
                    src={media}
                    alt={`مرفق التقييم رقم ${review.id}`}
                    width={40}
                    height={40}
                    className="h-10 w-10"
                    sizes="40px"
                />
            )}
        </button>
    );
}

interface ReviewsTableProps {
    reviews: Review[];
    type: ReviewTargetType;
    isLoading: boolean;
    deletingId: number | null;
    onView: (review: Review) => void;
    onDelete: (review: Review) => void;
}

export function ReviewsTable({
    reviews,
    type,
    isLoading,
    deletingId,
    onView,
    onDelete,
}: ReviewsTableProps) {
    const meta = REVIEW_TYPE_META[type];
    const TargetIcon = meta.icon;

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-c2-navy-50">
                    <tr>
                        <th className="whitespace-nowrap px-4 py-4 text-center text-xs font-semibold">كود التقييم</th>
                        <th className="whitespace-nowrap px-4 py-4 text-center text-xs font-semibold">صورة التقييم</th>
                        <th className="whitespace-nowrap px-4 py-4 text-center text-xs font-semibold">{meta.nameColumn}</th>
                        <th className="whitespace-nowrap px-4 py-4 text-center text-xs font-semibold">الكاتب</th>
                        <th className="whitespace-nowrap px-4 py-4 text-center text-xs font-semibold">التقييم</th>
                        <th className="whitespace-nowrap px-4 py-4 text-center text-xs font-semibold">التعليق</th>
                        <th className="hidden whitespace-nowrap px-4 py-4 text-center text-xs font-semibold sm:table-cell">التاريخ</th>
                        <th className="whitespace-nowrap px-4 py-4 text-center text-xs font-semibold">إجراء</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-c2-neutral-200/60">
                    {isLoading ? (
                        <tr>
                            <td colSpan={COLUMN_COUNT} className="px-4 py-16 text-center">
                                <Loader2 className="mx-auto h-6 w-6 animate-spin text-c2-neutral-450" />
                            </td>
                        </tr>
                    ) : reviews.length === 0 ? (
                        <tr>
                            <td colSpan={COLUMN_COUNT} className="px-4 py-16 text-center text-sm text-c2-neutral-450">
                                لا توجد تقييمات مطابقة
                            </td>
                        </tr>
                    ) : (
                        reviews.map((review) => {
                            const targetHref = review.target
                                ? getTargetHref(review.comment_for_type, review.target.id)
                                : null;
                            const isDeleting = deletingId === review.id;

                            return (
                                <tr
                                    key={review.id}
                                    className={cn(
                                        "transition-colors",
                                        // Flagged rows are what an admin opened this screen for,
                                        // so the whole row carries the signal, not just the text.
                                        review.has_abusive_words
                                            ? "bg-c2-red-500-a10"
                                            : "hover:bg-c2-neutral-50"
                                    )}
                                >
                                    <td className="whitespace-nowrap px-4 py-4 text-center">
                                        <button
                                            type="button"
                                            onClick={() => onView(review)}
                                            className="cursor-pointer text-sm font-medium text-c2-neutral-800 underline decoration-c2-neutral-200 underline-offset-4 transition-colors hover:text-c2-navy-700"
                                        >
                                            #{review.id}
                                        </button>
                                    </td>

                                    <td className="px-4 py-4">
                                        <ReviewThumbnail
                                            review={review}
                                            fallbackIcon={TargetIcon}
                                            onClick={() => onView(review)}
                                        />
                                    </td>

                                    <td className="max-w-40 px-4 py-4 text-center">
                                        {!review.target ? (
                                            <span className="text-sm text-c2-neutral-450">غير معروف</span>
                                        ) : targetHref ? (
                                            <Link
                                                href={targetHref}
                                                title={review.target.name}
                                                className="line-clamp-1 text-sm font-medium text-c2-neutral-800 underline decoration-c2-neutral-200 underline-offset-4 transition-colors hover:text-c2-navy-700"
                                            >
                                                {review.target.name}
                                            </Link>
                                        ) : (
                                            <span
                                                title={review.target.name}
                                                className="line-clamp-1 text-sm font-medium text-c2-neutral-800"
                                            >
                                                {review.target.name}
                                            </span>
                                        )}
                                    </td>

                                    <td className="max-w-40 px-4 py-4 text-center">
                                        {review.user ? (
                                            <Link
                                                href={`/admin/users?userId=${review.user.id}`}
                                                title={review.user.name}
                                                className="line-clamp-1 text-sm font-medium text-c2-neutral-800 underline decoration-c2-neutral-200 underline-offset-4 transition-colors hover:text-c2-navy-700"
                                            >
                                                {review.user.name}
                                            </Link>
                                        ) : (
                                            <span className="text-sm text-c2-neutral-450">مستخدم محذوف</span>
                                        )}
                                    </td>

                                    <td className="px-4 py-4">
                                        <div className="flex justify-center">
                                            <ReviewStars rate={review.rate} />
                                        </div>
                                    </td>

                                    <td className="max-w-50 px-4 py-4">
                                        <div className="flex items-center justify-center gap-1.5">
                                            {review.has_abusive_words && (
                                                <TriangleAlert
                                                    className="h-3.5 w-3.5 shrink-0 text-c2-danger"
                                                    aria-label={`يحتوي على ${review.abusive_words_count} كلمة مسيئة`}
                                                />
                                            )}
                                            <span
                                                title={review.content || undefined}
                                                className={cn(
                                                    "line-clamp-1 text-sm",
                                                    review.has_abusive_words
                                                        ? "font-medium text-c2-danger"
                                                        : "text-c2-neutral-600"
                                                )}
                                            >
                                                {review.content?.trim() || "—"}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="hidden whitespace-nowrap px-4 py-4 text-center sm:table-cell">
                                        <span className="text-sm text-c2-neutral-600" dir="ltr">
                                            {formatDate(review.created_at, "d-M-yyyy")}
                                        </span>
                                    </td>

                                    <td className="px-4 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => onView(review)}
                                                aria-label={`عرض تفاصيل التقييم رقم ${review.id}`}
                                                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-c2-navy-700-a08 text-c2-navy-700 transition-colors hover:bg-c2-navy-100"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onDelete(review)}
                                                disabled={isDeleting}
                                                aria-label={`حذف التقييم رقم ${review.id}`}
                                                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-c2-red-500-a10 text-c2-danger transition-colors hover:bg-c2-danger hover:text-white disabled:opacity-50"
                                            >
                                                {isDeleting ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}
