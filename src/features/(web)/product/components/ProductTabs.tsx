"use client";

import { useState } from "react";
import { Product, Store, ReviewStatistics } from "../api";
import { useAddProductReview, useGetProductReviews, useGetProductReviewReplies } from "../hooks";
import { useAddStoreReview, useGetStoreReviews, useGetStoreReviewReplies } from "../../stores/hooks";
import { ReviewItem, ReviewsSection, type ReviewSubmitPayload, type SharedReview } from "@/src/components/(web)/reviews";
import { Container } from "@/src/components/shared/Container";
import { MediaViewer } from "@/src/components/ui/MediaViewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { ReviewStatisticsDisplay } from "./ReviewStatisticsDisplay";
import { SafeHTML } from "@/src/components/ui/SafeHTML";

interface ProductTabsProps {
    product: Product;
    store: Store;
}

type TabType = "description" | "reviews";

export default function ProductTabs({ product, store }: ProductTabsProps) {
    const [activeTab, setActiveTab] = useState<TabType>("description");

    const tabs: { id: TabType; label: string }[] = [
        { id: "description", label: "وصف المنتج" },
        { id: "reviews", label: "تقييم و مراجعات" },
    ];

    // Full-bleed on purpose: the triggers sit on the same tinted band as the hero
    // while the panels sit on the white band, so each half brings its own
    // background and Container.
    return (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)}>
            <div className="bg-c2-neutral-50">
                <Container className="pb-6 lg:pt-9">
                    <TabsList className="w-full max-w-full justify-start overflow-x-auto">
                        {tabs.map((tab) => (
                            <TabsTrigger key={tab.id} value={tab.id} className="min-w-30">
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Container>
            </div>

            <div className="bg-white shadow-md">
                <Container className="pt-8 pb-8 lg:pb-20">
                    <TabsContent value="description" className="min-h-75">
                        <h3 className="mb-4 text-lg font-bold text-c2-navy-1000">وصف المنتج</h3>
                        <SafeHTML
                            html={product.description}
                            className="prose prose-lg max-w-none leading-relaxed text-black text-base font-normal"
                        />
                    </TabsContent>

                    <TabsContent value="reviews" className="min-h-75">
                        <ProductAndStoreReviews product={product} store={store} />
                    </TabsContent>
                </Container>
            </div>
        </Tabs>
    );
}

type ReviewsSubTab = "product" | "store";

function ProductAndStoreReviews({ product, store }: { product: Product; store: Store }) {
    const [subTab, setSubTab] = useState<ReviewsSubTab>("product");

    return (
        <Tabs
            value={subTab}
            onValueChange={(value) => setSubTab(value as ReviewsSubTab)}
            className="gap-8"
        >
            <TabsList className="max-w-full justify-start overflow-x-auto">
                <TabsTrigger value="product">
                    مراجعات لهذا العنصر
                    <ReviewCountBadge count={product.review_count} isActive={subTab === "product"} />
                </TabsTrigger>
                <TabsTrigger value="store">
                    مراجعات لهذا المتجر
                    <ReviewCountBadge count={store.review_count} isActive={subTab === "store"} />
                </TabsTrigger>
            </TabsList>

            <TabsContent value="product">
                <ProductReviewsSection slug={product.slug} summary={{ count: Number(product.review_count) || 0, rate: Number(product.review_rate) || 0 }} />
            </TabsContent>

            <TabsContent value="store">
                <StoreReviewsSection slug={store.slug} summary={{ count: Number(store.review_count) || 0, rate: Number(store.review_rate) || 0 }} />
            </TabsContent>
        </Tabs>
    );
}

function ReviewCountBadge({ count, isActive }: { count?: string | number | null; isActive: boolean }) {
    return (
        <span
            className={
                isActive
                    ? "rounded-full bg-white px-2 py-0.5 text-xs text-c2-navy-700"
                    : "rounded-full bg-c2-neutral-200 px-2 py-0.5 text-xs text-c2-neutral-700"
            }
        >
            {count || 0}
        </span>
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
