"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import Image from "next/image";
import { PenLine, Star, User } from "lucide-react";
import { sanitizeMediaUrl } from "@/src/lib/utils";
import { useUser } from "@/src/auth/session";
import { ReviewForm, type ReviewFormRef } from "./ReviewForm";
import type { ReviewSubmitPayload } from "./types";

interface ReviewComposerProps {
    onSubmit: (data: ReviewSubmitPayload) => Promise<void> | void;
    isSubmitting: boolean;
    /** Start with the full form open instead of the collapsed prompt */
    defaultOpen?: boolean;
}

/**
 * The review form, collapsed into a one-line prompt until the user wants it.
 *
 * Reviews lists get long, so the composer sits at the top of the section; the
 * collapsed state keeps it from pushing the list down until it's actually used.
 */
export const ReviewComposer = forwardRef<ReviewFormRef, ReviewComposerProps>(function ReviewComposer(
    { defaultOpen = false, ...formProps },
    ref,
) {
    const user = useUser();
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const containerRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<ReviewFormRef>(null);

    const open = () => {
        setIsOpen(true);
        // Focus once the form has mounted
        setTimeout(() => formRef.current?.focusTextarea(), 0);
    };

    useImperativeHandle(ref, () => ({
        scrollToForm: () => containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }),
        focusTextarea: open,
    }));

    if (!isOpen) {
        return (
            <div ref={containerRef}>
                <button
                    type="button"
                    onClick={open}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-c2-neutral-200 bg-white p-3 text-start shadow-sm transition-colors hover:border-c2-navy-300 sm:p-4"
                >
                    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-c2-neutral-200">
                        {user?.avatar_url || user?.avatar ? (
                            <Image
                                src={sanitizeMediaUrl(user.avatar_url || user.avatar)}
                                alt=""
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <User size={20} className="text-c2-neutral-600" />
                        )}
                    </span>

                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-c2-navy-300">شارك تقييمك وساعد الآخرين . . .</span>
                        <span className="mt-0.5 flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <Star key={index} size={13} className="fill-c2-neutral-200 text-c2-neutral-200" />
                            ))}
                        </span>
                    </span>

                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-c2-primary px-4 py-2 text-xs font-medium text-white sm:text-sm">
                        <PenLine size={15} />
                        <span>أضف تقييمك</span>
                    </span>
                </button>
            </div>
        );
    }

    return (
        <div ref={containerRef}>
            <ReviewForm
                {...formProps}
                ref={formRef}
                onSubmitted={() => setIsOpen(false)}
                onCollapse={() => setIsOpen(false)}
            />
        </div>
    );
});
