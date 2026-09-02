// src/features/(dashboard)/stores/components/StoreSingleBannerSelector.tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { MediaCenterModal } from "../../mediaCenter/components/MediaCenterModal";
import { MediaItem, getMediaPreviewUrl } from "../../mediaCenter/api";
import { isStoreBannerVideoUrl } from "@/src/features/(web)/stores/utils/storeBannerMedia";

function BannerPreview({ url, fileName }: { url: string; fileName: string }) {
    if (isStoreBannerVideoUrl(url, fileName)) {
        return (
            <video
                src={url}
                className="w-full h-full object-cover"
                muted
                playsInline
                loop
                preload="metadata"
            />
        );
    }
    return <img src={url} alt="Banner" className="w-full h-full object-cover" />;
}

interface StoreSingleBannerSelectorProps {
    value?: string | null;
    previewUrl?: string | null;
    onChange: (fileName: string | null, src: string | null) => void;
    error?: string;
    required?: boolean;
}

export function StoreSingleBannerSelector({
    value,
    previewUrl,
    onChange,
    error,
    required = false,
}: StoreSingleBannerSelectorProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSelect = (file: MediaItem | MediaItem[]) => {
        const selected = Array.isArray(file) ? file[0] : file;
        if (!selected) return;
        onChange(selected.file_name, getMediaPreviewUrl(selected));
        setIsModalOpen(false);
    };

    const handleRemove = () => {
        onChange(null, null);
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">
                    بانر المتجر {required && <span className="text-red-500">*</span>}
                </label>
                <span className="text-xs text-gray-2">
                    المقاسات المفضلة للصور 680 × 180 — يمكن اختيار فيديو من المعرض
                </span>
            </div>

            <div className="w-60">
                {!previewUrl ? (
                    <div
                        onClick={() => setIsModalOpen(true)}
                        className={cn(
                            "w-full h-40rounded-lg",
                            "flex flex-col items-center justify-center gap-1 cursor-pointer transition-all",
                            "bg-[#F8F8F8] hover:bg-gray-100"
                        )}
                    >
                        <div className="w-10 h-10 rounded-full mb-2 border-2 border-gray-1 flex items-center justify-center transition-colors">
                            <Plus className="w-5 h-5 text-gray-2" />
                        </div>
                        <span className="text-xs text-gray-3 font-medium">أضف بانر</span>
                        <span className="text-xs text-gray-3">صور أو فيديو (من الميديا)</span>
                    </div>
                ) : (
                    <div className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="h-30 w-full bg-gray-100 relative">
                            <BannerPreview url={previewUrl} fileName={value || ""} />
                        </div>

                        <div className="h-8.75 px-3 flex items-center justify-between bg-white border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                className="text-xs font-medium text-blue-3 cursor-pointer"
                            >
                                تغيير البانر
                            </button>
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="shrink-0 flex min-w-9 min-h-9 items-center justify-center rounded-md bg-red-2 cursor-pointer touch-manipulation"
                                aria-label="حذف البنر"
                            >
                                <img src="/icons/dashboard/trash.svg" className="w-4 h-4" alt="" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <MediaCenterModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSelect={handleSelect}
                multiple={false}
                allowedMediaTypes={["gallery"]}
            />
        </div>
    );
}
