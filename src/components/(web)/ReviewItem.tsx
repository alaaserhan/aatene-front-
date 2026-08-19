"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ChevronDown, ChevronUp, Flag, Reply, Trash2, User, PlayCircle } from "lucide-react";
import { StarRating } from "@/src/components/ui/StarRating";
import { ReportAbuse } from "@/src/features/(web)/reports/components/ReportAbuse";
import { ConfirmationDialog } from "@/src/components/ui/ConfirmationDialog";
import { getRelativeTimeArabic } from "@/src/lib/date-helper";
import { useLanguage } from "@/src/hooks/use-language";
import { useUser } from "@/src/auth/session";
import api from "@/src/lib/axios";


export interface SharedReviewUser {
    name: string;
    slug?: string;
    avatar: string | null;
}

export interface SharedReview {
    id: number;
    content: string;
    rate: string | null;
    images: string[];
    user: SharedReviewUser;
    created_at: string;
    parent_id?: number | string | null;
    has_replies?: boolean;
    replies_count?: string | number | null;
}

interface ReviewItemProps {
    review: SharedReview;
    onOpenMedia?: (media: string[], index: number) => void;
    reportType?: "comment" | "store" | "product";
    onReply?: (id: number, userName: string) => void;
    replies?: SharedReview[];
    isLoadingReplies?: boolean;
    onToggleReplies?: (reviewId: number) => void;
    showReplies?: boolean;
    onDeleted?: (reviewId: number) => void;
}

export function ReviewItem({
    review,
    onOpenMedia,
    reportType = "comment",
    onReply,
    replies,
    isLoadingReplies,
    onToggleReplies,
    showReplies,
    onDeleted,
}: ReviewItemProps) {
    const lang = useLanguage();
    const currentUser = useUser();
    const isOwnReview = !!currentUser?.slug && currentUser.slug === review.user.slug;
    const isReply = !!review.parent_id;
    const profileHref = `/${lang}/profile/${review.user.slug || "#"}`;

    const [isDeleted, setIsDeleted] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const { mutate: deleteReview, isPending: isDeleting } = useMutation({
        mutationFn: () => api.delete(`/reviews/${review.id}`),
        onSuccess: () => {
            toast.success("تم حذف التقييم بنجاح");
            setIsDeleted(true);
            onDeleted?.(review.id);
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(error.response?.data?.message || "حدث خطأ أثناء حذف التقييم");
        },
    });

    if (isDeleted) return null;

    return (
        <div>
            <div className={`bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4 ${isReply ? "mr-8 md:mr-16" : ""}`}>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={profileHref}
                            className="relative flex items-center justify-center w-10 h-10 rounded-full overflow-hidden border border-gray-100 hover:opacity-80 transition-opacity"
                        >
                            {
                                review.user.avatar && review.user.avatar !== "" ? (
                                    <Image
                                        src={review.user.avatar}
                                        alt={review.user.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <User
                                        size={20}
                                        className="text-gray-2"
                                    />
                                )
                            }
                        </Link>
                        <div className="flex flex-col">
                            <Link
                                href={profileHref}
                                className="hover:opacity-80 transition-opacity"
                            >
                                <h4 className="text-sm font-medium ">{review.user.name}</h4>
                            </Link>
                            <span className="text-[11px] text-gray-2">{getRelativeTimeArabic(review.created_at)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {review.rate ? (
                            <StarRating rating={parseFloat(review.rate)} size={15} />
                        ) : null}
                    </div>
                </div>

                <p className="text-[14px] text-[#606060] text-right leading-relaxed">
                    {review.content}
                </p>

                {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 ">
                        {review.images.map((img, i) => {
                            const isVideo = img.split('?')[0].match(/\.(mp4|webm|ogg|mov)$/i);
                            return (
                                <div key={i}
                                    onClick={() => onOpenMedia?.(review.images || [], i)}
                                    className="relative w-[80px] h-[80px] rounded-lg overflow-hidden border border-gray-100 cursor-pointer hover:opacity-90 transition-opacity bg-black/5 flex items-center justify-center group"
                                >
                                    {isVideo ? (
                                        <>
                                            <video src={img} className="object-cover w-full h-full" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors pointer-events-none">
                                                <PlayCircle className="text-white w-8 h-8 opacity-80" />
                                            </div>
                                        </>
                                    ) : (
                                        <Image src={img} alt="" fill className="object-contain" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center md:gap-7 gap-4 md:text-[14px] text-[12px] font-medium">
                        {!isReply && (
                            <button
                                onClick={() => onReply?.(review.id, review.user.name)}
                                className="flex items-center gap-1 rounded-full bg-c2-navy-700 px-3 py-1 text-white text-xs font-medium hover:bg-c2-navy-600 transition-colors cursor-pointer"
                            >
                                <Reply size={14} />
                                <span>رد</span>
                            </button>
                        )}
                        {!isReply && review.has_replies && (
                            <button
                                onClick={() => onToggleReplies?.(review.id)}
                                className="flex items-center gap-1 text-blue-4 hover:underline cursor-pointer"
                            >
                                {showReplies ? "إخفاء الردود" : `عرض الردود`}
                                {showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        {isOwnReview && (
                            <button
                                onClick={() => setIsConfirmOpen(true)}
                                disabled={isDeleting}
                                className="flex cursor-pointer items-center gap-1 text-[#d32f2f] text-[12px] font-medium transition-colors hover:text-red-700 disabled:opacity-50"
                            >
                                <Trash2 size={14} />
                                <span>حذف</span>
                            </button>
                        )}
                        {!isOwnReview && (
                            <ReportAbuse type={reportType} id={review.id}>
                                <button className="flex cursor-pointer items-center gap-1 text-[#d32f2f] text-[12px] font-medium transition-colors hover:text-red-700">
                                    <Flag size={14} />
                                    <span>بلغ عن إساءة</span>
                                </button>
                            </ReportAbuse>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmationDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={() => deleteReview()}
                title="حذف التقييم"
                description="هل أنت متأكد من حذف هذا التقييم؟ لا يمكن التراجع عن هذا الإجراء."
            />

            {showReplies && (
                <div className="mt-2 space-y-2">
                    {isLoadingReplies && (
                        <div className="mr-8 md:mr-16 text-sm text-gray-400 py-2">جاري تحميل الردود...</div>
                    )}
                    {replies && replies.map((reply) => (
                        <ReviewItem
                            key={reply.id}
                            review={reply}
                            onOpenMedia={onOpenMedia}
                            reportType={reportType}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
