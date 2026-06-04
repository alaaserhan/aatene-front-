// src/features/(dashboard)/products/components/ProductTable.tsx
"use client";

import { useState } from "react";
import { formatDate } from "@/src/lib/date-helper";
import { MoreHorizontal, Eye, Pencil, Trash2, Loader2 } from "lucide-react";
import { Product, MerchantProductStatus } from "../api";
import { ToggleSwitch } from "@/src/components/ui/ToggleSwitch";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Pagination } from "@/src/components/ui/Pagination";
import { VideoOrImage } from "@/src/components/ui/VideoOrImage";

interface ProductTableProps {
    products: Product[];
    isLoading: boolean;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onToggleShown: (product: Product) => void;
    onToggleStatus?: (product: Product) => void;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
    onView: (product: Product) => void;
    activeStatus?: MerchantProductStatus | "all";
}

export function ProductTable({
    products,
    isLoading,
    currentPage,
    totalPages,
    onPageChange,
    onToggleShown,
    onToggleStatus,
    onEdit,
    onDelete,
    onView,
    activeStatus,
}: ProductTableProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-3" />
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex flex-col min-h-[300px] items-center justify-center">
                <p className="text-gray-2">لا توجد منتجات للعرض</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full min-w-[900px]">
                    <thead className="bg-[#EEF2F6] border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-sm font-medium text-center whitespace-nowrap">كود المنتج</th>
                            <th className="px-6 py-4 text-sm font-medium text-center whitespace-nowrap">صورة المنتج</th>
                            <th className="px-6 py-4 text-sm font-medium text-center whitespace-nowrap">عنوان المنتج</th>

                            {activeStatus === "rejected" ? (
                                <>
                                    <th className="px-6 py-4 text-sm font-medium text-center whitespace-nowrap">سبب الرفض</th>
                                    <th className="px-6 py-4 text-sm font-medium text-center whitespace-nowrap">تاريخ الرفض</th>
                                </>
                            ) : (
                                <>
                                    <th className="px-6 py-4 text-sm font-medium text-center whitespace-nowrap">
                                        {activeStatus === "pending" ? "تم التسليم" : "تاريخ الانتهاء"}
                                    </th>
                                    <th className="px-6 py-4 text-sm font-medium text-center whitespace-nowrap">مشاهدات</th>
                                    <th className="px-6 py-4 text-sm font-medium text-center whitespace-nowrap">عدد التواصلات</th>
                                    <th className="px-6 py-4 text-sm font-medium text-center whitespace-nowrap">مرئي</th>
                                </>
                            )}

                            <th className="px-6 py-4 text-sm font-medium text-center whitespace-nowrap">عمليات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">

                                {/* Code */}
                                <td className="px-6 py-4 text-sm font-medium text-center whitespace-nowrap">
                                    #{product.sku || product.id}
                                </td>

                                {/* Image */}
                                <td className="px-6 py-4">
                                    <div className="flex justify-center">
                                        <div className="relative w-16 h-12 rounded bg-gray-100 overflow-hidden shrink-0">
                                            {product.cover_url ? (
                                                <VideoOrImage
                                                    src={product.cover_url}
                                                    alt={product.name}
                                                    fill
                                                    thumb
                                                    className=""
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-300">
                                                    <span className="text-[10px]">No Img</span>
                                                </div>
                                            )}
                                            {product.gallery_url && product.gallery_url.length > 0 && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] text-center font-medium py-0.5">
                                                    +{product.gallery_url.length}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                {/* Title */}
                                <td className="px-6 py-4 text-right">
                                    <span className="text-sm font-medium line-clamp-2 leading-snug">
                                        {product.name}
                                    </span>
                                </td>

                                {activeStatus === "rejected" ? (
                                    <>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <span className="text-sm text-red-500 font-medium">
                                                {product.reject_reason || "لا يوجد سبب"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <span className="text-sm text-gray-2 font-medium">
                                                {product.rejected_at ? formatDate(product.rejected_at) : "-"}
                                            </span>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <span className="text-sm">
                                                {activeStatus === "pending"
                                                    ? (formatDate(product.created_at) || "-")
                                                    : (formatDate(product.end_date) || "-")}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <span className="text-sm">{product.view_count || 0}</span>
                                        </td>

                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <span className="text-sm">{product.messages_count || 0}</span>
                                        </td>

                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <div className="flex justify-center">
                                                <ToggleSwitch
                                                    enabled={product.shown}
                                                    onChange={() => onToggleShown(product)}
                                                />
                                            </div>
                                        </td>
                                    </>
                                )}

                                {/* Actions */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); onView(product); }}
                                            className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-xs bg-[#E0F7FA] text-[#00ACC1] hover:bg-[#B2EBF2] transition-colors"
                                            title="مشاهدة"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>

                                        <DropdownMenu dir="rtl">
                                            <DropdownMenuTrigger asChild>
                                                <button type="button" className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-xs bg-gray-100 text-gray-2 hover:bg-gray-200 transition-colors">
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40 border-gray-100 shadow-lg bg-white">
                                                <DropdownMenuItem
                                                    className="cursor-pointer gap-2 text-blue-3 focus:text-blue-4 focus:bg-blue-50"
                                                    onClick={(e) => { e.stopPropagation(); onEdit(product); }}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                    <span>تعديل</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="cursor-pointer gap-2 text-red-600 focus:text-red-700 focus:bg-red-50"
                                                    onClick={(e) => { e.stopPropagation(); onDelete(product); }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span>حذف</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 mt-auto">
                    <Pagination
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </div>
    );
}
