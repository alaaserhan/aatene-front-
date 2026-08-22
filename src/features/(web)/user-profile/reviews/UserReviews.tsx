"use client";

import { useState } from "react";
import { useUserReviews, useAddUserReview, useUserReviewReplies } from "../hooks";
import { ReviewItem, ReviewsSection, type ReviewSubmitPayload, type SharedReview } from "@/src/components/(web)/reviews";
import { toast } from "sonner";
import { UserReview } from "../types";
import { ReviewStatisticsDisplay, ReviewStatisticsData } from "@/src/components/(web)/ReviewStatisticsDisplay";

interface UserReviewsProps {
    userId: number;
}

export default function UserReviews({ userId }: UserReviewsProps) {
    const [page, setPage] = useState(1);
    const { data, isLoading, isError, refetch: refetchReviews } = useUserReviews(userId, page);
    const { mutate: addReview, isPending: isAdding } = useAddUserReview();

    const [expandedReviews, setExpandedReviews] = useState<Record<number, boolean>>({});

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

    if (isError) return <div className="text-center text-red-500 p-8">حدث خطأ في تحميل التقييمات</div>;

    const reviews = data?.reviews || [];

    const statistics: ReviewStatisticsData | null = data ? {
        total_reviews: data.total,
        average_rate: parseFloat(data.avg_rate) || 0,
        stars: data.rate_stats || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    } : null;

    return (
        <ReviewsSection
            stats={statistics && <ReviewStatisticsDisplay stats={statistics} />}
            isLoading={isLoading}
            itemsOnPage={reviews.length}
            total={data?.total}
            page={page}
            setPage={setPage}
            onSubmit={handleSubmit}
            isSubmitting={isAdding}
        >
            {reviews.map((review) => (
                <ReviewItemWrapper
                    key={review.id}
                    review={review}
                    userId={userId}
                    isExpanded={!!expandedReviews[review.id]}
                    onToggleReplies={handleToggleReplies}
                    onSubmitReply={handleSubmit}
                    isSubmittingReply={isAdding}
                    reportType="comment"
                    onReviewChanged={refetchReviews}
                />
            ))}
        </ReviewsSection>
    );
}

function ReviewItemWrapper({
    review,
    userId,
    isExpanded,
    onToggleReplies,
    onSubmitReply,
    isSubmittingReply,
    reportType,
    onReviewChanged,
}: {
    review: UserReview,
    userId: number,
    isExpanded: boolean,
    onToggleReplies: (id: number) => void,
    onSubmitReply: (data: ReviewSubmitPayload) => Promise<void> | void,
    isSubmittingReply: boolean,
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
            // Required for ReviewItem to detect the author and show edit/delete
            slug: review.user.slug,
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
            slug: r.user.slug,
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
            onSubmitReply={onSubmitReply}
            isSubmittingReply={isSubmittingReply}
            reportType={reportType}
            onDeleted={handleChanged}
            onUpdated={handleChanged}
        />
    );
}
