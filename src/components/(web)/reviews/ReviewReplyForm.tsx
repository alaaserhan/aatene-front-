"use client";

import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send, X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { buildReplySchema, MAX_CONTENT_LENGTH, REPLY_DEFAULT_RATE, type ReplyFormValues } from "./schema";
import type { ReviewSubmitPayload } from "./types";

interface ReviewReplyFormProps {
    /** Review being replied to */
    parentId: number;
    replyToName: string;
    isSubmitting: boolean;
    onSubmit: (data: ReviewSubmitPayload) => Promise<void> | void;
    onCancel: () => void;
}

/**
 * Compact reply box rendered inline under a review — text only, no rating and
 * no media, so replying never looks like writing a whole new review.
 */
export function ReviewReplyForm({ parentId, replyToName, isSubmitting, onSubmit, onCancel }: ReviewReplyFormProps) {
    const schema = useMemo(() => buildReplySchema(), []);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ReplyFormValues>({
        resolver: zodResolver(schema),
        defaultValues: { content: "" },
        mode: "onSubmit",
        reValidateMode: "onChange",
    });

    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    const { ref: registerRef, ...contentField } = register("content");

    const submit = handleSubmit(async (values) => {
        try {
            await onSubmit({
                content: values.content,
                // Replies reuse the review endpoint, which requires a rating
                rate: REPLY_DEFAULT_RATE,
                images: [],
                parent_id: parentId,
            });
            onCancel();
        } catch {
            // The caller reports the error; keep the draft so nothing is lost.
        }
    });

    return (
        <form onSubmit={submit} className="mt-1 flex flex-col gap-2 rounded-lg bg-c2-neutral-50 p-3">
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-c2-navy-300">الرد على {replyToName}</span>
                <button
                    type="button"
                    onClick={onCancel}
                    aria-label="إلغاء الرد"
                    className="cursor-pointer rounded-full p-1 text-c2-neutral-600 transition-colors hover:bg-c2-neutral-200"
                >
                    <X size={14} />
                </button>
            </div>

            <div className="flex items-end gap-2">
                <textarea
                    {...contentField}
                    ref={(node) => {
                        registerRef(node);
                        textareaRef.current = node;
                    }}
                    rows={2}
                    maxLength={MAX_CONTENT_LENGTH}
                    disabled={isSubmitting}
                    placeholder="اكتب ردك . . ."
                    onKeyDown={(event) => {
                        // Ctrl/⌘+Enter sends, like most inline reply boxes
                        if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) submit();
                    }}
                    className={cn(
                        "min-h-16 flex-1 resize-none rounded-lg border bg-white p-2.5 text-sm outline-none transition-colors",
                        "placeholder:text-c2-navy-300 disabled:bg-c2-neutral-50",
                        errors.content
                            ? "border-c2-danger focus:border-c2-danger"
                            : "border-c2-neutral-200 focus:border-c2-navy-500",
                    )}
                />

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex shrink-0 cursor-pointer items-center gap-1 rounded-full bg-c2-primary px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-c2-navy-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    <span>إرسال</span>
                </button>
            </div>

            {errors.content && <p className="text-xs text-c2-danger">{errors.content.message}</p>}
        </form>
    );
}
