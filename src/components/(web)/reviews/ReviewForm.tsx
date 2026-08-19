"use client";

import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import Image from "next/image";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send, User, X } from "lucide-react";
import { cn, sanitizeMediaUrl } from "@/src/lib/utils";
import { useUser } from "@/src/auth/session";
import { CharCounter } from "@/src/components/ui/CharCounter";
import { RatingInput } from "./RatingInput";
import { ReviewMediaPicker } from "./ReviewMediaPicker";
import {
    buildReviewSchema,
    EMPTY_REVIEW_VALUES,
    MAX_CONTENT_LENGTH,
    type ReviewFormValues,
} from "./schema";
import type { ReviewSubmitPayload } from "./types";

interface ReviewFormProps {
    onSubmit: (data: ReviewSubmitPayload) => Promise<void> | void;
    isSubmitting: boolean;
    /** Called once a submit succeeded and the draft was cleared */
    onSubmitted?: () => void;
    /** When provided, the header shows a close button that calls it */
    onCollapse?: () => void;
}

export interface ReviewFormRef {
    scrollToForm: () => void;
    focusTextarea: () => void;
}

export const ReviewForm = forwardRef<ReviewFormRef, ReviewFormProps>(function ReviewForm(
    { onSubmit, isSubmitting, onSubmitted, onCollapse },
    ref,
) {
    const user = useUser();

    const containerRef = useRef<HTMLElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const schema = useMemo(() => buildReviewSchema(), []);

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ReviewFormValues>({
        resolver: zodResolver(schema),
        defaultValues: EMPTY_REVIEW_VALUES,
        mode: "onSubmit",
        reValidateMode: "onChange",
    });

    const { ref: registerContentRef, ...contentField } = register("content");
    const content = useWatch({ control, name: "content" });

    useImperativeHandle(ref, () => ({
        scrollToForm: () => containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }),
        focusTextarea: () => {
            // Waits for the smooth scroll so the caret doesn't fight the animation
            setTimeout(() => textareaRef.current?.focus(), 400);
        },
    }));

    const submit = handleSubmit(async (values) => {
        try {
            await onSubmit({
                content: values.content,
                rate: values.rate,
                images: values.images,
            });
            reset(EMPTY_REVIEW_VALUES);
            onSubmitted?.();
        } catch {
            // The caller owns error reporting; keep the draft so nothing is lost.
        }
    });

    const avatarUrl = user?.avatar_url || user?.avatar;

    return (
        <section
            ref={containerRef}
            className="w-full overflow-hidden rounded-2xl border border-c2-neutral-200 bg-white shadow-sm"
        >
            <header className="flex items-center gap-3 border-b border-c2-neutral-200 bg-c2-neutral-50 px-4 py-3 sm:px-6">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-c2-neutral-200">
                    {avatarUrl ? (
                        <Image src={sanitizeMediaUrl(avatarUrl)} alt="" fill className="object-cover" />
                    ) : (
                        <User size={20} className="text-c2-neutral-600" />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-c2-neutral-900">شارك تقييمك</h3>
                    <p className="truncate text-xs text-c2-navy-300">رأيك يساعد الآخرين على اتخاذ القرار</p>
                </div>

                {onCollapse && (
                    <button
                        type="button"
                        onClick={onCollapse}
                        aria-label="إغلاق"
                        className="flex cursor-pointer items-center gap-1 rounded-full border border-c2-neutral-200 bg-white px-3 py-1 text-xs font-medium text-c2-neutral-600 transition-colors hover:bg-c2-neutral-50"
                    >
                        <X size={14} />
                        <span>إلغاء</span>
                    </button>
                )}
            </header>

            <form onSubmit={submit} className="flex flex-col gap-5 px-4 py-5 sm:px-6">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-c2-neutral-800">كيف تقيّم تجربتك؟</label>
                    <Controller
                        control={control}
                        name="rate"
                        render={({ field }) => (
                            <RatingInput
                                value={field.value}
                                onChange={field.onChange}
                                disabled={isSubmitting}
                                invalid={!!errors.rate}
                            />
                        )}
                    />
                    {errors.rate && <p className="text-xs text-c2-danger">{errors.rate.message}</p>}
                </div>

                <div className="flex flex-col gap-2">
                    <textarea
                        {...contentField}
                        ref={(node) => {
                            registerContentRef(node);
                            textareaRef.current = node;
                        }}
                        rows={4}
                        maxLength={MAX_CONTENT_LENGTH}
                        disabled={isSubmitting}
                        placeholder="ما الذي أعجبك أو لم يعجبك؟ اكتب مراجعتك . . ."
                        className={cn(
                            "w-full resize-none rounded-xl border bg-white p-4 text-sm leading-relaxed outline-none transition-colors",
                            "placeholder:text-c2-navy-300 disabled:bg-c2-neutral-50",
                            errors.content
                                ? "border-c2-danger focus:border-c2-danger"
                                : "border-c2-neutral-200 focus:border-c2-navy-500",
                        )}
                    />
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-c2-danger">{errors.content?.message}</p>
                        <CharCounter value={content} maxLength={MAX_CONTENT_LENGTH} className="text-c2-navy-300" />
                    </div>
                </div>

                <Controller
                    control={control}
                    name="images"
                    render={({ field }) => (
                        <ReviewMediaPicker
                            files={field.value}
                            onChange={field.onChange}
                            disabled={isSubmitting}
                            error={errors.images?.message}
                        />
                    )}
                />

                <div className="flex justify-end border-t border-c2-neutral-200 pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-c2-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-c2-navy-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />}
                        <span>{isSubmitting ? "جاري الإرسال..." : "إرسال المراجعة"}</span>
                    </button>
                </div>
            </form>
        </section>
    );
});
