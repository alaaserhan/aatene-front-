"use client";

import { ChevronLeft, Plus, X } from "lucide-react";
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
        console.log(user);


        useImperativeHandle(ref, () => ({
            scrollToForm: () => {
                containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            },
            focusTextarea: () => {
                setTimeout(() => textareaRef.current?.focus(), 400);
            },
        }));

        const handleSafeSubmit = async () => {
            if (!content.trim()) return;
            try {
                // If it's a reply, the rating UI is hidden. We send a default rating (5) 
                // to satisfy backend validation that requires a rate >= 1.
                const effectiveRate = parentId ? (rate || 5) : rate;
                await Promise.resolve(onSubmit({ content, rate: effectiveRate, images, parent_id: parentId }));
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
            <div ref={containerRef} className="bg-[#AAAAAA1A] border border-gray-200 rounded-xl p-6 flex gap-5">
                <div className="relative w-[52px] h-[52px] rounded-full overflow-hidden shrink-0">
                    <Image
                        src={user?.avatar_url || "/assets/images/placeholder.jpg"}
                        alt="user"
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="flex-1 flex flex-col gap-6">
                    {parentId && replyToName && (
                        <div className="flex items-center justify-between text-sm bg-blue-5 text-blue-4 px-3 py-2 rounded-lg border border-blue-100">
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

                    <div className={`flex items-center ${parentId ? "justify-end" : "justify-between"} w-full`}>
                        {!parentId && (
                            <div className="flex items-center gap-4">
                                <span className="text-sm">تقييماتك:</span>
                                <InteractiveStarRating rating={rate} onRate={setRate} />
                            </div>
                        )}
                        <button
                            onClick={handleSafeSubmit}
                            disabled={isSubmitting}
                            className="bg-blue-3 text-white rounded-full px-4 py-2 flex items-center gap-1 font-medium text-sm cursor-pointer capitalize disabled:opacity-50"
                        >
                            {parentId ? "إرسال الرد" : "ارسال"}    <ChevronLeft size={20} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }
);
