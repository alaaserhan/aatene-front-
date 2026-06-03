"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "../api";
import Link from "next/link";
import { formatPrice } from "@/src/lib/format-price";

interface CrossSellsSectionProps {
    crossSells: Product[];
    crossSellsPrice: string;
    crossSellsName?: string;
    crossSellsDescription?: string;
}

export default function CrossSellsSection({
    crossSells,
    crossSellsPrice,
    crossSellsName,
    crossSellsDescription
}: CrossSellsSectionProps) {
    const originalTotal = crossSells.reduce((sum, p) => sum + parseFloat(p.price || "0"), 0);

    // دائماً 3 منتجات في كل صفحة على كل الشاشات
    const PAGE_SIZE = 3;
    const totalPages = Math.ceil(crossSells.length / PAGE_SIZE);
    const [page, setPage] = useState(0);

    const visibleProducts = crossSells.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    if (crossSells.length === 0 || !crossSellsPrice || parseFloat(crossSellsPrice) <= 0) {
        return null;
    }

    const savings = originalTotal - parseFloat(crossSellsPrice);

    return (
        <div className="my-10 md:my-20">
            {/* العنوان والأسهم */}
            <div className="flex flex-col items-center gap-4 border-b border-gray-100 pb-5 mb-6 px-2 text-center">
                <div className="min-w-0 space-y-2 text-center">
                    <p className="text-xs font-semibold text-blue-4">عرض مجمع</p>
                    <h3 className="text-xl font-bold text-gray-900 md:text-2xl">
                        {crossSellsName || "اشترِ المنتجات معاً بسعر أفضل"}
                    </h3>
                    {crossSellsDescription && (
                        <p className="mx-auto max-w-3xl break-words text-sm leading-7 text-gray-500 md:text-base">
                            {crossSellsDescription}
                        </p>
                    )}
                </div>
            </div>

         
            <div className="flex flex-col items-center gap-3 md:gap-6">

                {/* الصف الرئيسي — كل شيء في سطر واحد بلا كسر */}
                <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-3 w-full overflow-x-auto py-1 no-scrollbar">

                    {/* سهم يمين */}
                    {totalPages > 1 && (
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={page === totalPages - 1}
                            className="shrink-0 w-6 h-6 sm:w-8 sm:h-8 cursor-pointer rounded-full bg-blue-3 flex items-center justify-center hover:bg-blue-4 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            aria-label="التالي"
                        >
                            <ChevronRight className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
                        </button>
                    )}

                    {/* المنتجات */}
                    <div className="flex items-center gap-1 sm:gap-2 md:gap-3 shrink-0">
                        {visibleProducts.map((product, index) => (
                            <div key={product.id} className="flex items-center gap-1 sm:gap-2 md:gap-3">
                                <Link
                                    href={`/product/${product.slug}`}
                                    className="flex flex-col items-center gap-0.5 sm:gap-1 w-[70px] sm:w-[110px] md:w-[155px] shrink-0 group/item"
                                >
                                    <div className="w-full aspect-square rounded-md overflow-hidden bg-white border border-gray-200 shadow-sm">
                                        <img
                                            src={product.cover || "/placeholder.png"}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                e.currentTarget.src = "/placeholder.png";
                                                e.currentTarget.onerror = null;
                                            }}
                                        />
                                    </div>
                                    <p className="text-[9px] sm:text-[11px] md:text-sm text-gray-700 text-center line-clamp-2 font-medium leading-tight group-hover/item:text-blue-3 transition-colors w-full">
                                        {product.name}
                                    </p>
                                </Link>
                                {index < visibleProducts.length - 1 && (
                                    <span className="text-xs sm:text-xl md:text-2xl font-bold text-gray-400 shrink-0">+</span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* سهم يسار (قبل =) */}
                    {totalPages > 1 && (
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="shrink-0 w-6 h-6 sm:w-8 sm:h-8 cursor-pointer rounded-full bg-blue-3 flex items-center justify-center hover:bg-blue-4 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            aria-label="السابق"
                        >
                            <ChevronLeft className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
                        </button>
                    )}

                    {/* = والسعر */}
                    <div className="flex items-center gap-1 sm:gap-3 md:gap-4 shrink-0">
                        <span className="text-base sm:text-2xl md:text-3xl font-bold text-gray-400 shrink-0">=</span>
                        <div className="flex flex-col items-center gap-0.5 shrink-0">
                            <span className="text-xs sm:text-xl md:text-2xl font-bold text-gray-800 whitespace-nowrap">
                                {formatPrice(crossSellsPrice)}{" "}
                                <span className="text-[9px] sm:text-base font-medium">₪</span>
                            </span>
                            <span className="text-[7px] sm:text-xs text-black whitespace-nowrap">بدلاً من</span>
                            <span className="text-[8px] sm:text-sm text-black line-through whitespace-nowrap">
                                {formatPrice(originalTotal)} ₪
                            </span>
                            {savings > 0 && (
                                <span className="mt-0.5 text-[7px] sm:text-xs font-semibold text-red-1 whitespace-nowrap">
                                    وفّر {formatPrice(savings)} ₪
                                </span>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
