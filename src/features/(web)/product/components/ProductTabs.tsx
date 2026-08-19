"use client";

import { useRef, useState } from "react";
import { Product, Store, ReviewStatistics } from "../api";
import { useAddProductReview, useGetProductReviews, useGetProductReviewReplies } from "../hooks";
import { useAddStoreReview, useGetStoreReviews, useGetStoreReviewReplies } from "../../stores/hooks";
import { ReviewItem, ReviewsSection, type ReviewSubmitPayload, type SharedReview } from "@/src/components/(web)/reviews";
import { MediaViewer } from "@/src/components/ui/MediaViewer";
import { ReviewStatisticsDisplay } from "./ReviewStatisticsDisplay";
import { SafeHTML } from "@/src/components/ui/SafeHTML";

interface ProductTabsProps {
    product: Product;
    store: Store;
}

export default function ProductTabs({ product, store }: ProductTabsProps) {
    const [activeTab, setActiveTab] = useState<"description" | "reviews">("description");

    return (
        <div className="mt-12 overflow-hidden">
            <div className="flex items-center border-b border-gray-200">
                <button
                    onClick={() => setActiveTab("description")}
                    className={`flex-1 py-4 cursor-pointer text-center font-medium text-sm transition-all duration-300 relative ${activeTab === "description"
                        ? "text-blue-3 bg-[#F8F7FF]"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                >
                    وصف المنتج
                    {activeTab === "description" && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-4" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("reviews")}
                    className={`flex-1 py-4 cursor-pointer text-center font-medium text-sm transition-all duration-300 relative ${activeTab === "reviews"
                        ? "text-blue-3 bg-[#F8F7FF]"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                >
                    تقييم و مراجعات
                    {activeTab === "reviews" && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-4" />
                    )}
                </button>
            </div>

            <div className="p-3 md:p-4 min-h-[300px]">
                {activeTab === "description" ? (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-6">
                        <SafeHTML
                            html={product.description}
                            className="prose prose-lg max-w-none text-gray-700 leading-relaxed font-sans"
                        />
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                        <ProductAndStoreReviews product={product} store={store} />
                    </div>
                )}
            </div>
        </div>
    );
}

function ProductAndStoreReviews({ product, store }: { product: Product; store: Store }) {
    const [subTab, setSubTab] = useState<"product" | "store">("product");

    return (
        <div className="space-y-8">
            <div className="flex gap-4 border-b border-gray-100">
                <button
                    onClick={() => setSubTab("product")}
                    className={`py-2 px-4 cursor-pointer  text-sm font-medium flex items-center gap-2 transition-all ${subTab === "product"
                        ? "border-b-2 border-blue-3"
                        : ""
                        }`}
                >
                    مراجعات لهذا العنصر <div className="bg-blue-4 text-white  rounded-full px-2 py-1 text-xs">{product.review_count || 0}</div>
                </button>
                <button
                    onClick={() => setSubTab("store")}
                    className={`py-2 px-4 cursor-pointer text-sm font-medium transition-all flex items-center gap-2 ${subTab === "store"
                        ? "border-b-2 border-blue-3"
                        : ""
                        }`}
                >
                    مراجعات لهذا المتجر <div className="bg-blue-4 text-white  rounded-full px-2 py-1 text-xs">{store.review_count || 0}</div>
                </button>
            </div>

            {subTab === "product" ? (
                <ProductReviewsSection slug={product.slug} summary={{ count: Number(product.review_count) || 0, rate: Number(product.review_rate) || 0 }} />
            ) : (
                <StoreReviewsSection slug={store.slug} summary={{ count: Number(store.review_count) || 0, rate: Number(store.review_rate) || 0 }} />
            )}
        </div>
    );
}

// function ReviewStatisticsDisplay removed


function ProductReviewsSection({ slug, summary }: { slug: string; summary: { count: number; rate: number } }) {
    const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
    const [mediaViewerState, setMediaViewerState] = useState<{
        isOpen: boolean;
        media: string[];
        index: number;
    }>({ isOpen: false, media: [], index: 0 });

    const [page, setPage] = useState(1);
    const { data, isLoading, refetch: refetchReviews } = useGetProductReviews(slug, page);
    const { mutate: addReview, isPending } = useAddProductReview();

    const handleSubmit = (formData: { content: string; rate: number; images: File[]; parent_id?: number | null }) => {
        return new Promise<void>((resolve, reject) => {
            addReview(
                { slug, payload: { content: formData.content, rate: String(formData.rate), images: formData.images, parent_id: formData.parent_id } },
                {
                    onSuccess: () => {
                        if (formData.parent_id) {
                            setExpandedReplies((prev) => new Set(prev).add(formData.parent_id!));
                        }
                        resolve();
                    },
                    onError: () => reject(),
                }
            );
        });
    };

    const handleToggleReplies = (reviewId: number) => {
        setExpandedReplies((prev) => {
            const next = new Set(prev);
            if (next.has(reviewId)) {
                next.delete(reviewId);
            } else {
                next.add(reviewId);
            }
            return next;
        });
    };

    const openMedia = (media: string[], index: number = 0) => {
        setMediaViewerState({ isOpen: true, media, index });
    };

    const reviews = data?.reviews || [];

    let statistics: ReviewStatistics | undefined;
    if (data?.rate_stats) {
        statistics = {
            total_reviews: data.total || 0,
            average_rate: Number(data.avg_rate) || 0,
            stars: data.rate_stats
        };
    } else if (summary.count > 0) {
        statistics = {
            total_reviews: summary.count,
            average_rate: summary.rate,
            stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };
    }

    return (
        <>
            <ReviewsSection
                stats={statistics && <ReviewStatisticsDisplay stats={statistics} />}
                isLoading={isLoading}
                itemsOnPage={reviews.length}
                total={data?.total}
                page={page}
                setPage={setPage}
                onSubmit={handleSubmit}
                isSubmitting={isPending}
            >
                {reviews.map((review) => (
                    <ProductReviewWithReplies
                        key={review.id}
                        review={review as unknown as SharedReview}
                        slug={slug}
                        onOpenMedia={openMedia}
                        onSubmitReply={handleSubmit}
                        isSubmittingReply={isPending}
                        showReplies={expandedReplies.has(review.id)}
                        onToggleReplies={handleToggleReplies}
                        onReviewChanged={refetchReviews}
                    />
                ))}
            </ReviewsSection>

            {mediaViewerState.isOpen && (
                <MediaViewer
                    isOpen={mediaViewerState.isOpen}
                    onClose={() => setMediaViewerState((prev) => ({ ...prev, isOpen: false }))}
                    media={mediaViewerState.media}
                    initialIndex={mediaViewerState.index}
                />
            )}
        </>
    );
}

function ProductReviewWithReplies({
    review,
    slug,
    onOpenMedia,
    onSubmitReply,
    isSubmittingReply,
    showReplies,
    onToggleReplies,
    onReviewChanged,
}: {
    review: SharedReview;
    slug: string;
    onOpenMedia: (media: string[], index: number) => void;
    onSubmitReply: (data: ReviewSubmitPayload) => Promise<void> | void;
    isSubmittingReply: boolean;
    showReplies: boolean;
    onToggleReplies: (id: number) => void;
    onReviewChanged: () => void;
}) {
    const { data: repliesData, isLoading: isLoadingReplies, refetch: refetchReplies } = useGetProductReviewReplies(
        slug,
        showReplies ? review.id : 0
    );

    const replies = (repliesData?.reviews || []) as unknown as SharedReview[];

    const handleChanged = () => {
        onReviewChanged();
        if (showReplies) refetchReplies();
    };

    return (
        <ReviewItem
            review={review}
            onOpenMedia={onOpenMedia}
            reportType="comment"
            onSubmitReply={onSubmitReply}
            isSubmittingReply={isSubmittingReply}
            showReplies={showReplies}
            onToggleReplies={onToggleReplies}
            replies={replies}
            isLoadingReplies={isLoadingReplies && showReplies}
            onDeleted={handleChanged}
            onUpdated={handleChanged}
        />
    );
}

function StoreReviewsSection({ slug, summary }: { slug: string; summary: { count: number; rate: number } }) {
    const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
    const [mediaViewerState, setMediaViewerState] = useState<{
        isOpen: boolean;
        media: string[];
        index: number;
    }>({ isOpen: false, media: [], index: 0 });

    const [page, setPage] = useState(1);
    const { data, isLoading, refetch: refetchReviews } = useGetStoreReviews(slug, page);
    const { mutate: addReview, isPending } = useAddStoreReview();

    const handleSubmit = (formData: { content: string; rate: number; images: File[]; parent_id?: number | null }) => {
        return new Promise<void>((resolve, reject) => {
            addReview(
                { slug, payload: { content: formData.content, rate: String(formData.rate), images: formData.images, parent_id: formData.parent_id } },
                {
                    onSuccess: () => {
                        if (formData.parent_id) {
                            setExpandedReplies((prev) => new Set(prev).add(formData.parent_id!));
                        }
                        resolve();
                    },
                    onError: () => reject(),
                }
            );
        });
    };

    const handleToggleReplies = (reviewId: number) => {
        setExpandedReplies((prev) => {
            const next = new Set(prev);
            if (next.has(reviewId)) {
                next.delete(reviewId);
            } else {
                next.add(reviewId);
            }
            return next;
        });
    };

    const openMedia = (media: string[], index: number = 0) => {
        setMediaViewerState({ isOpen: true, media, index });
    };

    const reviews = data?.reviews || [];
    let statistics: ReviewStatistics | undefined;
    if (data?.rate_stats) {
        statistics = {
            total_reviews: data.total || 0,
            average_rate: Number(data.avg_rate) || 0,
            stars: data.rate_stats
        };
    } else if (summary.count > 0) {
        statistics = {
            total_reviews: summary.count,
            average_rate: summary.rate,
            stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };
    }

    return (
        <>
            <ReviewsSection
                stats={statistics && <ReviewStatisticsDisplay stats={statistics} />}
                isLoading={isLoading}
                itemsOnPage={reviews.length}
                total={data?.total}
                page={page}
                setPage={setPage}
                onSubmit={handleSubmit}
                isSubmitting={isPending}
            >
                {reviews.map((review) => (
                    <StoreReviewWithReplies
                        key={review.id}
                        review={review as unknown as SharedReview}
                        slug={slug}
                        onOpenMedia={openMedia}
                        onSubmitReply={handleSubmit}
                        isSubmittingReply={isPending}
                        showReplies={expandedReplies.has(review.id)}
                        onToggleReplies={handleToggleReplies}
                        onReviewChanged={refetchReviews}
                    />
                ))}
            </ReviewsSection>

            {mediaViewerState.isOpen && (
                <MediaViewer
                    isOpen={mediaViewerState.isOpen}
                    onClose={() => setMediaViewerState((prev) => ({ ...prev, isOpen: false }))}
                    media={mediaViewerState.media}
                    initialIndex={mediaViewerState.index}
                />
            )}
        </>
    );
}

function StoreReviewWithReplies({
    review,
    slug,
    onOpenMedia,
    onSubmitReply,
    isSubmittingReply,
    showReplies,
    onToggleReplies,
    onReviewChanged,
}: {
    review: SharedReview;
    slug: string;
    onOpenMedia: (media: string[], index: number) => void;
    onSubmitReply: (data: ReviewSubmitPayload) => Promise<void> | void;
    isSubmittingReply: boolean;
    showReplies: boolean;
    onToggleReplies: (id: number) => void;
    onReviewChanged: () => void;
}) {
    const { data: repliesData, isLoading: isLoadingReplies, refetch: refetchReplies } = useGetStoreReviewReplies(
        slug,
        showReplies ? review.id : 0
    );

    const replies = (repliesData?.reviews || []) as unknown as SharedReview[];

    const handleChanged = () => {
        onReviewChanged();
        if (showReplies) refetchReplies();
    };

    return (
        <ReviewItem
            review={review}
            onOpenMedia={onOpenMedia}
            reportType="comment"
            onSubmitReply={onSubmitReply}
            isSubmittingReply={isSubmittingReply}
            showReplies={showReplies}
            onToggleReplies={onToggleReplies}
            replies={replies}
            isLoadingReplies={isLoadingReplies && showReplies}
            onDeleted={handleChanged}
            onUpdated={handleChanged}
        />
    );
}
