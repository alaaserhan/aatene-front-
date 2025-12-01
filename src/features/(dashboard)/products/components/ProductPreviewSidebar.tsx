// src/features/(dashboard)/products/components/ProductPreviewSidebar.tsx
"use client";

import { useMemo, useState } from "react";
import { Heart, Image as ImageIcon, Star } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface ProductPreviewData {
  name?: string;
  price?: number; // final price
  coverImage?: string;
  galleryImages?: string[];
}

interface ProductPreviewSidebarProps {
  data?: ProductPreviewData | null;
}

export function ProductPreviewSidebar({ data }: ProductPreviewSidebarProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // review is dummy
  const dummyRating = 4.0;
  // old price dummy (زي التصميم)
  const dummyOldPrice = 230.0;

  const allImages = useMemo(() => {
    const imgs = [data?.coverImage, ...(data?.galleryImages || [])].filter(
      (x): x is string => Boolean(x && x.trim())
    );
    return imgs;
  }, [data?.coverImage, data?.galleryImages]);

  // =========================
  // IMPORTANT: Empty detection
  // =========================
  const rawName = (data?.name ?? "").trim();
  const isMeaningfulName = rawName.length > 0 && rawName !== "اسم المنتج";
  const isMeaningfulPrice =
    typeof data?.price === "number" && data.price > 0;
  const hasImages = allImages.length > 0;

  // “فيه داتا” فقط لو (صورة) أو (اسم حقيقي) أو (سعر > 0)
  const hasAnyData = hasImages || isMeaningfulName || isMeaningfulPrice;

  // display fallbacks (للـ data state فقط)
  const displayName = isMeaningfulName ? rawName : "اسم المنتج";
  const displayPrice =
    typeof data?.price === "number" ? data.price : 0;

  return (
    <div className="sticky top-6 w-full max-w-sm mx-auto">
      {/* =======================
          EMPTY STATE (NO DATA) - like c050
         ======================= */}
      {!hasAnyData ? (
        <div className="w-full flex flex-col items-center justify-center text-center pt-20 pb-16 px-6">
          <div className="relative w-full flex items-center justify-center">
            {/* soft blob */}
            <div className="absolute -z-10 w-[420px] max-w-full h-[260px] rounded-[120px] bg-gray-50 opacity-80" />

            {/* illustration frame */}
            <div className="w-[310px] max-w-full h-[210px] rounded-[28px] bg-white border border-gray-200 shadow-[0_18px_40px_rgba(0,0,0,0.06)] flex items-center justify-center">
              <div className="w-[210px] h-[150px] rounded-[22px] bg-gray-50 border border-gray-100 flex items-center justify-center">
                <ImageIcon className="w-14 h-14 text-gray-300" />
              </div>
            </div>
          </div>

          <h3 className="mt-10 text-2xl font-extrabold text-[#4A5568]">
            ميزة معاينة المنتج
          </h3>

          <p className="mt-4 text-sm text-[#A0AEC0] leading-relaxed max-w-[320px]">
            قم بإضافة تفاصيل المنتج و سنقوم بعرض شكل المنتج ف الموقع
          </p>
        </div>
      ) : (
        /* =======================
           DATA STATE (HAS DATA) - like a789
           ======================= */
        <>
          <div className="w-full bg-white rounded-[28px] shadow-[0_18px_40px_rgba(0,0,0,0.08)] overflow-hidden">
            {/* Image Area */}
            <div className="relative h-[440px] w-full bg-[#F7F7F7]">
              {/* Favorite Button */}
              <button
                type="button"
                onClick={() => setIsFavorite((v) => !v)}
                className="absolute top-6 left-6 z-10 w-12 h-12 rounded-full bg-[#F3F3F3] shadow-md flex items-center justify-center hover:bg-white transition-all"
              >
                <Heart
                  className={cn(
                    "w-6 h-6 text-gray-700 stroke-[1.5px]",
                    isFavorite ? "fill-red-500 text-red-500" : ""
                  )}
                />
              </button>

              {/* Image */}
              {hasImages ? (
                <img
                  src={allImages[Math.min(currentImageIndex, allImages.length - 1)]}
                  alt="Product Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  </div>
                  <span className="text-sm text-gray-400 font-medium">
                    صورة المنتج
                  </span>
                </div>
              )}

              {/* Dots */}
              {allImages.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {allImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentImageIndex(idx)}
                      className={cn(
                        "h-2.5 rounded-full transition-all",
                        idx === currentImageIndex
                          ? "w-8 bg-[#2B74B9]"
                          : "w-2.5 bg-[#F1E8D6]"
                      )}
                      aria-label={`preview image ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="bg-white px-6 py-6 text-center">
              <h3 className="text-2xl font-extrabold text-[#2D3748] mb-2 line-clamp-1">
                {displayName}
              </h3>

              {/* Rating (dummy) */}
              <div className="flex items-center justify-center gap-1.5 mb-4">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className="w-4 h-4 fill-[#FF9500] text-[#FF9500]"
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-[#FF9500] pt-0.5">
                  {dummyRating.toFixed(1)}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center justify-center gap-4 text-lg">
                <span className="text-gray-400 line-through font-medium">
                  ${dummyOldPrice.toFixed(2)}
                </span>
                <span className="font-extrabold text-black">
                  ${displayPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom text (زي الصورة a789) */}
          <div className="mt-10 text-center space-y-2 px-2">
            <h4 className="text-2xl font-bold text-[#4A5568]">
              ميزة معاينة المنتج
            </h4>
            <p className="text-sm text-[#A0AEC0] leading-relaxed max-w-[300px] mx-auto font-normal">
              توفر لك هذه الميزة معاينة مسبقة للمنتج لتتمكن من مشاهدته كما يظهر
              علي الموقع الخاص بنا
            </p>
          </div>
        </>
      )}
    </div>
  );
}
