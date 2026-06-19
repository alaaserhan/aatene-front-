"use client";

import { useParams } from "next/navigation";
import { useRequestedServiceBySlug, useRequestedServiceComments, useAddRequestedServiceComment } from "../hooks";
import { getRelativeTimeArabic } from "@/src/lib/date-helper";
import { Loader2, Flag, Play, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { RequestedServiceComment } from "../types";
import { ReportAbuse } from "../../reports/components/ReportAbuse";
import { MediaViewer } from "@/src/components/ui/MediaViewer";
import { useAuthStore } from "@/src/stores/auth-store";
import { useLanguage } from "@/src/hooks/use-language";
import { SafeHTML } from "@/src/components/ui/SafeHTML";

function CommentCard({
    comment,
    onOpenMedia
}: {
    comment: RequestedServiceComment;
    onOpenMedia: (media: string[], index: number) => void;
}) {
    const lang = useLanguage();
    const profileHref = comment.user.slug
        ? `/${lang}/profile/${comment.user.slug}`
        : comment.user.id
            ? `/${lang}/profile/${comment.user.id}`
            : `/${lang}/profile`;

    return (
        <div className="bg-blue-5 rounded-lg p-5 flex flex-col gap-4 relative transition-all hover:bg-gray-50 hover:border-blue-100">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 text-right">
                    <Link
                        href={profileHref}
                        className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-100 bg-gray-100 hover:opacity-80 transition-opacity flex items-center justify-center text-gray-400"
                    >
                        {(comment.user.avatar_url && comment.user.avatar_url.trim()) || (comment.user.avatar && comment.user.avatar.trim()) ? (
                            <Image
                                src={comment.user.avatar_url || comment.user.avatar}
                                alt={comment.user.name}
                                width={40}
                                height={40}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <User className="w-5 h-5" />
                        )}
                    </Link>
                    <div className="flex flex-col ">
                        <Link
                            href={profileHref}
                            className="text-blue-4 text-sm font-medium hover:underline transition-colors"
                        >
                            {comment.user.name}
                        </Link>
                        {comment.created_at && (
                            <p className="text-gray-2 text-xs  mt-1">
                                {getRelativeTimeArabic(comment.created_at)}
                            </p>
                        )}
                    </div>
                </div>
                <ReportAbuse type="comment" id={comment.id}>
                    <button
                        className="flex items-center gap-1.5 text-red-500 text-xs font-medium cursor-pointer"
                    >
                        <Flag className="w-3 h-3" />
                        <span>بلغ عن إساءة</span>
                    </button>
                </ReportAbuse>

            </div>

            <p className="text-gray-2 text-sm leading-relaxed  whitespace-pre-wrap">
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
    const maxLength = 300;
    const user = useAuthStore((s) => s.user);

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
        <div className="border border-gray-200 rounded-xl px-5 py-4">
            <div className="bg-blue-5 rounded-xl p-5 flex flex-col gap-3">
                <div className="flex gap-3 items-start">
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                        {(user?.avatar_url && user.avatar_url.trim()) ? (
                            <Image
                                src={user.avatar_url}
                                alt="user"
                                width={45}
                                height={45}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <User className="w-6 h-6" />
                        )}
                    </div>
                    <div className="flex-1">
                        <textarea
                            value={content}
                            onChange={(e) => {
                                if (e.target.value.length <= maxLength) {
                                    setContent(e.target.value);
                                }
                            }}
                            placeholder="أضف تعليقك هنا"
                            className="w-full min-h-[100px] bg-white border border-gray-200 rounded-lg p-4 text-right text-sm resize-none focus:outline-none focus:border-blue-3 transition-colors"
                            dir="rtl"
                        />
                        <p className="text-gray-2 text-xs text-end mt-1.5">
                            {content.length} /{maxLength}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={isPending || !content.trim()}
                        className="bg-blue-3 border border-blue-4 text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {isPending ? "جاري الإرسال..." : "إضافة تعليق"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function RequestedServiceDetailsPage() {
    const params = useParams();
    const lang = useLanguage();
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
        <div className="container mx-auto w-full px-4 md:px-8 my-4 nmd:my-8">
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
                <h1 className="text-2xl md:text-3xl font-medium ">
                    {service.title}
                </h1>
                <ReportAbuse type="requested_service" id={service.id}>
                    <button
                        className="flex cursor-pointer items-center gap-2 bg-red-600 text-white text-xs font-medium px-4 py-2 rounded-md shrink-0 border border-red-100"
                    >
                        <Flag className="w-4 h-4" />
                        <span>بلغ عن إساءة</span>
                    </button>
                </ReportAbuse>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">

                {/* Main Content (Right in RTL) */}
                <div className="flex-1 w-full flex flex-col gap-6 order-2 lg:order-1">
                    {/* Service Content Card */}
                    <div className="bg-[#EBEFF24D]  rounded-xl p-4 ">
                        {/* Author Header */}
                        <div className="flex items-center gap-4 pb-6 ">
                            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                                {(service.user?.avatar_url && service.user.avatar_url.trim()) ? (
                                    <Image
                                        src={service.user.avatar_url}
                                        alt={`${service.user?.first_name || ""} ${service.user?.last_name || ""}`}
                                        width={56}
                                        height={56}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <User className="w-7 h-7" />
                                )}
                            </div>
                            <div className="flex flex-col gap-1 items-start">
                                <p className="text-base font-medium">
                                    {(service.user?.first_name || service.user?.last_name)
                                        ? `${service.user?.first_name || ""} ${service.user?.last_name || ""}`
                                        : "مستخدم"}
                                </p>
                                    <span className="text-gray-2 text-xs font-medium">
                                        بائع مميز
                                    </span>
                            </div>
                        </div>

                        {/* Text Content */}
                        <SafeHTML
                            html={service.content}
                            className=" text-sm  font-medium leading-[1.8] whitespace-pre-wrap"
                        />
                    </div>

                    {/* Attachments Section */}
                    {service.images_urls && service.images_urls.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <h2 className="text-sm font-medium text-blue-3">المرفقات</h2>
                            <div className="">
                                <div className="flex gap-4 flex-wrap">
                                    {service.images_urls.map((imgUrl, i) => (
                                        <div
                                            key={i}
                                            className="w-full sm:w-48 aspect-video rounded-xl overflow-hidden border border-white shadow-sm cursor-pointer relative group"
                                            onClick={() => openMedia(service.images_urls || [], i)}
                                        >
                                            <Image
                                                src={imgUrl}
                                                alt={`Attachment ${i + 1}`}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Comments Section */}
                    <div className="flex flex-col gap-3 mt-8">
                        <h2 className="text-sm font-medium flex items-center gap-2 text-blue-3">
                            التعليقات
                            <span className="font-medium">({totalComments})</span>
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
                                <div className="bg-gray-50 rounded-xl p-8 text-center border border-dashed border-gray-200">
                                    <p className="text-gray-2 font-medium text-sm">لا توجد تعليقات حتى الآن. كن أول من يضيف تعليقاً!</p>
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
                    <div className="bg-[#EBEFF24D] rounded-xl p-6 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[#3d5e83] text-sm font-medium">تاريخ النشر</span>
                            <span className="text-black-1 text-sm ">
                                {getRelativeTimeArabic(service.created_at)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[#3d5e83] text-sm font-medium">عدد التعليقات</span>
                            <span className="text-black-1 text-sm ">
                                {service.comments_count} تعليق
                            </span>
                        </div>
                    </div>

                    {/* Latest Contributions / Activity */}
                    {latestActivity && latestActivity.length > 0 && (
                        <div className="bg-[#EBEFF24D] rounded-xl p-6 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[#3d5e83] text-sm font-medium">آخر المساهمات</h3>
                            </div>
                            <div className="flex flex-col gap-5">
                                {latestActivity.slice(0, 5).map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/${lang}/requested-services/${item.slug}`}
                                        className="group block transition-colors cursor-pointer text-right"
                                    >
                                        <h4 className=" text-sm leading-relaxed group-hover:text-[#3d5e83] transition-colors">
                                            {item.title}
                                        </h4>
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
