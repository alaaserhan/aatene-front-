"use client";

import { useRef, useState } from "react";
import { useUserReviews, useAddUserReview, useUserReviewReplies } from "../hooks";
import { ReviewItem, SharedReview } from "@/src/components/(web)/ReviewItem";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { UserReview } from "../types";
import { ReviewForm, ReviewFormRef } from "@/src/components/(web)/ReviewForm";
import { ReviewStatisticsDisplay, ReviewStatisticsData } from "@/src/components/(web)/ReviewStatisticsDisplay";

interface UserReviewsProps {
    userId: number;
}

export default function UserReviews({ userId }: UserReviewsProps) {
    const [page] = useState(1);
    const { data, isLoading, isError, refetch: refetchReviews } = useUserReviews(userId, page);
    const { mutate: addReview, isPending: isAdding } = useAddUserReview();

    const [expandedReviews, setExpandedReviews] = useState<Record<number, boolean>>({});
    const [replyingTo, setReplyingTo] = useState<{ id: number; name: string } | null>(null);
    const formRef = useRef<ReviewFormRef>(null);

    const handleSubmit = async (formData: { content: string; rate: number; images: File[]; parent_id?: number | null }) => {
        const payload = new FormData();
        payload.append("content", formData.content);
        payload.append("rate", formData.rate.toString());
        if (formData.parent_id) {
            payload.append("parent_id", formData.parent_id.toString());
        }

        formData.images.forEach((file) => {
            payload.append("images[]", file);
        });

        return new Promise<void>((resolve, reject) => {
            addReview(
                { userId, data: payload },
                {
                    onSuccess: (data: { status: boolean; message: string }) => {
                        if (data.status) {
                            toast.success("تم إضافة التقييم بنجاح");
                            setReplyingTo(null);
                            resolve();
                        } else {
                            toast.error(data.message || "حدث خطأ ما");
                            reject();
                        }
                    },
                    onError: () => {
                        toast.error("حدث خطأ أثناء إضافة التقييم");
                        reject();
                    }
                }
            );
        });
    };

    const handleToggleReplies = (reviewId: number) => {
        setExpandedReviews(prev => ({ ...prev, [reviewId]: !prev[reviewId] }));
    };

    const handleReply = (id: number, userName: string) => {
        setReplyingTo({ id, name: userName });
        formRef.current?.scrollToForm();
        formRef.current?.focusTextarea();
    };

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    if (isError) return <div className="text-center text-red-500 p-8">حدث خطأ في تحميل التقييمات</div>;

    const reviews = data?.reviews || [];

    const statistics: ReviewStatisticsData | null = data ? {
        total_reviews: data.total,
        average_rate: parseFloat(data.avg_rate) || 0,
        stars: data.rate_stats || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    } : null;

    return (
        <div className="space-y-8">
            {statistics && <ReviewStatisticsDisplay stats={statistics} />}


            <div className="space-y-4">
                {reviews.map((review) => (
                    <ReviewItemWrapper
                    key={review.id}
                    review={review}
                    userId={userId}
                    isExpanded={!!expandedReviews[review.id]}
                    onToggleReplies={handleToggleReplies}
                    onReply={handleReply}
                    reportType="comment"
                    onReviewChanged={refetchReviews}
                    />
                ))}
                <ReviewForm
                    ref={formRef}
                    onSubmit={handleSubmit}
                    isSubmitting={isAdding}
                    parentId={replyingTo?.id}
                    replyToName={replyingTo?.name}
                    onCancelReply={() => setReplyingTo(null)}
                />
            </div>
        </div>
    );
}

function ReviewItemWrapper({
    review,
    userId,
    isExpanded,
    onToggleReplies,
    onReply,
    reportType,
    onReviewChanged,
}: {
    review: UserReview,
    userId: number,
    isExpanded: boolean,
    onToggleReplies: (id: number) => void,
    onReply: (id: number, name: string) => void,
    reportType: "comment" | "store" | "product",
    onReviewChanged: () => void,
}) {
    const { data: repliesData, isLoading: isLoadingReplies, refetch: refetchReplies } = useUserReviewReplies(userId, review.id, { enabled: isExpanded });

    const handleChanged = () => {
        onReviewChanged();
        if (isExpanded) refetchReplies();
    };

    const sharedReview: SharedReview = {
        id: review.id,
        content: review.content,
        rate: review.rate,
        images: review.images,
        user: {
            name: review.user.name,
            avatar: review.user.avatar,
        },
        created_at: review.created_at,
        parent_id: review.parent_id,
        has_replies: review.has_replies,
        replies_count: review.replies_count
    };

    const replies = repliesData?.reviews?.map((r) => ({
        id: r.id,
        content: r.content,
        rate: r.rate,
        images: r.images,
        user: {
            name: r.user.name,
            avatar: r.user.avatar,
        },
        created_at: r.created_at,
        parent_id: r.parent_id,
    })) || [];

    return (
        <ReviewItem
            review={sharedReview}
            onToggleReplies={() => onToggleReplies(review.id)}
            showReplies={isExpanded}
            isLoadingReplies={isLoadingReplies && isExpanded}
            replies={replies}
            onReply={onReply}
            reportType={reportType}
            onDeleted={handleChanged}
            onUpdated={handleChanged}
        />
    );
}
