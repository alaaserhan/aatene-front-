"use client";

import { useRef, useState } from "react";
import { Service } from "../api";
import { Loader2, Plus, Minus } from "lucide-react";
import { useAddServiceReview, useGetServiceReviews, useGetServiceReviewReplies } from "../hooks";
import { ReviewForm, ReviewFormRef } from "@/src/components/(web)/ReviewForm";
import { ReviewItem, SharedReview } from "@/src/components/(web)/ReviewItem";
import { MediaViewer } from "@/src/components/ui/MediaViewer";

interface ServiceTabsProps {
    service: Service;
}

type TabType = "description" | "reviews" | "qa" | "faq";

export default function ServiceTabs({ service }: ServiceTabsProps) {
    const [activeTab, setActiveTab] = useState<TabType>("description");

    const tabs: { id: TabType; label: string }[] = [
        { id: "description", label: "وصف الخدمة" },
        { id: "reviews", label: "تقييم و مراجعات" },
        { id: "qa", label: "اسئلة وأجوبة" },
        { id: "faq", label: "الأسئلة الشائعة" },
    ];

    return (
        <div className="mt-12 overflow-hidden">
            <div className="flex items-center border-b border-gray-200 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 min-w-[120px] py-4 cursor-pointer text-center font-medium text-sm transition-all duration-300 relative whitespace-nowrap ${activeTab === tab.id
                            ? "text-blue-3 bg-[#F8F7FF]"
                            : "text-gray-2 hover:text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-4" />
                        )}
                    </button>
                ))}
            </div>

            <div className="p-3 md:p-4 min-h-[300px]">
                {activeTab === "description" && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-6">
                        <div className="prose prose-lg max-w-none leading-relaxed ">
                            <div dangerouslySetInnerHTML={{ __html: service.description }} />
                        </div>
                    </div>
                )}

                {activeTab === "reviews" && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                        <ServiceReviewsSection service={service} />
                    </div>
                )}

                {activeTab === "faq" && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                        <ServiceFAQ service={service} />
                    </div>
                )}

                {activeTab === "qa" && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300 flex items-center justify-center h-40 text-gray-400">
                        <p>لا توجد أسئلة وأجوبة حالياً</p>
                    </div>
                )}
            </div>
        </div>
    );
}

import { ReviewStatisticsDisplay } from "../../product/components/ReviewStatisticsDisplay";
import { ReviewStatistics } from "../../product/types"; // Import types

function ServiceReviewsSection({ service }: { service: Service }) {
    const formRef = useRef<ReviewFormRef>(null);
    const [parentId, setParentId] = useState<number | null>(null);
    const [replyToName, setReplyToName] = useState<string | null>(null);
    const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
    const [mediaViewerState, setMediaViewerState] = useState<{
        isOpen: boolean;
        media: string[];
        index: number;
    }>({ isOpen: false, media: [], index: 0 });

    const { data, isLoading } = useGetServiceReviews(service.slug);
    const { mutate: addReview, isPending } = useAddServiceReview();

    const handleReply = (id: number, userName: string) => {
        setParentId(id);
        setReplyToName(userName);
        formRef.current?.scrollToForm();
        formRef.current?.focusTextarea();
    };

    const handleCancelReply = () => {
        setParentId(null);
        setReplyToName(null);
    };

    const handleSubmit = (formData: { content: string; rate: number; images: File[]; parent_id?: number | null }) => {
        return new Promise<void>((resolve, reject) => {
            addReview(
                { slug: service.slug, payload: { content: formData.content, rate: String(formData.rate), images: formData.images, parent_id: formData.parent_id } },
                {
                    onSuccess: () => {
                        setParentId(null);
                        setReplyToName(null);
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

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-3" /></div>;

    const reviews = data?.reviews || [];

    // Calculate statistics
    let statistics: ReviewStatistics | undefined;
    if (data?.rate_stats) {
        statistics = {
            total_reviews: data.total || 0,
            average_rate: Number(data.avg_rate) || 0,
            stars: data.rate_stats
        };
    } else {
        statistics = {
            total_reviews: Number(service.review_count) || 0,
            average_rate: Number(service.review_rate) || 0,
            stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };
    }

    return (
        <div className="space-y-6">
            {statistics && <ReviewStatisticsDisplay stats={statistics} />}

            {reviews.length > 0 ? (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <ServiceReviewWithReplies
                            key={review.id}
                            review={review as unknown as SharedReview}
                            serviceSlug={service.slug}
                            onOpenMedia={openMedia}
                            onReply={handleReply}
                            showReplies={expandedReplies.has(review.id)}
                            onToggleReplies={handleToggleReplies}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">لا توجد مراجعات بعد</p>
                </div>
            )}

            {mediaViewerState.isOpen && (
                <MediaViewer
                    isOpen={mediaViewerState.isOpen}
                    onClose={() => setMediaViewerState((prev) => ({ ...prev, isOpen: false }))}
                    media={mediaViewerState.media}
                    initialIndex={mediaViewerState.index}
                />
            )}

            <ReviewForm
                ref={formRef}
                onSubmit={handleSubmit}
                isSubmitting={isPending}
                parentId={parentId}
                replyToName={replyToName}
                onCancelReply={handleCancelReply}
            />
        </div>
    );
}

function ServiceReviewWithReplies({
    review,
    serviceSlug,
    onOpenMedia,
    onReply,
    showReplies,
    onToggleReplies,
}: {
    review: SharedReview;
    serviceSlug: string;
    onOpenMedia: (media: string[], index: number) => void;
    onReply: (id: number, userName: string) => void;
    showReplies: boolean;
    onToggleReplies: (id: number) => void;
}) {
    const { data: repliesData, isLoading: isLoadingReplies } = useGetServiceReviewReplies(
        serviceSlug,
        showReplies ? review.id : 0
    );

    const replies = (repliesData?.reviews || []) as unknown as SharedReview[];

    return (
        <ReviewItem
            review={review}
            onOpenMedia={onOpenMedia}
            reportType="comment"
            onReply={onReply}
            showReplies={showReplies}
            onToggleReplies={onToggleReplies}
            replies={replies}
            isLoadingReplies={isLoadingReplies && showReplies}
        />
    );
}

function ServiceFAQ({ service }: { service: Service }) {
    const questions = service.questions || [];

    // Fallback if no questions (for demo matching image)
    const demoQuestions = [
        { id: 1, question: "مـا هـي خدمـة ”محـام إلـى جانبـك“؟", answer: "هي خدمة تتيح لك الحصول على استشارة قانونية فورية من محام مختص في مختلف المجالات القانونية دون الحاجة لحجز موعد مسبق." },
        { id: 2, question: "ما نوع القضايا التي يمكنني الاستفسار عنها؟", answer: "يمكنك طرح استفساراتك في قضايا مثل: الأحوال الشخصية (الطلاق، الحضانة)، العقود، القضايا العمالية، والمشاكل القانونية الطارئة." },
        { id: 3, question: "هل الاستشارة سرية؟", answer: "نعم، جميع الاستشارات تتم بسرية تامة واحترافية عالية لضمان خصوصيتك." }
    ];

    const displayQuestions = questions.length > 0 ? questions : demoQuestions;

    const [openId, setOpenId] = useState<number | null>(null);

    const toggle = (id: number) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">الأسئلة الشائعة</h3>
                <p className="text-gray-500 text-sm">اكتب إجابات للأسئلة الشائعة التي يطرحها عميلك. أضف حتى خمسة أسئلة.</p>
            </div>

            <div className="divide-y divide-gray-100">
                {displayQuestions.map((q) => (
                    <div key={q.id} className="py-4">
                        <button
                            onClick={() => toggle(q.id)}
                            className="flex items-center justify-between w-full text-right group"
                        >
                            <span className={`font-medium text-lg transition-colors ${openId === q.id ? "text-blue-3" : "text-gray-800 group-hover:text-blue-3"}`}>
                                {q.id}. {q.question}
                            </span>
                            <span className="shrink-0 mr-4">
                                {openId === q.id ? (
                                    <Minus className="w-5 h-5 text-blue-3" />
                                ) : (
                                    <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-3" />
                                )}
                            </span>
                        </button>
                        <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${openId === q.id ? "max-h-[200px] opacity-100 mt-3" : "max-h-0 opacity-0"
                                }`}
                        >
                            <p className="text-gray-600 leading-relaxed pr-4 border-r-2 border-blue-100 mr-1">
                                {q.answer}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
