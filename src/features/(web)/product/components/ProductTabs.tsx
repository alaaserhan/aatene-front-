"use client";

import { useState } from "react";
import { Product } from "../api";
import { Star } from "lucide-react";

interface ProductTabsProps {
    product: Product;
}

export default function ProductTabs({ product }: ProductTabsProps) {
    const [activeTab, setActiveTab] = useState<"description" | "reviews">("description");

    return (
        <div className="mt-12 overflow-hidden">
            {/* Tabs Header */}
            <div className="flex items-center border-b border-gray-200">
                <button
                    onClick={() => setActiveTab("description")}
                    className={`flex-1 py-4 cursor-pointer text-center font-medium text-sm transition-all duration-300 relative ${activeTab === "description"
                        ? "text-blue-3 bg-[#F8F7FF]"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                >
                    وصف المنتج
                    {activeTab === "description" && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-4" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("reviews")}
                    className={`flex-1 py-4 cursor-pointer text-center font-medium text-sm transition-all duration-300 relative ${activeTab === "reviews"
                        ? "text-blue-3 bg-[#F8F7FF]"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                >
                    تقييم و مراجعات
                    {activeTab === "reviews" && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-4" />
                    )}
                </button>
            </div>

            {/* Content Area */}
            <div className="p-3 md:p-4 min-h-[300px]">
                {activeTab === "description" ? (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-6">
                        <div
                            className="prose prose-lg max-w-none text-gray-700 leading-relaxed font-sans"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                        {/* Reviews placeholder - to be built later */}
                        <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Star className="w-8 h-8 opacity-20" />
                            </div>
                            <p className="text-lg font-medium">قريباً</p>
                            <span className="text-sm">جاري العمل على نظام المراجعات</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
