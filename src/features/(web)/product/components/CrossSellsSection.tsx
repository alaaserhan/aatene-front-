"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "../api";

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
            {/* العنوان والوصف */}
            {(crossSellsName || crossSellsDescription) && (
                <div className="text-center mb-5 md:mb-8">
                    {crossSellsName && (
                        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1">{crossSellsName}</h3>
                    )}
                    {crossSellsDescription && (
                        <p className="text-sm md:text-base text-gray-600">{crossSellsDescription}</p>
                    )}
                </div>
            )}

         
            <div className="flex flex-col items-center gap-4 md:gap-6">

               
                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 w-full justify-center">
                   
                    {totalPages > 1 && (
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={page === totalPages - 1}
                            className="shrink-0 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shadow-sm transition-all"
                            aria-label="التالي"
                        >
                            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                        </button>
                    )}

                    {/* المنتجات */}
                    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 flex-wrap justify-center flex-1">
                        {visibleProducts.map((product, index) => (
                            <div key={product.id} className="flex items-center gap-1.5 sm:gap-2 md:gap-4">
                                <div className="flex flex-col items-center gap-1 sm:gap-1.5 w-[95px] sm:w-[130px] md:w-[180px]">
                                    <div className="w-full aspect-square rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm">
                                        <img
                                            src={product.cover || "/placeholder.png"}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = "/placeholder.png";
                                                e.currentTarget.onerror = null;
                                            }}
                                        />
                                    </div>
                                    <p className="text-[11px] md:text-sm text-gray-700 text-center line-clamp-2 font-medium leading-tight">
                                        {product.name}
                                    </p>
                                </div>
                                {index < visibleProducts.length - 1 && (
                                    <span className="text-base sm:text-xl md:text-2xl font-bold text-gray-400">+</span>
                                )}
                            </div>
                        ))}
                    </div>

                   
                    {totalPages > 1 && (
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="shrink-0 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shadow-sm transition-all"
                            aria-label="السابق"
                        >
                            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                        </button>
                    )}
                </div>

                {/* Dots indicator */}
                {totalPages > 1 && (
                    <div className="flex items-center gap-1.5">
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setPage(i)}
                                className={`rounded-full transition-all ${i === page
                                    ? "w-4 h-2 bg-blue-400"
                                    : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                                }`}
                                aria-label={`صفحة ${i + 1}`}
                            />
                        ))}
                    </div>
                )}

                {/* = والسعر */}
                <div className="flex items-center gap-4 md:gap-6 justify-center">
                    <span className="text-2xl md:text-3xl font-bold text-gray-400">=</span>
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-xl md:text-2xl font-bold text-[#128F3C]">
                            {parseFloat(crossSellsPrice).toFixed(2)} <span className="text-base font-medium">₪</span>
                        </span>
                        <span className="text-xs text-gray-500">بدلاً من</span>
                        <span className="text-sm text-[#E36161] line-through">
                            {originalTotal.toFixed(2)} ₪
                        </span>
                        {savings > 0 && (
                            <span className="mt-1 text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full">
                                وفّر {savings.toFixed(2)} ₪
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
