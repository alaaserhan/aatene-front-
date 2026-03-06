"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronUp, Flag, User } from "lucide-react";
import { StarRating } from "@/src/components/ui/StarRating";
import { ReportAbuse } from "@/src/features/(web)/reports/components/ReportAbuse";
import { getRelativeTimeArabic } from "@/src/lib/date-helper";


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
}: ReviewItemProps) {
    const isReply = !!review.parent_id;

    return (
        <div>
            <div className={`bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4 ${isReply ? "mr-8 md:mr-16" : ""}`}>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/profile/${review.user.slug || "#"}`}
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
                        <Link
                            href={`/profile/${review.user.slug || "#"}`}
                            className="hover:opacity-80 transition-opacity"
                        >
                            <h4 className="text-sm font-medium ">{review.user.name}</h4>
                        </Link>
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
                        {review.images.map((img, i) => (
                            <div key={i}
                                onClick={() => onOpenMedia?.(review.images || [], i)}
                                className="relative w-[80px] h-[80px] rounded-lg overflow-hidden border border-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                            >
                                <Image src={img} alt="" fill className="object-cover" />
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center md:gap-7 gap-4 md:text-[14px] text-[12px] font-medium text-blue-4">
                        <span>{getRelativeTimeArabic(review.created_at)}</span>
                        {!isReply && (
                            <button onClick={() => onReply?.(review.id, review.user.name)} className="hover:underline cursor-pointer">رد</button>
                        )}
                        {!isReply && review.has_replies && (
                            <button
                                onClick={() => onToggleReplies?.(review.id)}
                                className="flex items-center gap-1 hover:underline cursor-pointer"
                            >
                                {showReplies ? "إخفاء الردود" : `عرض الردود`}
                                {showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                        )}
                    </div>
                    <ReportAbuse type={reportType} id={review.id}>
                        <button className="flex cursor-pointer items-center gap-1 text-[#d32f2f] text-[12px] font-medium transition-colors hover:text-red-700">
                            <Flag size={14} />
                            <span>بلغ عن إساءة</span>
                        </button>
                    </ReportAbuse>
                </div>
            </div>

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
