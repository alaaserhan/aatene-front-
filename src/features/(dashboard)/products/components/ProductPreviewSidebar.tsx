// src/features/(dashboard)/products/components/ProductPreviewSidebar.tsx
"use client";

import { cn } from "@/src/lib/utils";
import { Heart, Star, Share2, ChevronRight } from "lucide-react";

interface ProductPreviewSidebarProps {
    data: {
        name: string;
        price: number;
        coverImage: string;
        galleryImages: string[];
    };
}

export function ProductPreviewSidebar({ data }: ProductPreviewSidebarProps) {
    // دمج صورة الغلاف مع المعرض
    const allImages = [data.coverImage, ...data.galleryImages].filter(Boolean);
    const displayImages = allImages.length > 0 ? allImages : [""];

    // تنسيق السعر الحالي
    const formattedPrice = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD", // تم التغيير لـ $ ليطابق الصورة المرفقة، يمكنك إعادتها لـ ILS
        minimumFractionDigits: 2,
    }).format(data.price || 0);

    // سعر وهمي قديم (لأغراض العرض مثل التصميم)
    const fakeOldPrice = data.price ? data.price * 1.15 : 0;
    const formattedOldPrice = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(fakeOldPrice);

    return (
        <div className="sticky top-6">
            <h3 className="font-medium text-blue-4 mb-6 text-center text-xl">
                معاينة المنتج
            </h3>

            {/* Mobile Frame Simulation */}
            <div className="mx-auto w-full max-w-[320px] bg-white rounded-[2.1rem] border-[7px] border-gray-900 overflow-hidden shadow-2xl relative">

                {/* Mobile Status Bar (Fake) */}
                <div className="h-7 bg-white flex items-center justify-between px-6 text-[10px] font-medium text-gray-900 z-20 relative">
                    <span>9:41</span>
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 bg-gray-900 rounded-full opacity-20"></div>
                        <div className="w-3 h-3 bg-gray-900 rounded-full opacity-20"></div>
                        <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                    </div>
                </div>

                {/* Header (Back & Share) - Optional per design, kept for "App feel" */}
                <div className="absolute top-10 left-0 right-0 z-10 px-5 flex justify-between items-center pointer-events-none">
                    {/* Buttons hidden or made subtle to focus on the card as per image */}
                    <div className="w-8 h-8 pointer-events-auto"></div>
                    <div className="w-8 h-8 pointer-events-auto"></div>
                </div>

                {/* Content Area */}
                <div className="bg-white min-h-[500px] flex flex-col items-center pt-8 px-6 pb-8">

                    {/* --- Product Card Design Start --- */}

                    {/* 1. Image Container */}
                    <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-sm mb-5 bg-gray-50">
                        {/* Favorite Button (Top Left) */}
                        <button className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
                            <Heart className="w-5 h-5 text-gray-800" strokeWidth={1.5} />
                        </button>

                        {/* Main Image */}
                        {data.coverImage ? (
                            <img
                                src={data.coverImage}
                                alt="Product Cover"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-300">
                                <span className="text-xs font-medium">No Image</span>
                            </div>
                        )}

                        {/* Pagination Dots (Bottom Center inside Image) */}
                        {displayImages.length > 0 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                                {/* Fake dots simulation to match design */}
                                <div className="w-6 h-2 rounded-full bg-[#3A5779]"></div>
                                <div className="w-2 h-2 rounded-full bg-white/80"></div>
                                <div className="w-2 h-2 rounded-full bg-white/80"></div>
                                <div className="w-2 h-2 rounded-full bg-white/80"></div>
                            </div>
                        )}
                    </div>

                    {/* 2. Product Info (Centered) */}
                    <div className="text-center w-full space-y-2 mb-8">
                        {/* Title */}
                        <h2 className="text-xl font-bold  leading-tight">
                            {data.name || "حذاء رياضي نيو"}
                        </h2>

                        {/* Rating */}
                        <div className="flex items-center justify-center gap-1.5">
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star key={i} className="w-3.5 h-3.5 fill-[#F6AD55] text-[#F6AD55]" />
                                ))}
                            </div>
                            <span className="text-sm text-[#F6AD55]">5.0</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-center gap-3 mt-1">
                            <span className=" font-bold ">
                                {formattedPrice}
                            </span>
                            <span className="text-gray-400 text-sm line-through decoration-gray-400">
                                {formattedOldPrice}
                            </span>
                        </div>
                    </div>

                    {/* --- Product Card Design End --- */}

                    {/* Feature Description (As per image) */}
                    <div className="mt-auto text-center space-y-2">
                        <h4 className="text-lg font-bold ">
                            ميزة معاينة المنتج
                        </h4>
                        <p className="text-xs text-gray-3 leading-relaxed px-2">
                            توفر لك هذه الميزة معاينة مسبقة للمنتج لتتمكن من مشاهدته كما يظهر علي الموقع الخاص بنا
                        </p>
                    </div>

                    {/* Bottom Home Indicator */}
                    <div className="w-1/3 h-1 bg-gray-200 rounded-full mt-6 mb-2"></div>
                </div>
            </div>
        </div>
    );
}