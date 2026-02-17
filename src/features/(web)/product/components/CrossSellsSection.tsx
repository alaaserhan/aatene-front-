"use client";

import { Plus } from "lucide-react";
import { Product } from "../api";

interface CrossSellsSectionProps {
    crossSells: Product[];
    crossSellsPrice: string;
}

export default function CrossSellsSection({ crossSells, crossSellsPrice }: CrossSellsSectionProps) {
    // Calculate original total price
    const originalTotal = crossSells.reduce((sum, p) => sum + parseFloat(p.price || "0"), 0);

    return (
        <div className="my-10 md:my-20">
            <div className="flex flex-col-reverse md:flex-row items-center justify-center gap-6">
                {/* Products Row */}
                <div className="flex items-center gap-4 flex-wrap justify-center">
                    {crossSells.map((product, index) => (
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
                            {index < crossSells.length - 1 && (
                                <div className="text-2xl  font-medium">+</div>
                            )}
                        </div>
                    ))}
                </div>
                <div>
                    <p className="text-2xl font-medium">=</p>
                </div>
                {/* Price Section (left side in RTL) */}
                <div className="flex flex-col  gap-1 shrink-0">
                    <span className="text-2xl font-medium text-[#128F3C]">
                        {parseFloat(crossSellsPrice).toFixed(2)} ₪
                    </span>
                    <span className="font-medium"> بدلاً من</span>
                    <span className="text-sm text-[#E36161] line-through">
                        {originalTotal.toFixed(1)} ₪
                    </span>
                </div>
            </div>
        </div>
    );
}
