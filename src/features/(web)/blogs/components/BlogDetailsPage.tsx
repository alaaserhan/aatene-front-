"use client";

import { useBlog, useBlogReviews, useAddBlogReview, usePublicBlogs } from "../hooks";
import { Blog } from "../types";
import { BlogCard } from "./BlogCard";
import { ReviewForm, ReviewFormRef } from "@/src/components/(web)/ReviewForm";
import { ReviewItem, SharedReview } from "@/src/components/(web)/ReviewItem";
import { getRelativeTimeArabic } from "@/src/lib/date-helper";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState, useRef } from "react";
import {
    Star,
    MessageCircle,
    Heart,
    Link2,
    Flag,
    MessageSquare,
} from "lucide-react";
import { ReportAbuse } from "../../reports/components/ReportAbuse";
import { MediaViewer } from "@/src/components/ui/MediaViewer";

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
    const user = blog.user;
    return (
        <div className="bg-white border border-[#e0dfdc] rounded-xl p-6 flex flex-col items-center gap-4">
            <div className="relative w-[120px] h-[120px] rounded-full overflow-hidden border-2 border-gray-100">
                <Image
                    src={user?.avatar_url || "/assets/images/placeholder.jpg"}
                    alt={`${user?.first_name} ${user?.last_name}`}
                    fill
                    className="object-cover"
                />
            </div>
            <div className="flex flex-col items-center gap-1">
                <h3 className="text-[17px] font-medium text-[#4d4d4d] capitalize">
                    {user?.first_name} {user?.last_name}
                </h3>
                <StarRating rating={4} size={11} />
            </div>
            <p className="text-xs text-gray-2 leading-[17px] text-center">
                {blog.description?.slice(0, 150) || "لا يوجد وصف"}
            </p>
            <div className="flex items-center gap-2 w-full">
                <button className="flex-1 flex items-center justify-center gap-1 bg-linear-to-r from-[#5b89ba] to-[#3a5c7f] border border-[#5e8cbe] text-white rounded-full h-[25px] text-[11px] font-medium whitespace-nowrap cursor-pointer">
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






// ImageOverlay removed


// ReviewItem and ReviewForm removed as they are now imported 
// Also StarRating and InteractiveStarRating are used inside reusable components, 
// so we don't need to redefine them here unless used elsewhere (StarRating is used in Header).
// But Header StarRating is locally defined at top. 
// Reusable components import their own StarRating. 
// We should probably keep local StarRating for Header if it differs, or use reusable one.
// Header uses local StarRating. Let's keep it for now to minimize diff, or better: replace it too.
// The user request was to use reusable components for Reviews.
// I will keep local StarRating for now to avoid breaking Header layout if styles differ slighty, 
// but I will remove local ReviewItem and ReviewForm.

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

    const openMedia = (media: string[], index: number = 0) => {
        setMediaViewerState({ isOpen: true, media, index });
    };

    const closeMedia = () => {
        setMediaViewerState((prev) => ({ ...prev, isOpen: false }));
    };
    const [parentId, setParentId] = useState<number | null>(null);
    const [replyToName, setReplyToName] = useState<string | null>(null);
    const formRef = useRef<ReviewFormRef>(null);
    const addReview = useAddBlogReview();

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
                        setParentId(null);
                        setReplyToName(null);
                        resolve();
                    },
                    onError: () => reject(),
                }
            );
        });
    };

    const { data: blogData, isLoading, error } = useBlog(slug);
    const { data: reviewsData } = useBlogReviews(slug);
    const { data: relatedData } = usePublicBlogs({ per_page: 4 });

    const blog = blogData?.blog || blogData?.record;
    const reviews = reviewsData?.reviews || [];
    const relatedBlogs = (relatedData?.records || []).filter(
        (b) => b.slug !== slug && b.id !== Number(slug)
    );



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
                            <div className="relative">
                                <MessageCircle className="w-6 h-6 text-gray-700" strokeWidth={1.5} />
                                <span className="absolute -top-2 -right-3 bg-[#395a7d] text-white sm:text-[11px] text-[8px] font-normal px-1.5 py-0 rounded-full min-w-[22px] flex items-center justify-center border-2 border-white">
                                    {blog.review_count || "6"}
                                </span>
                            </div>
                            <div className="relative">
                                <Heart className="w-6 h-6 text-gray-700" strokeWidth={1.5} />
                                <span className="absolute -top-2 -right-5 bg-[#395a7d] text-white sm:text-[11px] text-[8px] font-normal px-1.5 py-0 rounded-full min-w-[31px] flex items-center justify-center border-2 border-white">
                                    {blog.favorites_count || "99"}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {/* <span className="text-[24px] text-[rgba(0,0,0,0.8)] tracking-[-0.36px] leading-[30px]">
                                شارك المقاله
                            </span> */}
                            <div className="flex items-center gap-2 px-4">
                                <button className="w-[27px] h-[27px] cursor-pointer flex items-center justify-center border border-[#3c5d80] rounded text-[#3c5d80] hover:bg-[#3c5d80] hover:text-white transition-colors">
                                    <Link2 size={15} />
                                </button>
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
                                <div
                                    className="text-sm  leading-normal whitespace-pre-wrap"
                                    dangerouslySetInnerHTML={{ __html: section.paragraph }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Reviews Section */}
                    {reviews.length > 0 && (
                        <div className="flex flex-col gap-4 mt-8">
                            <h3 className="text-xl font-medium ">التعليقات</h3>
                            <div className="flex flex-col gap-4">
                                {reviews.map((review) => (
                                    <ReviewItem
                                        key={review.id}
                                        review={review as unknown as SharedReview}
                                        onOpenMedia={openMedia}
                                        onReply={handleReply}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {mediaViewerState.isOpen && (
                        <MediaViewer
                            isOpen={mediaViewerState.isOpen}
                            onClose={closeMedia}
                            media={mediaViewerState.media}
                            initialIndex={mediaViewerState.index}
                        />
                    )}

                    {/* Review Form */}
                    <ReviewForm
                        ref={formRef}
                        onSubmit={handleSubmitReview}
                        isSubmitting={addReview.isPending}
                        parentId={parentId}
                        replyToName={replyToName}
                        onCancelReply={handleCancelReply}
                    />
                </div>
                {/* Left Sidebar */}
                <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-16">
                    {/* Author Info Card */}
                    <AuthorCard blog={blog} />

                    {/* Table of Contents */}
                    {/* {blog.content && blog.content.length > 0 && (
                        <TableOfContents
                            contents={blog.content}
                            activeIndex={activeContentIndex}
                            onSelect={scrollToContent}
                        />
                    )} */}

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
