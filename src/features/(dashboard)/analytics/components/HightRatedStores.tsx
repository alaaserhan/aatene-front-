// src/components/(admin)/analytics/HightRatedStores.tsx
"use client";

import Link from "next/link";
import { Loader2, ChevronLeft, TrendingUp } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { useGetAnalyticsLatests } from "../hooks";

export function HightRatedStores() {
    const { data, isLoading } = useGetAnalyticsLatests();
    const stores = data?.hightRatedStores || [];

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
            <div className="flex  mb-6">
                <div className="flex flex-col  gap-1">
                    <div className="flex items-center gap-2 ">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        <h3 className="text-lg font-medium">المتاجر الأكثر تقييما</h3>
                    </div>
                    <p className="text-xs text-gray-2 font-medium">قائمة المتاجر التي حصلت علي اعلي تقييم</p>
                </div>
            </div>

            {/* List with Custom Scrollbar */}
            <div className="flex-1 relative ">
                <ScrollArea className="h-[250px] sm:h-[300px] -ml-4 pl-4" dir="rtl">
                    <div className="flex flex-col gap-4">
                        {stores.length > 0 ? (
                            stores.map((store, index) => (
                                <Link
                                    href={`/admin/stores/${store.id}`}
                                    key={store.id}
                                    className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors -mx-2"
                                >
                                    {/* Right: Rank Number */}
                                    <div className="w-8 flex justify-center">
                                        <span className={cn(
                                            "text-lg font-bold",
                                            index === 0 ? "text-green-500" : "text-gray-700"
                                        )}>
                                            {index + 1}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 flex-1 ">
                                        <div className="w-12 h-12 rounded-lg border border-gray-100 p-1 bg-white  flex items-center justify-center">
                                            {store.logo_url ? (
                                                <img src={store.logo_url} alt={store.name} className=" h-full object-cover " />
                                            ) : (
                                                <div className="w-full h-full bg-gray-50 rounded-md flex items-center justify-center text-[10px] text-gray-2">
                                                    Logo
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col ">
                                            <h4 className="text-sm font-medium ">{store.name}</h4>
                                            <div className="flex items-center gap-1 mt-0.5 bg-gray-50 px-2 py-0.5 rounded-md">
                                                <span className="text-[11px] text-gray-2">عدد التقييمات</span>
                                                <span className={`text-[11px] font-medium ${index === 0 ? "text-green-600" : "text-gray-600"}`}>
                                                    {store.review_count || store.review_rate || 50} تقييم
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-gray-2 group-hover:text-[#3A5779] transition-colors">
                                        <ChevronLeft className="w-5 h-5" />
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-2 text-sm">
                                لا توجد متاجر مقيمة
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
