"use client";

import { useBlog, useBlogReviews, useAddBlogReview, usePublicBlogs, useBlogReplies } from "../hooks";
import { Blog } from "../types";
import { BlogCard } from "./BlogCard";
import { ReviewItem, ReviewsSection, type ReviewFormRef, type ReviewSubmitPayload, type SharedReview } from "@/src/components/(web)/reviews";
import { getRelativeTimeArabic } from "@/src/lib/date-helper";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
    Star,
    MessageCircle,
    Heart,
    Link2,
    Flag,
    MessageSquare,
    Store as StoreIcon,
    User as UserIcon,
    Facebook,
    Instagram,
} from "lucide-react";
import { ReportAbuse } from "../../reports/components/ReportAbuse";
import { SafeHTML } from "@/src/components/ui/SafeHTML";
import { MediaViewer } from "@/src/components/ui/MediaViewer";
import { useAddToFavorites, useRemoveFromFavorites } from "@/src/features/(web)/fav/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { blogsKeys } from "../hooks";
import { cn } from "@/src/lib/utils";
import { useAuthStore } from "@/src/stores/auth-store";

const TiktokIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.528 5.845L.057 23.571a.5.5 0 0 0 .615.612l5.83-1.527A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.697-.5-5.248-1.377l-.372-.214-3.863 1.013 1.029-3.763-.229-.381A9.959 9.959 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
    </svg>
);

function StarRating({
    rating,
    maxStars = 5,
    size = 16,
}: {
    rating: number;
    maxStars?: number;
    size?: number;
}) {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: maxStars }).map((_, i) => (
                <Star
                    key={i}
                    size={size}
                    className={
                        i < Math.round(rating)
                            ? "fill-[#FB923C] text-[#FB923C]"
                            : "fill-gray-200 text-gray-200"
                    }
                />
            ))}
        </div>
    );
}



function AuthorCard({ blog }: { blog: Blog }) {
    const isStore = blog.owner_type === "store";
    const authorName = isStore ? blog.store?.name : `${blog.user?.first_name || ""} ${blog.user?.last_name || ""}`.trim();
    const avatarUrl = isStore ? blog.store?.logo_url : blog.user?.avatar_url;
    const description = isStore ? blog.store?.description : blog.user?.bio;

    const router = useRouter();
    const params = useParams();
    const lang = params?.locale || params?.lang || "ar";
    const { user: authUser } = useAuthStore();

    const chatHref = `/${lang}/chat?type=${isStore ? "store" : "user"}&id=${isStore ? blog.store?.id : blog.user?.id}`;

    return (
        <div className="bg-white border border-[#e0dfdc] rounded-xl p-6 flex flex-col items-center gap-4">
            <div className="relative w-[120px] h-[120px] rounded-full overflow-hidden border-2 border-gray-100 flex items-center justify-center bg-gray-50">
                {avatarUrl && avatarUrl !== "" ? (
                    <Image
                        src={avatarUrl}
                        alt={authorName || "Author"}
                        fill
                        className="object-cover"
                    />
                ) : isStore ? (
                    <StoreIcon className="w-14 h-14 text-gray-400" />
                ) : (
                    <UserIcon className="w-14 h-14 text-gray-400" />
                )}
            </div>
            <div className="flex flex-col items-center gap-1">
                <h3 className="text-[17px] font-medium text-[#4d4d4d] capitalize">
                    {authorName || "مستخدم"}
                </h3>
                <StarRating rating={Number(blog.user?.review_rate)} size={11} />
            </div>
            <p className="text-xs text-gray-2 leading-[17px] text-center">
                {description?.slice(0, 150) || "لا يوجد وصف"}
            </p>
            <div className="flex items-center gap-2 w-full">
                <button
                    onClick={() => {
                        if (!authUser) { router.push(`/${lang}/login`); return; }
                        router.push(chatHref);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 bg-linear-to-r from-[#5b89ba] to-[#3a5c7f] border border-[#5e8cbe] text-white rounded-full h-[25px] text-[11px] font-medium whitespace-nowrap cursor-pointer"
                >
                    <MessageSquare size={13} />
                    تواصل معي
                </button>
                {blog.store ? (
                    <ReportAbuse type="store" id={blog.store.id}>
                        <button className="flex cursor-pointer items-center justify-center gap-1 border border-[#b75959] text-[#b75959] rounded-full px-4 h-[25px] text-[11px] font-medium whitespace-nowrap">
                            <Flag size={13} />
                            ابلغ عن إساءة
                        </button>
                    </ReportAbuse>
                ) : (
                    <button className="flex items-center justify-center gap-1 border border-[#b75959] text-[#b75959] rounded-full px-4 h-[25px] text-[11px] font-medium whitespace-nowrap opacity-50 cursor-not-allowed">
                        <Flag size={13} />
                        ابلغ عن إساءة
                    </button>
                )}
            </div>
        </div>
    );
}

function TableOfContents({
    contents,
    activeIndex,
    onSelect,
}: {
    contents: { title: string }[];
    activeIndex: number;
    onSelect: (index: number) => void;
}) {
    return (
        <div className="flex flex-col gap-6 w-full">
            <h3 className="font-semibold font-lg border-b border-transparent pb-1">في هذه المقالة</h3>
            <div className="flex flex-col gap-2">
                {contents.map((content, idx) => (
                    <button
                        key={idx}
                        onClick={() => onSelect(idx)}
                        className={`text-sm text-right py-1 pr-4 border-r-[3px] transition-all duration-300 ${idx === activeIndex
                            ? "border-[#2e2bc2] text-[#2e2bc2] font-semibold"
                            : "border-transparent text-[#444444] hover:text-[#2e2bc2]"
                            }`}
                    >
                        {content.title}
                    </button>
                ))}
            </div>
        </div>
    );
}

function BlogReviewWithReplies({
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
    const { data: repliesData, isLoading: loadingReplies, refetch: refetchReplies } = useBlogReplies(
        showReplies ? slug : "",
        showReplies ? review.id : 0
    );

    const handleChanged = () => {
        onReviewChanged();
        if (showReplies) refetchReplies();
    };

    return (
        <ReviewItem
            review={review}
            onOpenMedia={onOpenMedia}
            onSubmitReply={onSubmitReply}
            isSubmittingReply={isSubmittingReply}
            showReplies={showReplies}
            onToggleReplies={onToggleReplies}
            replies={repliesData?.reviews as unknown as SharedReview[]}
            isLoadingReplies={loadingReplies}
            onDeleted={handleChanged}
            onUpdated={handleChanged}
        />
    );
}

export default function BlogDetailsPage() {
    const params = useParams();
    const slug = params.slug as string;
    const contentRefs = useRef<(HTMLDivElement | null)[]>([]); // Restore contentRefs
    const [mediaViewerState, setMediaViewerState] = useState<{
        isOpen: boolean;
        media: string[];
        index: number;
    }>({
        isOpen: false,
        media: [],
        index: 0,
    });
    const [copied, setCopied] = useState(false);

    const [activeContentIndex, setActiveContentIndex] = useState<number>(0);

    const scrollToContent = (index: number) => {
        setActiveContentIndex(index);
        const ref = contentRefs.current[index];
        if (ref) {
            const top = ref.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top, behavior: "smooth" });
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 120;
            let activeIdx = 0;

            contentRefs.current.forEach((ref, index) => {
                if (!ref) return;
                const top = ref.offsetTop;
                if (scrollPosition >= top) {
                    activeIdx = index;
                }
            });

            setActiveContentIndex(activeIdx);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const openMedia = (media: string[], index: number = 0) => {
        setMediaViewerState({ isOpen: true, media, index });
    };

    const closeMedia = () => {
        setMediaViewerState((prev) => ({ ...prev, isOpen: false }));
    };
    const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());

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
    const formRef = useRef<ReviewFormRef>(null);
    const addReview = useAddBlogReview();

    // Favorites handling
    const addToFavorites = useAddToFavorites();
    const removeFromFavorites = useRemoveFromFavorites();
    const queryClient = useQueryClient();

    const handleToggleFavorite = () => {
        if (!blog) return;

        mutationCallback({ favs_type: "blog", favs_id: String(blog.id) });
    };

    const mutationCallback = (payload: { favs_type: string, favs_id: string }) => {
        if (blog?.is_favorite) {
            removeFromFavorites.mutate(payload, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: blogsKeys.detail(blog.id) });
                    queryClient.invalidateQueries({ queryKey: blogsKeys.detail(slug) });
                }
            });
        } else {
            addToFavorites.mutate(payload, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: blogsKeys.detail(blog!.id) });
                    queryClient.invalidateQueries({ queryKey: blogsKeys.detail(slug) });
                }
            });
        }
    };

    const handleSubmitReview = async (data: { content: string; rate: number; images: File[]; parent_id?: number | null }) => {
        const formData = new FormData();
        formData.append("content", data.content);
        if (data.rate > 0) formData.append("rate", String(data.rate));
        if (data.parent_id) formData.append("parent_id", String(data.parent_id));
        data.images.forEach((file) => formData.append("images[]", file));

        return new Promise<void>((resolve, reject) => {
            addReview.mutate(
                { slug, data: formData },
                {
                    onSuccess: () => {
                        if (data.parent_id) {
                            setExpandedReplies((prev) => new Set(prev).add(data.parent_id!));
                        }
                        resolve();
                    },
                    onError: () => reject(),
                }
            );
        });
    };

    const { data: blogData, isLoading, error } = useBlog(slug);
    const [reviewsPage, setReviewsPage] = useState(1);
    const { data: reviewsData, isLoading: isLoadingReviews, refetch: refetchReviews } = useBlogReviews(slug, { page: reviewsPage });
    const { data: relatedData } = usePublicBlogs({ per_page: 4 });

    const blog = blogData?.blog || blogData?.record;
    const reviews = reviewsData?.reviews || [];
    const relatedBlogs = (relatedData?.records || []).filter(
        (b) => b.slug !== slug && b.id !== Number(slug)
    );

    const handleShare = (platform: string) => {
        if (typeof window === "undefined") return;
        const url = window.location.href;
        const text = blog?.title || "";

        switch (platform) {
            case "facebook":
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
                break;
            case "whatsapp":
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`, "_blank");
                break;
            default:
                navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="text-center py-20 text-red-500">
                حدث خطأ أثناء تحميل المقال
            </div>
        );
    }

    const reviewRate = blog.review_rate ? parseFloat(blog.review_rate) : 0;

    return (
        <div className="container mx-auto px-4 my-4 md:my-6">
            {/* Header Section */}
            <div className="flex flex-col gap-3 mb-4">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1 text-[16px]">
                    <Link href="/" className="text-[#8e8e8e] hover:text-gray-700 transition-colors">
                        الرئيسية
                    </Link>
                    <span className="text-[#717171]">/</span>
                    <Link href="/blogs" className="text-[#717171] hover:text-gray-700 transition-colors">
                        المقالات
                    </Link>
                </div>

                {/* Title */}
                <h1 className="text-2xl md:text-3xl font-medium text-black leading-[36px] md:leading-[56px] tracking-[-0.72px] text-right w-full">
                    {blog.title}
                </h1>

                {/* Meta: Date + Rating */}
                <div className="flex items-center gap-3 text-[16px] text-[#8e8e8e]">
                    <div className="flex items-center gap-2">
                        <StarRating rating={reviewRate} size={16} />
                        <span className="text-[#414141] text-[14px]">({reviewRate.toFixed(1)})</span>
                    </div>
                    <span>|</span>
                    <span>{getRelativeTimeArabic(blog.created_at)}</span>
                </div>
            </div>

            {/* Main Two-Column Layout */}
            <div className="flex flex-col lg:flex-row gap-12">
                {/* Right Main Content */}
                <div className="flex-1 flex flex-col gap-8">
                    {/* Hero Image */}
                    <div className="relative w-full h-[300px] md:h-[552px] rounded-xl overflow-hidden">
                        <Image
                            src={blog.thumbnail_url || "/assets/images/placeholder.jpg"}
                            alt={blog.title}
                            fill
                            className="object-cover"
                        />
                    </div>

                    {/* Share + Actions Bar */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <div
                                className="relative right-2 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => {
                                    formRef.current?.scrollToForm();
                                    formRef.current?.focusTextarea();
                                }}
                            >
                                <MessageCircle className="w-6 h-6 text-gray-700" strokeWidth={1.5} />
                                <span className="absolute pt-1 -top-2 -right-3 bg-[#395a7d] text-white sm:text-[11px] text-[8px] font-normal px-1.5 py-0 rounded-full min-w-[25px] flex items-center justify-center border-2 border-white">
                                    {blog.review_count || "0"}
                                </span>
                            </div>
                            <div
                                className="relative cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={handleToggleFavorite}
                            >
                                <Heart
                                    className={cn("w-6 h-6 transition-colors", blog.is_favorite ? "fill-red-500 text-red-500" : "text-gray-700")}
                                    strokeWidth={1.5}
                                />
                                <span className="absolute pt-1 -top-2 -right-4 bg-[#395a7d] text-white sm:text-[11px] text-[8px] font-normal px-1.5 py-0 rounded-full min-w-[25px] flex items-center justify-center border-2 border-white">
                                    {blog.favorites_count || "0"}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[15px] hidden sm:block pt-2 md:text-[18px] text-[rgba(0,0,0,0.8)] tracking-[-0.36px] font-medium leading-[30px]">
                                شارك المقال
                            </span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleShare("tiktok")} className="w-[27px] h-[27px] cursor-pointer flex items-center justify-center border border-[#3c5d80] rounded text-[#3c5d80] hover:bg-[#3c5d80] hover:text-white transition-colors">
                                    <TiktokIcon className="w-[15px] h-[15px]" />
                                </button>
                                <button onClick={() => handleShare("instagram")} className="w-[27px] h-[27px] cursor-pointer flex items-center justify-center border border-[#3c5d80] rounded text-[#3c5d80] hover:bg-[#3c5d80] hover:text-white transition-colors">
                                    <Instagram size={15} />
                                </button>
                                <button onClick={() => handleShare("facebook")} className="w-[27px] h-[27px] cursor-pointer flex items-center justify-center border border-[#3c5d80] rounded text-[#3c5d80] hover:bg-[#3c5d80] hover:text-white transition-colors">
                                    <Facebook size={15} />
                                </button>
                                <button onClick={() => handleShare("whatsapp")} className="w-[27px] h-[27px] cursor-pointer flex items-center justify-center border border-[#3c5d80] rounded text-[#3c5d80] hover:bg-[#3c5d80] hover:text-white transition-colors">
                                    <WhatsAppIcon className="w-[15px] h-[15px]" />
                                </button>
                                <div className="relative">
                                    <button onClick={() => handleShare("link")} className="w-[27px] h-[27px] cursor-pointer flex items-center justify-center border border-[#3c5d80] rounded text-[#3c5d80] hover:bg-[#3c5d80] hover:text-white transition-colors">
                                        <Link2 size={15} />
                                    </button>
                                    {copied && (
                                        <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-[#395a7d] text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            تم النسخ
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Article Body - Paragraphs */}
                    <div className="flex flex-col gap-8">
                        {blog.content?.map((section, index) => (
                            <div
                                key={index}
                                ref={(el) => {
                                    contentRefs.current[index] = el;
                                }}
                                className="flex flex-col gap-5 text-right"
                            >
                                <h2 className="text-lg font-medium  leading-normal">
                                    {section.title}
                                </h2>
                                <SafeHTML
                                    html={section.paragraph}
                                    className="text-sm  leading-normal whitespace-pre-wrap"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Comments: composer on top, then the paginated list */}
                    <div className="mt-8 flex flex-col gap-4">
                        <h3 className="text-xl font-medium">التعليقات</h3>
                        <ReviewsSection
                            isLoading={isLoadingReviews}
                            itemsOnPage={reviews.length}
                            total={reviewsData?.total}
                            page={reviewsPage}
                            setPage={setReviewsPage}
                            emptyMessage="لا توجد تعليقات بعد — كن أول من يعلّق"
                            composerRef={formRef}
                            onSubmit={handleSubmitReview}
                            isSubmitting={addReview.isPending}
                        >
                            {reviews.map((review) => (
                                <BlogReviewWithReplies
                                    key={review.id}
                                    review={review as unknown as SharedReview}
                                    slug={slug}
                                    onOpenMedia={openMedia}
                                    onSubmitReply={handleSubmitReview}
                                    isSubmittingReply={addReview.isPending}
                                    showReplies={expandedReplies.has(review.id)}
                                    onToggleReplies={handleToggleReplies}
                                    onReviewChanged={refetchReviews}
                                />
                            ))}
                        </ReviewsSection>
                    </div>

                    {mediaViewerState.isOpen && (
                        <MediaViewer
                            isOpen={mediaViewerState.isOpen}
                            onClose={closeMedia}
                            media={mediaViewerState.media}
                            initialIndex={mediaViewerState.index}
                        />
                    )}
                </div>
                {/* Left Sidebar */}
                <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-16">
                    {/* Author Info Card */}
                    <AuthorCard blog={blog} />

                    {/* Table of Contents */}
                    {blog.content && blog.content.length > 0 && (
                        <div className="border border-[#e0dfdc] rounded-xl p-4 hidden lg:flex">
                            <TableOfContents
                                contents={blog.content}
                                activeIndex={activeContentIndex}
                                onSelect={scrollToContent}
                            />
                        </div>
                    )}

                    {/* Related Articles */}
                    {relatedBlogs.length > 0 && (
                        <div className="flex flex-col gap-4">
                            <h3 className="text-lg font-medium ">
                                اشهر المقالات
                            </h3>
                            <div className="flex flex-col gap-5">
                                {relatedBlogs.slice(0, 4).map((relBlog) => (
                                    <BlogCard key={relBlog.id} blog={relBlog} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>


            </div>
        </div>
    );
}
