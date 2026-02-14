"use client";

import { useBlog, useBlogReviews, useAddBlogReview, usePublicBlogs } from "../hooks";
import { Blog, BlogContent, BlogReview } from "../types";
import { BlogCard } from "./BlogCard";
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
    Plus,
    X,
    ChevronLeft,
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

function InteractiveStarRating({
    rating,
    onRate,
    size = 20,
}: {
    rating: number;
    onRate: (val: number) => void;
    size?: number;
}) {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
                <button
                    key={i}
                    type="button"
                    onClick={() => onRate(i + 1)}
                    onMouseEnter={() => setHover(i + 1)}
                    onMouseLeave={() => setHover(0)}
                    className="focus:outline-none"
                >
                    <Star
                        size={size}
                        className={
                            i < (hover || rating)
                                ? "fill-[#FB923C] text-[#FB923C]"
                                : "fill-gray-200 text-gray-200"
                        }
                    />
                </button>
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
                <button className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-[#5b89ba] to-[#3a5c7f] border border-[#5e8cbe] text-white rounded-full h-[25px] text-[11px] font-medium whitespace-nowrap cursor-pointer">
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
    contents: BlogContent[];
    activeIndex: number;
    onSelect: (index: number) => void;
}) {
    return (
        <div className="flex flex-col gap-5">
            <h3 className="text-[20px] font-medium ">في هذه المقالة</h3>
            <div className="flex flex-col gap-2">
                {contents.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => onSelect(index)}
                        className={`text-right pr-5 py-2.5 text-[16px] transition-all border-r-[3px] cursor-pointer ${activeIndex === index
                            ? "border-[#3d22cf] text-[#3d22cf] font-medium"
                            : "border-transparent "
                            }`}
                    >
                        {item.title}
                    </button>
                ))}
            </div>
        </div>
    );
}




// ImageOverlay removed


function ReviewItem({ review, onOpenMedia }: { review: BlogReview; onOpenMedia?: (media: string[], index: number) => void }) {
    const isReply = !!review.parent_id;
    return (
        <div className={`bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4 ${isReply ? "mr-8 md:mr-16" : ""}`}>
            {/* Header: Rating (Left) - User Info (Right) */}
            <div className="flex items-start justify-between">
                {/* User Info (Right) */}
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-100">
                        <Image
                            src={review.user.avatar || "/assets/images/placeholder.jpg"}
                            alt={review.user.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="flex flex-col ">
                        <h4 className="text-sm font-medium ">{review.user.name}</h4>
                    </div>
                </div>
                {/* Rating (Left) */}
                <div className="flex items-center gap-1">
                    {review.rate ? (
                        <>
                            <StarRating rating={parseFloat(review.rate)} size={15} />
                            {/* <span className="text-[12px] font-medium text-gray-500 pt-0.5">({parseFloat(review.rate).toFixed(1)})</span> */}
                        </>
                    ) : null}
                </div>

            </div>

            {/* Content */}
            <p className="text-[14px] text-[#606060] text-right leading-relaxed">
                {review.content}
            </p>

            {/* Images */}
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

            {/* Footer Actions */}
            <div className="flex items-center justify-between mt-1">
                {/* Interactions (Right) */}
                <div className="flex items-center gap-5 text-[14px] font-medium text-blue-4">
                    <span>{getRelativeTimeArabic(review.created_at)}</span>
                    <button className="hover:underline cursor-pointer">رد</button>
                </div>
                {/* Report (Left) */}
                <ReportAbuse type="comment" id={review.id}>
                    <button className="flex cursor-pointer items-center gap-1 text-[#d32f2f] text-[12px] font-medium transition-colors hover:text-red-700">
                        <Flag size={14} />
                        <span>بلغ عن إساءة</span>
                    </button>
                </ReportAbuse>

            </div>
        </div>
    );
}

function ReviewForm({ slug }: { slug: string }) {
    const [content, setContent] = useState("");
    const [rate, setRate] = useState(0);
    const [images, setImages] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const addReview = useAddBlogReview();

    const handleSubmit = () => {
        if (!content.trim()) return;
        const formData = new FormData();
        formData.append("content", content);
        if (rate > 0) formData.append("rate", String(rate));
        images.forEach((file) => formData.append("images[]", file));
        addReview.mutate(
            { slug, data: formData },
            {
                onSuccess: () => {
                    setContent("");
                    setRate(0);
                    setImages([]);
                },
            }
        );
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages((prev) => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-[#f2f2f2] border border-gray-200 rounded-xl p-6 flex gap-5">
            <div className="relative w-[52px] h-[52px] rounded-full overflow-hidden shrink-0">
                <Image
                    src="/assets/images/placeholder.jpg"
                    alt="user"
                    fill
                    className="object-cover"
                />
            </div>
            <div className="flex-1 flex flex-col gap-6">
                <div className=" bg-white/50 border border-gray-200 rounded-lg p-4 min-h-[136px]">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="اكتب مراجعتك . . ."
                        className="w-full h-full min-h-[100px] bg-transparent text-sm  placeholder:text-[#949494] outline-none resize-none"
                    />
                </div>

                <div className="flex items-start gap-2 flex-wrap">
                    {images.map((file, i) => (
                        <div
                            key={i}
                            className="relative w-[100px] h-[100px] rounded-[15px] overflow-hidden border border-dashed border-gray-300"
                        >
                            <Image
                                src={URL.createObjectURL(file)}
                                alt=""
                                fill
                                className="object-cover"
                            />
                            <button
                                onClick={() => removeImage(i)}
                                className="absolute cursor-pointer top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-[100px] h-[100px] rounded-[15px] border border-dashed border-[#046cff] bg-[rgba(166,166,166,0.3)] flex items-center justify-center cursor-pointer"
                    >
                        <div className="bg-[#006cff] rounded-full p-2">
                            <Plus size={24} className="text-white" />
                        </div>
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>

                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <span className="text-sm">تقييماتك:</span>
                        <InteractiveStarRating rating={rate} onRate={setRate} />
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={addReview.isPending}
                        className="bg-gradient-to-b from-[#127fff] to-[#0067ff] text-white rounded-full px-4 py-2 flex items-center gap-1 font-medium text-sm cursor-pointer capitalize disabled:opacity-50"
                    >
                        ارسال    <ChevronLeft size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function BlogDetailsPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [activeContentIndex, setActiveContentIndex] = useState(0);
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
    const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

    const { data: blogData, isLoading, error } = useBlog(slug);
    const { data: reviewsData } = useBlogReviews(slug);
    const { data: relatedData } = usePublicBlogs({ per_page: 4 });

    const blog = blogData?.blog || blogData?.record;
    const reviews = reviewsData?.reviews || [];
    const relatedBlogs = (relatedData?.records || []).filter(
        (b) => b.slug !== slug && b.id !== Number(slug)
    );

    const scrollToContent = (index: number) => {
        setActiveContentIndex(index);
        contentRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
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
                                <h2 className="text-[27px] font-medium  leading-normal">
                                    {section.title}
                                </h2>
                                <div
                                    className="text-sm  leading-[1.5] whitespace-pre-wrap"
                                    dangerouslySetInnerHTML={{ __html: section.paragraph }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Reviews Section */}
                    {reviews.length > 0 && (
                        <div className="flex flex-col gap-4">
                            <h3 className="text-xl font-medium ">التعليقات</h3>
                            <div className="flex flex-col gap-4">
                                {reviews.map((review) => (
                                    <ReviewItem key={review.id} review={review} onOpenMedia={openMedia} />
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
                    <ReviewForm slug={slug} />
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
