"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronUp, Flag, Loader2, Pencil, PlayCircle, Reply, Trash2, User } from "lucide-react";
import { StarRating } from "@/src/components/ui/StarRating";
import { ConfirmationDialog } from "@/src/components/ui/ConfirmationDialog";
import { ReportAbuse } from "@/src/features/(web)/reports/components/ReportAbuse";
import { getRelativeTimeArabic } from "@/src/lib/date-helper";
import { cn, isVideoFile } from "@/src/lib/utils";
import { useLanguage } from "@/src/hooks/use-language";
import { useUser } from "@/src/auth/session";
import { ReviewEditForm } from "./ReviewEditForm";
import { ReviewReplyForm } from "./ReviewReplyForm";
import { useReviewMutations } from "./useReviewMutations";
import type { ReviewEditValues } from "./schema";
import type { ReviewSubmitPayload, SharedReview } from "./types";

interface ReviewItemProps {
    review: SharedReview;
    onOpenMedia?: (media: string[], index: number) => void;
    reportType?: "comment" | "store" | "product";
    /** Enables the inline reply box under this review */
    onSubmitReply?: (data: ReviewSubmitPayload) => Promise<void> | void;
    isSubmittingReply?: boolean;
    replies?: SharedReview[];
    isLoadingReplies?: boolean;
    onToggleReplies?: (reviewId: number) => void;
    showReplies?: boolean;
    onDeleted?: (reviewId: number) => void;
    onUpdated?: (reviewId: number, data: { content: string; rate: string | null }) => void;
}

export function ReviewItem({
    review,
    onOpenMedia,
    reportType = "comment",
    onSubmitReply,
    isSubmittingReply = false,
    replies,
    isLoadingReplies,
    onToggleReplies,
    showReplies,
    onDeleted,
    onUpdated,
}: ReviewItemProps) {
    const lang = useLanguage();
    const currentUser = useUser();

    const isOwnReview = !!currentUser?.slug && currentUser.slug === review.user.slug;
    const isReply = !!review.parent_id;
    const profileHref = `/${lang}/profile/${review.user.slug || "#"}`;

    const [isDeleted, setIsDeleted] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    // Locally applied edits, so the item reflects the change before a refetch lands
    const [edited, setEdited] = useState<ReviewEditValues | null>(null);

    const { remove, update } = useReviewMutations(review.id, {
        currentImages: review.images,
        onDeleted: () => {
            setIsDeleted(true);
            onDeleted?.(review.id);
        },
        onUpdated: (values) => {
            setEdited(values);
            setIsEditing(false);
            onUpdated?.(review.id, { content: values.content, rate: values.rate ? String(values.rate) : null });
        },
    });

    if (isDeleted) return null;

    const content = edited?.content ?? review.content;
    const rate = edited ? edited.rate : review.rate ? parseFloat(review.rate) : 0;
    // Removed media disappears right away; newly uploaded files show up on refetch.
    const images = edited?.keptImages ?? review.images ?? [];
    const repliesCount = Number(review.replies_count) || 0;

    return (
        <div>
            <div
                className={cn(
                    "flex flex-col gap-4 rounded-xl border p-5",
                    // Replies are indented, tinted and marked with a start rail so they
                    // never read as a review of their own
                    isReply
                        ? "ms-8 border-c2-neutral-200 border-s-2 border-s-c2-navy-300 bg-c2-neutral-50 p-4 md:ms-16"
                        : "border-gray-200 bg-white",
                )}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Link
                            href={profileHref}
                            className={cn(
                                "relative flex items-center justify-center overflow-hidden rounded-full border border-gray-100 transition-opacity hover:opacity-80",
                                isReply ? "h-8 w-8" : "h-10 w-10",
                            )}
                        >
                            {review.user.avatar ? (
                                <Image src={review.user.avatar} alt={review.user.name} fill className="object-cover" />
                            ) : (
                                <User size={20} className="text-gray-2" />
                            )}
                        </Link>
                        <div className="flex flex-col">
                            <Link href={profileHref} className="transition-opacity hover:opacity-80">
                                <h4 className="text-sm font-medium">{review.user.name}</h4>
                            </Link>
                            <span className="text-[11px] text-gray-2">{getRelativeTimeArabic(review.created_at)}</span>
                        </div>
                    </div>

                    {!isEditing && !isReply && rate > 0 && <StarRating rating={rate} size={15} />}
                </div>

                {isEditing ? (
                    <ReviewEditForm
                        defaultValues={{ content, rate, keptImages: images, images: [] }}
                        isReply={isReply}
                        isSubmitting={update.isPending}
                        onCancel={() => setIsEditing(false)}
                        onSubmit={(values) => update.mutate(values)}
                    />
                ) : (
                    <>
                        <p className="text-start text-[14px] leading-relaxed text-c2-neutral-600">{content}</p>
                        {images.length > 0 && <ReviewMediaThumbs images={images} onOpenMedia={onOpenMedia} />}
                    </>
                )}

                {!isEditing && (
                    <div className="mt-1 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-4 text-[12px] font-medium md:gap-7 md:text-[14px]">
                            {!isReply && onSubmitReply && (
                                <button
                                    onClick={() => setIsReplying((prev) => !prev)}
                                    className="flex cursor-pointer items-center gap-1 rounded-full bg-c2-navy-700 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-c2-navy-600"
                                >
                                    <Reply size={14} />
                                    <span>رد</span>
                                </button>
                            )}
                            {!isReply && review.has_replies && (
                                <button
                                    onClick={() => onToggleReplies?.(review.id)}
                                    className="flex cursor-pointer items-center gap-1 text-blue-4 hover:underline"
                                >
                                    {showReplies ? "إخفاء الردود" : "عرض الردود"}
                                    {repliesCount > 0 && <span>({repliesCount})</span>}
                                    {showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            {isOwnReview ? (
                                <>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex cursor-pointer items-center gap-1 text-[12px] font-medium text-blue-4 transition-colors hover:text-blue-3"
                                    >
                                        <Pencil size={14} />
                                        <span>تعديل</span>
                                    </button>
                                    <button
                                        onClick={() => setIsConfirmOpen(true)}
                                        disabled={remove.isPending}
                                        className="flex cursor-pointer items-center gap-1 text-[12px] font-medium text-c2-danger transition-colors hover:text-c2-red-800 disabled:opacity-50"
                                    >
                                        {remove.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                        <span>حذف</span>
                                    </button>
                                </>
                            ) : (
                                <ReportAbuse type={reportType} id={review.id}>
                                    <button className="flex cursor-pointer items-center gap-1 text-[12px] font-medium text-c2-danger transition-colors hover:text-c2-red-800">
                                        <Flag size={14} />
                                        <span>بلغ عن إساءة</span>
                                    </button>
                                </ReportAbuse>
                            )}
                        </div>
                    </div>
                )}

                {isReplying && onSubmitReply && (
                    <ReviewReplyForm
                        parentId={review.id}
                        replyToName={review.user.name}
                        isSubmitting={isSubmittingReply}
                        onSubmit={onSubmitReply}
                        onCancel={() => setIsReplying(false)}
                    />
                )}
            </div>

            <ConfirmationDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={() => remove.mutate()}
                title="حذف التقييم"
                description="هل أنت متأكد من حذف هذا التقييم؟ لا يمكن التراجع عن هذا الإجراء."
            />

            {showReplies && (
                <div className="mt-2 space-y-2">
                    {isLoadingReplies && (
                        <div className="ms-8 py-2 text-sm text-gray-400 md:ms-16">جاري تحميل الردود...</div>
                    )}
                    {replies?.map((reply) => (
                        <ReviewItem
                            key={reply.id}
                            review={reply}
                            onOpenMedia={onOpenMedia}
                            reportType={reportType}
                            onDeleted={onDeleted}
                            onUpdated={onUpdated}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function ReviewMediaThumbs({
    images,
    onOpenMedia,
}: {
    images: string[];
    onOpenMedia?: (media: string[], index: number) => void;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {images.map((src, index) => (
                <button
                    key={`${src}-${index}`}
                    type="button"
                    onClick={() => onOpenMedia?.(images, index)}
                    className="group relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-black/5 transition-opacity hover:opacity-90"
                >
                    {isVideoFile(src) ? (
                        <>
                            <video src={src} className="h-full w-full object-cover" preload="metadata" muted />
                            <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
                                <PlayCircle className="h-8 w-8 text-white opacity-80" />
                            </span>
                        </>
                    ) : (
                        <Image src={src} alt="" fill className="object-contain" />
                    )}
                </button>
            ))}
        </div>
    );
}
