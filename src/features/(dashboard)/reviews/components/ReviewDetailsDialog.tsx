"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { VideoOrImageNext } from "@/src/components/ui/VideoOrImageNext";
import { formatDateTime } from "@/src/lib/date-helper";
import type { Review } from "../api";
import { REVIEW_TYPE_META } from "../constants";
import { ReviewStars } from "./ReviewStars";

interface ReviewDetailsDialogProps {
    review: Review | null;
    onClose: () => void;
}

export function ReviewDetailsDialog({ review, onClose }: ReviewDetailsDialogProps) {
    return (
        <Dialog open={review !== null} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-xl gap-0 rounded-2xl p-0" dir="rtl">
                <DialogHeader className="border-b border-c2-neutral-200 px-6 py-5">
                    <DialogTitle className="text-start text-xl font-bold text-c2-neutral-950">
                        تفاصيل التقييم
                    </DialogTitle>
                </DialogHeader>

                {review && (
                    <div className="space-y-5 px-6 py-6">
                        <dl className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <dt className="text-c2-neutral-450">الكاتب</dt>
                                <dd className="font-bold text-c2-neutral-950">
                                    {review.user?.name || "مستخدم محذوف"}
                                </dd>
                            </div>
                            <div className="space-y-1">
                                <dt className="text-c2-neutral-450">
                                    {REVIEW_TYPE_META[review.comment_for_type]?.nameColumn || "العنصر"}
                                </dt>
                                <dd className="font-bold text-c2-neutral-950">
                                    {review.target?.name || "غير معروف"}
                                </dd>
                            </div>
                            <div className="space-y-1">
                                <dt className="text-c2-neutral-450">التقييم</dt>
                                <dd>
                                    <ReviewStars rate={review.rate} size="md" />
                                </dd>
                            </div>
                            <div className="space-y-1">
                                <dt className="text-c2-neutral-450">التاريخ</dt>
                                <dd className="font-bold text-c2-neutral-950">
                                    {/* dir on the span, not the block: the value stays aligned
                                        with its label while the date itself reads LTR. */}
                                    <span dir="ltr">{formatDateTime(review.created_at)}</span>
                                </dd>
                            </div>
                        </dl>

                        <div className="space-y-2">
                            <p className="text-sm text-c2-neutral-450">نص التقييم</p>
                            <div className="min-h-24 rounded-xl bg-c2-slate-50 p-4 text-sm leading-loose text-c2-neutral-800">
                                {review.content?.trim() || (
                                    <span className="text-c2-neutral-450">لا يوجد نص لهذا التقييم</span>
                                )}
                            </div>
                        </div>

                        {review.images.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm text-c2-neutral-450">المرفقات</p>
                                <div className="flex flex-wrap gap-3">
                                    {review.images.map((src) => (
                                        <div
                                            key={src}
                                            className="relative h-24 w-24 overflow-hidden rounded-xl bg-c2-neutral-50"
                                        >
                                            <VideoOrImageNext
                                                src={src}
                                                alt={`مرفق ضمن تقييم ${review.target?.name || ""}`}
                                                fill
                                                thumb
                                                sizes="96px"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {review.has_abusive_words && (
                            <p className="rounded-xl bg-c2-red-500-a10 px-4 py-3 text-sm font-bold text-c2-danger">
                                يحتوي هذا التقييم على {review.abusive_words_count} كلمة مسيئة
                            </p>
                        )}

                        <Button
                            type="button"
                            onClick={onClose}
                            className="h-13 w-full cursor-pointer rounded-xl bg-c2-neutral-50 text-base font-bold text-c2-neutral-800 shadow-none hover:bg-c2-neutral-200"
                        >
                            إغلاق
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
