// src/components/(merchant)/analytics/MerchantMostViewed.tsx
"use client";

import { Loader2, ChevronLeft, TrendingUp, Eye } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { useGetMerchantAnalyticsMostViewed } from "../../hooks";

interface ViewedItem {
    id: number;
    name?: string;
    title?: string;
    cover_url?: string;
    images?: string;
    views_count?: string | number;
}

export function MerchantMostViewed() {
    const { data, isLoading } = useGetMerchantAnalyticsMostViewed();
    
    // Combine products and services, prioritizing products
    const products = data?.mostViewedProducts || [];
    const services = data?.mostViewedServices || [];
    
    // Merge and create unified list
    const items: ViewedItem[] = [
        ...products.map(p => ({
            id: p.id,
            name: p.name,
            cover_url: p.cover_url,
            views_count: p.review_count || 0
        })),
        ...services.map(s => ({
            id: s.id,
            name: s.title,
            cover_url: s.images,
            views_count: s.views_count || 0
        }))
    ].slice(0, 10); // Limit to 10 items

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg p-6 h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#3A5779]" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-6 flex flex-col h-full min-h-[400px]">
            {/* Header */}
            <div className="flex mb-6">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        <h3 className="text-lg font-bold">الأكثر مشاهدة</h3>
                    </div>
                    <p className="text-xs text-gray-400 font-medium">قائمة الخدمات التي حققت أكثر مبيعات</p>
                </div>
            </div>

            {/* List with Custom Scrollbar */}
            <div className="flex-1 relative">
                <ScrollArea className="h-[300px] -ml-4 pl-4" dir="rtl">
                    <div className="flex flex-col gap-4">
                        {items.length > 0 ? (
                            items.map((item, index) => (
                                <div key={`${item.id}-${index}`} className="flex items-center justify-between group">
                                    
                                    {/* Right: Rank Number */}
                                    <div className="w-8 flex justify-center">
                                        <span className={cn(
                                            "text-lg font-bold",
                                            index === 0 ? "text-green-500" : 
                                            index === 1 ? "text-blue-500" : 
                                            index === 2 ? "text-orange-500" : "text-gray-500"
                                        )}>
                                            {index + 1}
                                        </span>
                                    </div>

                                    {/* Middle: Image & Info */}
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-12 h-12 rounded-lg border border-gray-100 p-1 bg-white overflow-hidden flex items-center justify-center">
                                            {item.cover_url ? (
                                                <img 
                                                    src={item.cover_url} 
                                                    alt={item.name} 
                                                    className="w-full h-full object-cover rounded-md" 
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-50 rounded-md flex items-center justify-center text-[10px] text-gray-400">
                                                    صورة
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="text-sm font-medium line-clamp-1">{item.name}</h4>
                                            <div className="flex items-center gap-1 mt-0.5 bg-gray-50 px-2 py-0.5 rounded-md">
                                                <span className="text-[11px] text-gray-400">عدد المشاهدات</span>
                                                <span className={cn(
                                                    "text-[11px] font-bold px-2 py-0.5 rounded-full",
                                                    index === 0 ? "bg-green-100 text-green-600" : "text-gray-600"
                                                )}>
                                                    {item.views_count} مشاهدة
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Left: Arrow */}
                                    <button className="text-gray-300 hover:text-[#3A5779] transition-colors">
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-400 text-sm">
                                لا توجد منتجات أو خدمات
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}