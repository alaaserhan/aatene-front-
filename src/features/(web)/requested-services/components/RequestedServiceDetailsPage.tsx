"use client";

import { useParams } from "next/navigation";
import { useRequestedServiceBySlug, useRequestedServiceComments, useAddRequestedServiceComment } from "../hooks";
import { getRelativeTimeArabic } from "@/src/lib/date-helper";
import { Loader2, Flag, ImageIcon, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { RequestedServiceComment } from "../types";
import { ReportAbuse } from "../../reports/components/ReportAbuse";
import { MediaViewer } from "@/src/components/ui/MediaViewer";

function CommentCard({
    comment,
    onOpenMedia
}: {
    comment: RequestedServiceComment;
    onOpenMedia: (media: string[], index: number) => void;
}) {
    return (
        <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-5 flex flex-col gap-4 relative transition-all hover:bg-gray-50 hover:border-blue-100">
            <div className="flex items-start justify-between gap-4">
                <ReportAbuse type="comment" id={comment.id}>
                    <button
                        className="flex items-center gap-1.5 text-red-500 text-[11px] font-medium hover:underline opacity-60 hover:opacity-100 transition-all px-2 py-1 rounded bg-red-50/50 hover:bg-red-50"
                    >
                        <Flag className="w-3 h-3" />
                        <span>إبلاغ</span>
                    </button>
                </ReportAbuse>

                <div className="flex items-center gap-3 text-right">
                    <div className="flex flex-col items-end">
                        <p className="text-gray-900 text-sm font-semibold">
                            {comment.user.name}
                        </p>
                        {comment.created_at && (
                            <p className="text-gray-400 text-[11px] font-medium">
                                {getRelativeTimeArabic(comment.created_at)}
                            </p>
                        )}
                    </div>
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-white">
                        {comment.user.avatar ? (
                            <Image
                                src={comment.user.avatar}
                                alt={comment.user.name}
                                width={40}
                                height={40}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                                <User className="w-5 h-5" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <p className="text-gray-700 text-sm font-medium leading-relaxed text-right whitespace-pre-wrap">
                {comment.content}
            </p>

            {comment.images && comment.images.length > 0 && (
                <div className="flex gap-2 justify-end flex-wrap mt-1">
                    {comment.images.map((img, i) => (
                        <div
                            key={i}
                            className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity relative group"
                            onClick={() => onOpenMedia(comment.images || [], i)}
                        >
                            <Image
                                src={img}
                                alt=""
                                width={64}
                                height={64}
                                className="object-cover w-full h-full"
                            />
                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function AddCommentForm({ slug }: { slug: string | number }) {
    const [content, setContent] = useState("");
    const { mutate, isPending } = useAddRequestedServiceComment();
    const maxLength = 1000;

    const handleSubmit = () => {
        if (!content.trim() || isPending) return;
        const formData = new FormData();
        formData.append("content", content);
        mutate(
            { slug, payload: formData },
            {
                onSuccess: () => {
                    setContent("");
                },
            }
        );
    };

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-right text-lg font-bold text-gray-900 mb-4">أضف ردك</h3>
            <div className="flex flex-col gap-4">
                <div className="relative">
                    <textarea
                        value={content}
                        onChange={(e) => {
                            if (e.target.value.length <= maxLength) {
                                setContent(e.target.value);
                            }
                        }}
                        placeholder="اكتب تعليقك هنا..."
                        className="w-full min-h-[120px] bg-gray-50 border border-gray-200 rounded-xl p-4 text-right text-gray-800 text-sm font-medium resize-none focus:outline-none focus:border-blue-400 focus:bg-white transition-all placeholder:text-gray-400"
                        dir="rtl"
                    />
                    <div className="absolute bottom-3 left-3 text-xs text-gray-400 font-medium bg-gray-100/80 px-2 py-0.5 rounded-full">
                        {content.length} / {maxLength}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={() => setContent("")}
                        className="text-gray-500 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                        disabled={!content}
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isPending || !content.trim()}
                        className="bg-[#3d5e83] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm shadow-blue-900/10 cursor-pointer"
                    >
                        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isPending ? "جاري النشر..." : "نشر التعليق"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function RequestedServiceDetailsPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const { data: serviceData, isLoading, isError } = useRequestedServiceBySlug(slug);
    const { data: commentsData } = useRequestedServiceComments(slug);

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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-40">
                <Loader2 className="w-10 h-10 animate-spin text-[#3d5e83]" />
            </div>
        );
    }

    if (isError || !serviceData?.record) {
        return (
            <div className="text-center py-40" dir="rtl">
                <p className="text-gray-500 text-lg">عذراً، لم يتم العثور على الخدمة المطلوبة</p>
            </div>
        );
    }

    const { record: service, latestActivity } = serviceData;
    const comments = commentsData?.reviews || [];
    const totalComments = commentsData?.total || 0;

    return (
        <div className="max-w-[1300px] mx-auto w-full px-4 md:px-8 py-8 md:py-12" dir="rtl">
            {mediaViewerState.isOpen && (
                <MediaViewer
                    isOpen={mediaViewerState.isOpen}
                    onClose={closeMedia}
                    media={mediaViewerState.media}
                    initialIndex={mediaViewerState.index}
                />
            )}

            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-normal">
                    {service.title}
                </h1>
                <ReportAbuse type="requested_service" id={service.id}>
                    <button
                        className="flex cursor-pointer items-center gap-2 bg-red-50 text-red-500 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-red-100 transition-colors shrink-0 border border-red-100"
                    >
                        <Flag className="w-4 h-4" />
                        <span>إبلاغ عن المحتوى</span>
                    </button>
                </ReportAbuse>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">

                {/* Main Content (Right in RTL) */}
                <div className="flex-1 w-full flex flex-col gap-8 order-2 lg:order-1">
                    {/* Service Content Card */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm">
                        {/* Author Header */}
                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                            <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
                                {service.user?.avatar_url ? (
                                    <Image
                                        src={service.user.avatar_url}
                                        alt={`${service.user.first_name || ""} ${service.user.last_name || ""}`}
                                        width={56}
                                        height={56}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <User className="w-7 h-7" />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-1 items-start">
                                <p className="text-gray-900 text-base font-bold">
                                    {(service.user?.first_name || service.user?.last_name)
                                        ? `${service.user?.first_name || ""} ${service.user?.last_name || ""}`
                                        : "مستخدم"}
                                </p>
                                {service.user?.is_active && (
                                    <span className="bg-blue-50 text-[#3d5e83] text-[10px] px-2 py-0.5 rounded-full font-bold">
                                        بائع مميز
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Text Content */}
                        <div
                            className="text-gray-700 text-base md:text-lg font-medium leading-[1.8] text-right whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: service.content }}
                        />

                        {/* Attachments */}
                        {service.images_urls && service.images_urls.length > 0 && (
                            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3 items-start">
                                <p className="text-gray-900 text-sm font-bold flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-gray-500" />
                                    المرفقات ({service.images_urls.length})
                                </p>
                                <div className="flex gap-3 flex-wrap">
                                    {service.images_urls.map((imgUrl, i) => (
                                        <div
                                            key={i}
                                            className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden border border-gray-200 cursor-pointer relative group"
                                            onClick={() => openMedia(service.images_urls || [], i)}
                                        >
                                            <Image
                                                src={imgUrl}
                                                alt={`Attachment ${i + 1}`}
                                                width={128}
                                                height={128}
                                                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Comments Section */}
                    <div className="flex flex-col gap-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            التعليقات
                            <span className="text-gray-400 font-medium text-lg">({totalComments})</span>
                        </h2>

                        <div className="flex flex-col gap-4">
                            {comments.map((comment) => (
                                <CommentCard
                                    key={comment.id}
                                    comment={comment}
                                    onOpenMedia={openMedia}
                                />
                            ))}
                            {comments.length === 0 && (
                                <div className="bg-gray-50 rounded-2xl p-8 text-center border border-dashed border-gray-200">
                                    <p className="text-gray-400 font-medium">لا توجد تعليقات حتى الآن. كن أول من يضيف تعليقاً!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Add Comment */}
                    <AddCommentForm slug={slug} />
                </div>

                {/* Sidebar (Left in RTL) */}
                <div className="w-full lg:w-[360px] shrink-0 flex flex-col gap-6 order-1 lg:order-2">

                    {/* Publication Stats */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="text-gray-500 text-sm font-medium">تاريخ النشر</span>
                            <span className="text-gray-900 text-sm font-bold dir-ltr">
                                {getRelativeTimeArabic(service.created_at)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="text-gray-500 text-sm font-medium">عدد التعليقات</span>
                            <span className="text-gray-900 text-sm font-bold">
                                {service.comments_count}
                            </span>
                        </div>
                    </div>

                    {/* Latest Contributions / Activity */}
                    {latestActivity && latestActivity.length > 0 && (
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                <h3 className="text-gray-900 font-bold">آخر المساهمات</h3>
                                {/* Optional: Link to see all if applicable */}
                            </div>
                            <div className="flex flex-col gap-4">
                                {latestActivity.slice(0, 5).map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/requested-services/${item.slug}`}
                                        className="group block p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <h4 className="text-gray-900 font-semibold text-sm line-clamp-1 mb-1 group-hover:text-[#3d5e83] transition-colors">
                                            {item.title}
                                        </h4>
                                        <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
                                            {item.content}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
