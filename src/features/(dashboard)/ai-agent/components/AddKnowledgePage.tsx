"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { Mosa3edySidebar } from "../home/components/Mosa3edySidebar";
import { useUploadKnowledge } from "../hooks";
import {
    KNOWLEDGE_BANK_ACCEPT_INPUT,
    knowledgeBankPlatformFromSearchParam,
    validateKnowledgeBankFile,
    type KnowledgeBankPlatform,
} from "../api";

function DropzoneDashedFrame({
    active,
    dashLength,
    gapLength,
}: {
    active: boolean;
    dashLength: number;
    gapLength: number;
}) {
    const stroke = active ? "#405D7E" : "#d1d5db";
    return (
        <svg
            className="pointer-events-none absolute inset-0 size-full overflow-visible"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
        >
            <rect
                x="0.5"
                y="0.5"
                width="99%"
                height="99%"
                rx="8"
                ry="8"
                fill="none"
                stroke={stroke}
                strokeWidth={1}
                strokeDasharray={`${dashLength} ${gapLength}`}
                vectorEffect="nonScalingStroke"
            />
        </svg>
    );
}

function PlatformToggleBar({
    platform,
    onChange,
}: {
    platform: KnowledgeBankPlatform;
    onChange: (p: KnowledgeBankPlatform) => void;
}) {
    return (
        <div className="flex items-center gap-3 flex-shrink-0 justify-end">
            <span
                role="button"
                tabIndex={0}
                onClick={() => onChange("web")}
                onKeyDown={(e) => e.key === "Enter" && onChange("web")}
                className={cn(
                    "text-sm cursor-pointer transition-all duration-200 whitespace-nowrap px-3 py-1 rounded-md",
                    platform === "web" ? "font-semibold text-[#3A5779] bg-gray-100" : "font-medium text-gray-400"
                )}
            >
                قاعدة معرفة المنصة
            </span>
            <div
                role="switch"
                aria-checked={platform === "mobile"}
                aria-label="تبديل المنصة"
                onClick={() => onChange(platform === "web" ? "mobile" : "web")}
                className="relative flex-shrink-0 w-14 h-7 rounded-full bg-gray-200 cursor-pointer select-none"
                style={{ minWidth: "56px" }}
            >
                <span
                    className={cn(
                        "absolute top-0.5 w-6 h-6 bg-[#3A5779] rounded-full shadow-md transition-all duration-300",
                        platform === "web" ? "right-0.5" : "left-0.5"
                    )}
                />
            </div>
            <span
                role="button"
                tabIndex={0}
                onClick={() => onChange("mobile")}
                onKeyDown={(e) => e.key === "Enter" && onChange("mobile")}
                className={cn(
                    "text-sm cursor-pointer transition-all duration-200 whitespace-nowrap px-3 py-1 rounded-md",
                    platform === "mobile" ? "font-semibold text-[#3A5779] bg-gray-100" : "font-medium text-gray-400"
                )}
            >
                قاعدة معرفة التطبيق
            </span>
        </div>
    );
}

export function AddKnowledgePage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const platform = knowledgeBankPlatformFromSearchParam(searchParams.get("platform"));
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { mutate: upload, isPending } = useUploadKnowledge();
    const listPath = pathname.replace(/\/?add\/?$/, "");

    const goToList = useCallback(
        (p: KnowledgeBankPlatform) => {
            router.push(`${listPath}?platform=${p}`);
        },
        [router, listPath]
    );

    const applyPlatform = (p: KnowledgeBankPlatform) => {
        router.replace(`${pathname}?platform=${p}`);
        setSelectedFile(null);
    };

    const assignFile = (file: File | undefined) => {
        if (!file) return;
        const err = validateKnowledgeBankFile(file);
        if (err) {
            toast.error(err);
            return;
        }
        setSelectedFile(file);
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        assignFile(e.target.files?.[0]);
        e.target.value = "";
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        assignFile(e.dataTransfer.files?.[0]);
    };

    const handleAdd = () => {
        if (!selectedFile || isPending) {
            if (!selectedFile) toast.error("اختر ملفاً أولاً");
            return;
        }
        upload(
            { file: selectedFile, platform },
            {
                onSuccess: (_data, variables) => goToList(variables.platform),
            }
        );
    };

    return (
        <div className="p-3 lg:p-5">
            <div className="lg:grid lg:grid-cols-[280px_1fr] flex flex-col gap-4 items-stretch">
                <div className="w-full lg:sticky lg:top-25 lg:self-start">
                    <Mosa3edySidebar />
                </div>

                <div className="w-full min-w-0 flex flex-col">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex-1 flex flex-col">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 px-6 pt-6 pb-4">
                            <div className="text-right flex-1 space-y-2">
                                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">إضافة وثائق</h1>
                                <p className="text-gray-500 text-sm lg:text-[15px] leading-relaxed">
                                    أضف البيانات المراد تزويد الموظف بها مرة واحدة
                                </p>
                            </div>
                            <PlatformToggleBar platform={platform} onChange={applyPlatform} />
                        </div>

                        <hr className="border-gray-200" />

                        <div className="flex-1 flex flex-col px-6 pt-6 pb-6">
                            <p className="text-right text-sm font-semibold text-gray-800 mb-2">ملف البيانات</p>

                            <div
                                dir="rtl"
                                role="presentation"
                                className={cn(
                                    "relative w-full min-h-[148px] sm:min-h-[168px] rounded-lg cursor-pointer",
                                    "bg-white transition-colors overflow-hidden"
                                )}
                                onDragEnter={(e) => {
                                    e.preventDefault();
                                    setDragActive(true);
                                }}
                                onDragOver={(e) => e.preventDefault()}
                                onDragLeave={() => setDragActive(false)}
                                onDrop={onDrop}
                                onClick={() => !isPending && inputRef.current?.click()}
                            >
                                <DropzoneDashedFrame active={dragActive} dashLength={11} gapLength={6} />
                                <div
                                    className={cn(
                                        "relative z-10 flex min-h-[148px] sm:min-h-[168px] flex-col items-center justify-center gap-3 px-6 py-8 sm:py-9",
                                        dragActive ? "bg-[#405D7E]/5" : "bg-transparent"
                                    )}
                                >
                                    <input
                                        ref={inputRef}
                                        type="file"
                                        accept={KNOWLEDGE_BANK_ACCEPT_INPUT}
                                        className="hidden"
                                        onChange={onInputChange}
                                        disabled={isPending}
                                    />

                                    <div className="text-[#405D7E]">
                                        {isPending ? (
                                            <Loader2 className="w-9 h-9 animate-spin" />
                                        ) : (
                                            <Upload className="w-9 h-9" strokeWidth={1.65} />
                                        )}
                                    </div>

                                    <div className="text-center space-y-1.5 max-w-2xl">
                                        <p className="text-base sm:text-[17px] font-semibold text-gray-900">
                                            تصفح أو اسحب وأسقط الملف هنا
                                        </p>
                                        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed px-2">
                                            يدعم ملفات DOCS، CSV. بحجم يصل إلى 0.5 ميغابايت وبحد أقصى 500
                                        </p>
                                        {selectedFile && (
                                            <p className="text-sm font-medium text-[#405D7E] pt-1 break-all">
                                                {selectedFile.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="w-full mt-8 flex flex-col items-center gap-3">
                                <Button
                                    type="button"
                                    disabled={isPending || !selectedFile}
                                    onClick={handleAdd}
                                    className={cn(
                                        "rounded-full text-white text-sm font-medium px-14 h-11 sm:h-12",
                                        "bg-[#405D7E] hover:bg-[#354d69] shadow-none",
                                        "disabled:opacity-50"
                                    )}
                                >
                                    {isPending ? "جاري الإضافة..." : "إضافة"}
                                </Button>
                                <button
                                    type="button"
                                    className="text-sm text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-50"
                                    onClick={() => goToList(platform)}
                                    disabled={isPending}
                                >
                                    العودة لقائمة الوثائق
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
