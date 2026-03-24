"use client";

import { ChevronLeft, Plus, User, X } from "lucide-react";
import Image from "next/image";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { InteractiveStarRating } from "@/src/components/ui/StarRating";
import { useAuthStore } from "@/src/stores/auth-store";

interface ReviewFormProps {
    onSubmit: (data: { content: string; rate: number; images: File[]; parent_id?: number | null }) => Promise<void> | void;
    isSubmitting: boolean;
    parentId?: number | null;
    replyToName?: string | null;
    onCancelReply?: () => void;
}

export interface ReviewFormRef {
    scrollToForm: () => void;
    focusTextarea: () => void;
}

export const ReviewForm = forwardRef<ReviewFormRef, ReviewFormProps>(
    function ReviewForm({ onSubmit, isSubmitting, parentId, replyToName, onCancelReply }, ref) {
        const [content, setContent] = useState("");
        const [rate, setRate] = useState(0);
        const [images, setImages] = useState<File[]>([]);
        const fileInputRef = useRef<HTMLInputElement>(null);
        const containerRef = useRef<HTMLDivElement>(null);
        const textareaRef = useRef<HTMLTextAreaElement>(null);
        const user = useAuthStore((state) => state.user);


        useImperativeHandle(ref, () => ({
            scrollToForm: () => {
                containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            },
            focusTextarea: () => {
                setTimeout(() => textareaRef.current?.focus(), 400);
            },
        }));

        const handleSafeSubmit = async () => {
            const trimmedContent = content.trim();
            const isReply = !!parentId;

            // Validation: 
            // For a regular review: must have either content or a rating > 0.
            // For a reply: must have content (since rating is not interactive/hidden).
            if (!isReply && !trimmedContent && rate === 0) return;
            if (isReply && !trimmedContent) return;

            try {
                // If it's a reply, the rating UI is hidden. We send a default rating (5) 
                // to satisfy backend validation that requires a rate >= 1.
                const effectiveRate = isReply ? (rate || 5) : rate;
                await Promise.resolve(onSubmit({ content: trimmedContent, rate: effectiveRate, images, parent_id: parentId }));
                setContent("");
                setRate(0);
                setImages([]);
            } catch {
            }
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
            <div ref={containerRef} className="bg-[#AAAAAA1A] border border-gray-200 rounded-xl p-4 sm:p-6 flex gap-3 sm:gap-5 w-full overflow-hidden">
                <div className="relative flex items-center justify-center bg-gray-200 w-10 h-10 sm:w-[52px] sm:h-[52px] rounded-full overflow-hidden shrink-0">
                   {
                    user?.avatar_url ? (
                        <Image
                            src={user?.avatar_url}
                            alt="user"
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <User
                            size={24}
                            className="text-gray-500"
                        />
                    )
                   }
                </div>
                <div className="flex-1 flex flex-col gap-4 sm:gap-6 min-w-0">
                    {parentId && replyToName && (
                        <div className="flex items-center justify-between text-sm bg-blue-5 text-blue-4 px-3 py-2 rounded-lg border border-blue-100 flex-wrap gap-2">
                            <span className="font-medium">الرد على {replyToName}</span>
                            <button
                                type="button"
                                onClick={onCancelReply}
                                className="text-blue-4  p-1 cursor-pointer"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    <div className=" bg-white/50 border border-gray-200 rounded-lg p-4 min-h-[136px]">
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={parentId ? `اكتب ردك هنا . . .` : "اكتب مراجعتك . . ."}
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
                            className="w-[100px] h-[100px] rounded-[15px] border border-dashed border-blue-3 bg-[rgba(166,166,166,0.3)] flex items-center justify-center cursor-pointer"
                        >
                            <div className="bg-blue-3 rounded-full p-2">
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

                    <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 ${parentId ? "justify-end" : "justify-between"} w-full mt-2`}>
                        {!parentId && (
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
                                <span className="text-sm whitespace-nowrap">تقييماتك:</span>
                                <InteractiveStarRating rating={rate} onRate={setRate} />
                            </div>
                        )}
                        <button
                            onClick={handleSafeSubmit}
                            disabled={isSubmitting}
                            className="bg-blue-3 text-white rounded-full px-6 py-2 flex items-center justify-center gap-1 font-medium text-sm cursor-pointer capitalize disabled:opacity-50 shrink-0 w-full sm:w-auto self-end sm:self-auto"
                        >
                            {parentId ? "إرسال الرد" : "ارسال"}    <ChevronLeft size={20} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }
);
