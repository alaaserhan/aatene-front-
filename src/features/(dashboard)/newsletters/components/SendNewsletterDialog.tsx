"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/src/components/ui/dialog";
import { RichTextEditor } from "@/src/components/ui/RichTextEditor";
import { cn } from "@/src/lib/utils";
import { formatSubscriberCount } from "../constants";

interface SendNewsletterDialogProps {
    isOpen: boolean;
    recipientCount: number;
    isSending: boolean;
    onClose: () => void;
    onSend: (payload: { subject: string; content: string }) => void;
}

/** An editor body of only markup and whitespace still counts as empty. */
function isBlankHtml(html: string): boolean {
    return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().length === 0;
}

type SendNewsletterFormProps = Pick<
    SendNewsletterDialogProps,
    "recipientCount" | "isSending" | "onSend"
>;

/**
 * Lives inside DialogContent on purpose: Radix unmounts it on close, so every
 * open starts from a blank draft. A leftover body sent to a different set of
 * subscribers is the expensive mistake on this screen.
 */
function SendNewsletterForm({ recipientCount, isSending, onSend }: SendNewsletterFormProps) {
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [errors, setErrors] = useState<{ subject?: string; content?: string }>({});

    const handleSubmit = () => {
        const nextErrors: { subject?: string; content?: string } = {};

        if (!subject.trim()) nextErrors.subject = "العنوان مطلوب";
        if (isBlankHtml(content)) nextErrors.content = "المحتوى مطلوب";

        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        onSend({ subject: subject.trim(), content });
    };

    return (
        <>
            <div className="min-w-0 space-y-5">
                <div className="space-y-2">
                    <label
                        htmlFor="newsletter-subject"
                        className="block text-sm font-medium text-c2-neutral-950"
                    >
                        العنوان
                        <span className="ms-1 text-c2-danger">*</span>
                    </label>
                    <input
                        id="newsletter-subject"
                        type="text"
                        value={subject}
                        onChange={(event) => {
                            setSubject(event.target.value);
                            if (errors.subject) setErrors((prev) => ({ ...prev, subject: undefined }));
                        }}
                        placeholder="اكتب عنوان البريد..."
                        className={cn(
                            "h-12 w-full rounded-lg border bg-white px-4 text-sm text-c2-neutral-800 outline-none transition-colors placeholder:text-c2-neutral-450 focus:border-c2-navy-300",
                            errors.subject ? "border-c2-danger" : "border-c2-neutral-200"
                        )}
                    />
                    {errors.subject && <p className="text-xs text-c2-danger">{errors.subject}</p>}
                </div>

                <RichTextEditor
                    value={content}
                    onChange={(next) => {
                        setContent(next);
                        if (errors.content) setErrors((prev) => ({ ...prev, content: undefined }));
                    }}
                    label="المحتوى"
                    required
                    placeholder="ابدأ بكتابة محتوى البريد الإلكتروني هنا..."
                    helpTooltip=""
                    error={errors.content}
                    className="h-80"
                />
            </div>

            <DialogFooter className="gap-2 sm:flex-row-reverse sm:justify-start">
                <Button
                    type="button"
                    size="md"
                    onClick={handleSubmit}
                    disabled={isSending}
                    className="min-w-32"
                >
                    {isSending && <Loader2 className="h-4 w-4 animate-spin" />}
                    إرسال
                </Button>
                <span className="self-center text-xs text-c2-neutral-450">
                    سيصل البريد إلى {formatSubscriberCount(recipientCount)}
                </span>
            </DialogFooter>
        </>
    );
}

export function SendNewsletterDialog({
    isOpen,
    recipientCount,
    isSending,
    onClose,
    onSend,
}: SendNewsletterDialogProps) {
    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open && !isSending) onClose();
            }}
        >
            <DialogContent
                className="max-h-[92vh] max-w-2xl gap-5 overflow-y-auto overflow-x-hidden"
                dir="rtl"
            >
                <DialogHeader>
                    <DialogTitle className="pe-8 text-2xl font-medium text-c2-slate-950">
                        إرسال بريد للمشتركين بالنشرة
                    </DialogTitle>
                </DialogHeader>

                <SendNewsletterForm
                    recipientCount={recipientCount}
                    isSending={isSending}
                    onSend={onSend}
                />
            </DialogContent>
        </Dialog>
    );
}
