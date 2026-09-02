"use client";

import { useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { CharCounter } from "@/src/components/ui/CharCounter";
import { RatingInput } from "./RatingInput";
import { ReviewMediaPicker } from "./ReviewMediaPicker";
import { buildReviewEditSchema, MAX_CONTENT_LENGTH, REPLY_DEFAULT_RATE, type ReviewEditValues } from "./schema";

interface ReviewEditFormProps {
    defaultValues: ReviewEditValues;
    isReply: boolean;
    isSubmitting: boolean;
    onCancel: () => void;
    onSubmit: (values: ReviewEditValues) => void;
}

/** Inline editor shown in place of a review's body when its author edits it. */
export function ReviewEditForm({ defaultValues, isReply, isSubmitting, onCancel, onSubmit }: ReviewEditFormProps) {
    const schema = useMemo(() => buildReviewEditSchema(isReply), [isReply]);

    const {
        register,
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<ReviewEditValues>({
        resolver: zodResolver(schema),
        defaultValues,
        mode: "onSubmit",
        reValidateMode: "onChange",
    });

    const content = useWatch({ control, name: "content" });
    const keptImages = useWatch({ control, name: "keptImages" });

    const submit = handleSubmit((values) =>
        onSubmit({ ...values, rate: isReply ? values.rate || REPLY_DEFAULT_RATE : values.rate }),
    );

    return (
        <form onSubmit={submit} className="flex flex-col gap-3">
            {!isReply && (
                <div className="flex flex-col gap-1">
                    <Controller
                        control={control}
                        name="rate"
                        render={({ field }) => (
                            <RatingInput
                                value={field.value}
                                onChange={field.onChange}
                                size={20}
                                disabled={isSubmitting}
                                invalid={!!errors.rate}
                            />
                        )}
                    />
                    {errors.rate && <p className="text-xs text-c2-danger">{errors.rate.message}</p>}
                </div>
            )}

            <div className="flex flex-col gap-1">
                <textarea
                    {...register("content")}
                    rows={3}
                    autoFocus
                    maxLength={MAX_CONTENT_LENGTH}
                    disabled={isSubmitting}
                    className={cn(
                        "w-full resize-none rounded-lg border bg-white p-3 text-sm leading-relaxed text-c2-neutral-600 outline-none transition-colors",
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
                        existing={keptImages}
                        onRemoveExisting={(url) =>
                            setValue(
                                "keptImages",
                                keptImages.filter((kept) => kept !== url),
                                { shouldValidate: true },
                            )
                        }
                        disabled={isSubmitting}
                        error={errors.images?.message}
                    />
                )}
            />

            <div className="flex items-center justify-end gap-2">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="flex cursor-pointer items-center gap-1 rounded-full border border-c2-neutral-200 px-3 py-1.5 text-xs font-medium text-c2-neutral-600 transition-colors hover:bg-c2-neutral-50 disabled:opacity-50"
                >
                    <X size={14} />
                    <span>إلغاء</span>
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex cursor-pointer items-center gap-1 rounded-full bg-c2-primary px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-c2-navy-600 disabled:opacity-50"
                >
                    {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                    <span>{isSubmitting ? "جاري الحفظ..." : "حفظ"}</span>
                </button>
            </div>
        </form>
    );
}
