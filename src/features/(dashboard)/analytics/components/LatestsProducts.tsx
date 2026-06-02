// src/components/(admin)/analytics/LatestsProducts.tsx
"use client";

import { Loader2, Clock, ChevronLeft, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useGetAnalyticsLatests } from "../hooks";
import { getRelativeTimeArabic, formatDateArabic } from "@/src/lib/date-helper";

export function LatestsProducts() {
    const { data, isLoading } = useGetAnalyticsLatests();
    const products = data?.latestsProducts || [];

    // Helper to map status to UI style
    const getStatusBadge = (status: string | undefined) => {
        // Mocking statuses based on image since API only returns "active/not-active"
        // In a real scenario, you'd map specific API status codes

        if (status === "approved") {
            return (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#16A34A] text-xs font-medium border border-[#DCFCE7]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>تم الموافقة</span>
                </div>
            );
        } else if (status === "rejected") { // Hypothetical status
            return (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEE2E2] text-[#DC2626] text-xs font-medium border border-[#FEE2E2]">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>مرفوض</span>
                </div>
            );
        } else {
            // Default / Pending
            return (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3F4F6] text-[#4B5563] text-xs font-medium border border-[#F3F4F6]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>في انتظار الموافقة</span>
                </div>
            );
        }
    };

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
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 ">
                    <Clock className="w-5 h-5 " />
                    <h3 className="text-lg font-medium">احدث المنتجات</h3>
                    <span className="text-lg font-medium ">( {products.length} )</span>
                </div>
                {/* <div className="flex items-center gap-2">
                    <ChevronLeft className="w-5 h-5 text-gray-2 cursor-pointer hover:text-gray-2" />
                </div> */}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-[#F9FAFB] border-b border-gray-100">
                            <th className="py-3 px-4 text-right text-xs font-medium ">رقم المنتج</th>
                            <th className="hidden sm:table-cell py-3 px-4 text-center text-xs font-medium ">حالة الطلب</th>
                            <th className="hidden sm:table-cell py-3 px-4 text-center text-xs font-medium ">التاجر</th>
                            <th className="hidden md:table-cell py-3 px-4 text-center text-xs font-medium ">تم الانشاء</th>
                            <th className="py-3 px-4 text-center text-xs font-medium ">تاريخ الانشاء</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {products.length > 0 ? (
                            products.slice(0, 5).map((product, index) => (
                                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                                    {/* Product ID & Name */}
                                    <td className="py-4 px-4 text-right">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium  underline decoration-gray-300 underline-offset-4 cursor-pointer">
                                                #{product.id}
                                            </span>
                                            {/* Optional: Show name below ID if needed, though image shows only ID */}
                                        </div>
                                    </td>

                                    {/* Status */}
                                    <td className="hidden sm:table-cell py-4 px-4 text-center">
                                        {getStatusBadge(product.status)}
                                    </td>

                                    {/* Merchant (Mocked as data is missing) */}
                                    <td className="hidden sm:table-cell py-4 px-4 text-center">
                                        <span className="text-sm font-semibold text-gray-700">
                                            {product.store.name || `تاجر ${index + 1}`}
                                        </span>
                                    </td>

                                    {/* Time Ago */}
                                    <td className="hidden md:table-cell py-4 px-4 text-center">
                                        <span className="text-sm font-medium text-gray-2">
                                            {getRelativeTimeArabic(product.created_at)}
                                        </span>
                                    </td>

                                    {/* Date */}
                                    <td className="py-4 px-4 text-center">
                                        <span className="text-sm font-medium  " dir="ltr">
                                            {formatDateArabic(product.created_at)}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="py-10 text-center text-gray-2 text-sm">
                                    لا توجد منتجات حديثة
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}