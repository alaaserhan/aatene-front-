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
    // Calculate original total price
    const originalTotal = crossSells.reduce((sum, p) => sum + parseFloat(p.price || "0"), 0);
    const pageSize = 3;
    const totalPages = Math.ceil(crossSells.length / pageSize);
    const [page, setPage] = useState(0);
    const visibleProducts = crossSells.slice(page * pageSize, (page + 1) * pageSize);

    if (crossSells.length === 0 || !crossSellsPrice || parseFloat(crossSellsPrice) <= 0) {
        return null;
    }

    return (
        <div className="my-10 md:my-20">
            {/* العنوان والوصف */}
            {(crossSellsName || crossSellsDescription) && (
                <div className="text-center mb-6">
                    {crossSellsName && (
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{crossSellsName}</h3>
                    )}
                    {crossSellsDescription && (
                        <p className="text-gray-600">{crossSellsDescription}</p>
                    )}
                </div>
            )}

            <div className="flex flex-col-reverse md:flex-row items-center justify-center gap-6">
                {/* Products Row */}
                <div className="flex items-center gap-3">
                    {totalPages > 1 && (
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 disabled:opacity-30"
                            aria-label="السابق"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                    <div className="flex items-center gap-4 flex-wrap justify-center">
                        {visibleProducts.map((product, index) => (
                            <div key={product.id} className="flex items-center gap-4">
                                {/* Product Card */}
                                <div className="flex flex-col items-center gap-2 w-[180px]">
                                    <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
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
                                    <p className="text-sm text-gray-700 text-center line-clamp-2 font-medium">
                                        {product.name}
                                    </p>
                                </div>

                                {/* Plus sign between products */}
                                {index < visibleProducts.length - 1 && (
                                    <div className="text-2xl font-medium">+</div>
                                )}
                            </div>
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={page === totalPages - 1}
                            className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 disabled:opacity-30"
                            aria-label="التالي"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <div>
                    <p className="text-2xl font-medium">=</p>
                </div>
                {/* Price Section (left side in RTL) */}
                <div className="flex flex-col gap-1 shrink-0">
                    <span className="text-2xl font-medium text-[#128F3C]">
                        {parseFloat(crossSellsPrice).toFixed(2)} ₪
                    </span>
                    <span className="font-medium"> بدلاً من</span>
                    <span className="text-sm text-[#E36161] line-through">
                        {originalTotal.toFixed(1)} ₪
                    </span>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                    <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-gray-500">
                        {page + 1} / {totalPages}
                    </span>
                    <button
                        type="button"
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={page === totalPages - 1}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
