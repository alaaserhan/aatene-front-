"use client";

import { cn } from "@/src/lib/utils";
import { formatPrice } from "@/src/lib/format-price";
import { shouldShowAskForPrice } from "@/src/lib/normalizeAskForPrice";
import { VideoOrImage } from "@/src/components/ui/VideoOrImage";
import { Heart, Star } from "lucide-react";

interface ProductPreviewSidebarProps {
    data: {
        name: string;
        price: number;
        ask_for_price?: boolean;
        coverImage: string;
        galleryImages: string[];
    };
}

export function ProductPreviewSidebar({ data }: ProductPreviewSidebarProps) {
    const allImages = [data.coverImage, ...data.galleryImages].filter(Boolean);
    const hasPreviewContent = Boolean(data.coverImage || data.name || data.price || data.ask_for_price);
    const formattedPrice = formatPrice(data.price || 0);

    return (
        <div className="mx-auto w-full overflow-hidden rounded-xl border border-gray-200 bg-white">
            <h3 className="my-4 text-center text-lg font-medium text-blue-4">
                معاينة المنتج
            </h3>

            <div className="flex flex-col items-center px-4 pb-5">
                {!hasPreviewContent ? (
                    <div className="w-full rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
                        <h4 className="text-sm font-semibold text-blue-4">
                            المعاينة ستظهر هنا
                        </h4>
                        <p className="mt-2 text-xs leading-relaxed text-gray-3">
                            أضف صورة المنتج واسمه لرؤية شكل الكارت قبل النشر.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="relative mb-5 aspect-[4/5] max-h-[330px] w-full overflow-hidden rounded-xl bg-gray-50 shadow-sm">
                            <button
                                type="button"
                                className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/70 transition-colors hover:bg-white"
                                aria-label="المفضلة"
                            >
                                <Heart className="h-5 w-5" strokeWidth={1.5} />
                            </button>

                            {data.coverImage ? (
                                <VideoOrImage
                                    src={data.coverImage}
                                    alt="Product Cover"
                                    fill
                                    thumb={false}
                                    className=""
                                />
                            ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100 text-gray-3">
                                    <span className="text-xs font-medium">لا توجد صورة بعد</span>
                                </div>
                            )}

                            {allImages.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                                    {allImages.slice(0, 4).map((_, index) => (
                                        <div
                                            key={index}
                                            className={cn(
                                                "h-2 rounded-full border border-blue-1",
                                                index === 0 ? "w-6 bg-blue-3" : "w-2 bg-white/80"
                                            )}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mb-6 w-full space-y-2">
                            <h2 className="line-clamp-2 text-lg font-medium leading-tight">
                                {data.name || "اسم المنتج"}
                            </h2>

                            <div className="flex items-center gap-1.5">
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Star key={i} className="h-3.5 w-3.5 fill-[#F6AD55] text-[#F6AD55]" />
                                    ))}
                                </div>
                                <span className="text-sm text-[#F6AD55]">5.0</span>
                            </div>

                            {shouldShowAskForPrice(data.ask_for_price, data.price) ? (
                                <div className="mt-1">
                                    <button
                                        type="button"
                                        className="h-9 rounded-sm bg-blue-4 px-5 text-sm font-medium text-white"
                                    >
                                        اطلب السعر
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-1 flex items-center gap-3">
                                    <span className="font-bold">
                                        {formattedPrice} <span>₪</span>
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="text-center">
                            <p className="text-xs leading-relaxed text-gray-3">
                                تظهر المعاينة بعد إدخال بيانات المنتج الأساسية، بدون مساحة فارغة كبيرة قبل البدء.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
