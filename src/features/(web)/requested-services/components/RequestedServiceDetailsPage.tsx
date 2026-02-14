"use client";

import { useParams } from "next/navigation";
import { useRequestedServiceBySlug, useRequestedServiceComments, useAddRequestedServiceComment } from "../hooks";
import { getRelativeTimeArabic } from "@/src/lib/date-helper";
import { Loader2, Flag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { RequestedServiceComment } from "../types";

function CommentCard({ comment }: { comment: RequestedServiceComment }) {
    return (
        <div className="bg-blue-5 rounded-[20px] p-5 flex flex-col gap-3 relative">
            <div className="flex items-center gap-3 justify-end">
                <div className="flex flex-col items-end gap-1">
                    <p className="text-blue-2 text-sm font-medium">
                        {comment.user.name}
                    </p>
                    {comment.created_at && (
                        <p className="text-gray-2 text-xs font-medium">
                            {getRelativeTimeArabic(comment.created_at)}
                        </p>
                    )}
                </div>
                <div className="w-[50px] h-[50px] rounded-full overflow-hidden shrink-0">
                    <Image
                        src={comment.user.avatar}
                        alt={comment.user.name}
                        width={50}
                        height={50}
                        className="object-cover w-full h-full"
                    />
                </div>
            </div>

            <Link
                href={`/report/create/review/${comment.id}`}
                className="absolute top-3 left-3 flex items-center gap-1 text-red-1 text-[10px] font-medium hover:underline"
            >
                <span>بلغ عن إساءة</span>
                <Flag className="w-3 h-3" />
            </Link>

            <p className="text-gray-2 text-sm font-medium leading-[1.705] text-right">
                {comment.content}
            </p>

            {comment.images && comment.images.length > 0 && (
                <div className="flex gap-2 justify-end flex-wrap">
                    {comment.images.map((img, i) => (
                        <div key={i} className="w-[80px] h-[80px] rounded-lg overflow-hidden border border-gray-200">
                            <Image
                                src={img}
                                alt=""
                                width={80}
                                height={80}
                                className="object-cover w-full h-full"
                            />
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
        <div className="border border-gray-4 rounded-[14px] px-5 py-4">
            <div className="bg-blue-5 rounded-[10px] p-4 flex flex-col gap-3">
                <div className="flex gap-2 items-start justify-end">
                    <div className="flex-1">
                        <textarea
                            value={content}
                            onChange={(e) => {
                                if (e.target.value.length <= maxLength) {
                                    setContent(e.target.value);
                                }
                            }}
                            placeholder="أضف تعليقك هنا"
                            className="w-full min-h-[100px] bg-white border border-gray-4 rounded p-4 text-right text-gray-2 text-base font-medium resize-none focus:outline-none focus:border-blue-2 transition-colors"
                            dir="rtl"
                        />
                        <p className="text-gray-2 text-sm text-right mt-1">
                            {content.length} / {maxLength}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSubmit}
                        disabled={isPending || !content.trim()}
                        className="bg-blue-3 border border-blue-4 text-white px-3 py-2 rounded-lg text-base font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? "جاري الإرسال..." : "إضافة الإجابة"}
                    </button>
                    <button
                        onClick={() => setContent("")}
                        className="text-blue-2 px-3 py-2 rounded-lg text-base font-medium hover:bg-gray-50 transition-colors"
                    >
                        إغلاق
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-40">
                <Loader2 className="w-10 h-10 animate-spin text-blue-3" />
            </div>
        );
    }

    if (isError || !serviceData?.record) {
        return (
            <div className="text-center py-40" dir="rtl">
                <p className="text-gray-2 text-lg">عذراً، لم يتم العثور على الخدمة المطلوبة</p>
            </div>
        );
    }

    const service = serviceData.record;
    const comments = commentsData?.reviews || [];
    const totalComments = commentsData?.total || 0;

    return (
        <div className="max-w-[1340px] mx-auto w-full px-4 md:px-8 lg:px-[100px] py-8 md:py-12" dir="rtl">
            <div className="flex items-start justify-between gap-4 mb-6">
                <h1 className="text-2xl md:text-[36px] font-medium text-black-1 leading-normal">
                    {service.title}
                </h1>
                <Link
                    href={`/report/create/requested_service/${service.id}`}
                    className="flex items-center gap-1.5 bg-red-1 text-white text-xs font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-colors shrink-0"
                >
                    <span>بلغ عن إساءة</span>
                    <Flag className="w-4 h-4" />
                </Link>
            </div>

            <div className="flex flex-col-reverse lg:flex-row gap-10">
                <div className="lg:w-[392px] shrink-0 flex flex-col gap-10">
                    <div className="bg-blue-6 backdrop-blur-sm rounded-[20px] px-5 py-5">
                        <div className="flex flex-col gap-5">
                            <div className="flex items-center justify-between">
                                <p className="text-black-1 text-sm font-medium">
                                    {getRelativeTimeArabic(service.created_at)}
                                </p>
                                <p className="text-blue-2 text-sm font-medium">
                                    تاريخ النشر
                                </p>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-black-1 text-sm font-medium">
                                    {service.comments_count} تعليق
                                </p>
                                <p className="text-blue-2 text-sm font-medium">
                                    عدد التعليقات
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white-1 backdrop-blur-sm rounded-[20px] px-5 py-5">
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <p className="text-blue-4 text-sm font-medium cursor-pointer hover:underline">
                                    عرض المزيد
                                </p>
                                <p className="text-blue-3 text-sm font-medium">
                                    آخر المساهمات
                                </p>
                            </div>
                            <div className="flex flex-col gap-6 text-sm font-medium text-black-1 text-right leading-[1.7]">
                                {comments.slice(0, 3).map((c) => (
                                    <p key={c.id} className="line-clamp-1">
                                        {c.content}
                                    </p>
                                ))}
                                {comments.length === 0 && (
                                    <p className="text-gray-2 text-sm">لا توجد مساهمات بعد</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col gap-10">
                    <div className="bg-blue-6 rounded-[20px] px-5 py-6">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3 justify-end">
                                <div className="flex flex-col items-end gap-1">
                                    <p className="text-blue-2 text-sm font-medium">
                                        {(service.user?.first_name || service.user?.last_name)
                                            ? `${service.user?.first_name || ""} ${service.user?.last_name || ""}`
                                            : "مستخدم"}
                                    </p>
                                    {service.user?.is_active && (
                                        <p className="text-gray-2 text-xs font-medium">
                                            بائع مميز
                                        </p>
                                    )}
                                </div>
                                <div className="w-[60px] h-[60px] rounded-full overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center border border-gray-200">
                                    {service.user?.avatar_url ? (
                                        <Image
                                            src={service.user.avatar_url}
                                            alt={`${service.user.first_name || ""} ${service.user.last_name || ""}`}
                                            width={60}
                                            height={60}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-gray-400">
                                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                            </div>

                            <div
                                className="text-gray-2 text-base font-medium leading-[30px] text-right whitespace-pre-wrap"
                                dangerouslySetInnerHTML={{ __html: service.content }}
                            />
                        </div>
                    </div>

                    {service.images_urls && service.images_urls.length > 0 && (
                        <div className="flex flex-col gap-3 items-end">
                            <p className="text-blue-2 text-base font-medium w-full text-right">
                                المرفقات
                            </p>
                            <div className="bg-blue-6 rounded-[20px] px-5 py-6 w-full">
                                <div className="flex gap-3 flex-wrap justify-end">
                                    {service.images_urls.map((imgUrl, i) => (
                                        <div
                                            key={i}
                                            className="bg-white-1 border border-gray-4 rounded-[10px] overflow-hidden w-[196px] h-[145px]"
                                        >
                                            <Image
                                                src={imgUrl}
                                                alt=""
                                                width={196}
                                                height={145}
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-12 flex flex-col gap-5">
                <p className="text-blue-2 text-base font-medium text-right">
                    التعليقات ({totalComments})
                </p>

                <div className="flex flex-col gap-5">
                    {comments.map((comment) => (
                        <CommentCard key={comment.id} comment={comment} />
                    ))}
                    {comments.length === 0 && (
                        <p className="text-gray-2 text-sm text-right py-8">لا توجد تعليقات بعد</p>
                    )}
                </div>
            </div>

            <div className="mt-8">
                <AddCommentForm slug={slug} />
            </div>
        </div>
    );
}
