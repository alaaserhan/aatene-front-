// src/features/(dashboard)/products/components/ProductTable.tsx
"use client";

import { useState, useEffect } from "react";
import { MoreHorizontal, Share2, Eye, Pencil, Trash2, Loader2 } from "lucide-react";
import { Product } from "../api";
import { ToggleSwitch } from "@/src/components/ui/ToggleSwitch";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Pagination } from "@/src/components/ui/Pagination";
import { ShareProductModal } from "./ShareProductModal";
import Cookies from "js-cookie";

interface ProductTableProps {
    products: Product[];
    isLoading: boolean;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onToggleShown: (product: Product) => void;
    onToggleStatus?: (product: Product) => void; // New Prop for Admin Status Toggle
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
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
}: ProductTableProps) {
    // State for Share Modal
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [selectedProductForShare, setSelectedProductForShare] = useState<Product | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const userType = Cookies.get("user_type");
        setIsAdmin(userType === "admin");
    }, []);

    const handleShareClick = (product: Product) => {
        setSelectedProductForShare(product);
        setShareModalOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[500px] bg-white rounded-lg border border-gray-200">
                <Loader2 className="w-8 h-8 animate-spin text-blue-3" />
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex flex-col min-h-[500px] items-center justify-center  bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">لا توجد منتجات للعرض</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col h-full">
            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-[#F0F0F0] border-b border-gray-200 ">
                        <tr>
                            <th className="px-6 py-4 text-sm font-medium text-gray-1 text-center">
                                كود المنتج
                            </th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-1 text-center">
                                صورة المنتج
                            </th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-1 text-center">
                                تاريخ الانتهاء
                            </th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-1 text-center">
                                للمفضلة
                            </th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-1 text-center">
                                عدد المشاهدات
                            </th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-1 text-center">
                                عدد التواصلات
                            </th>

                            {/* Admin Column: Status */}
                            {isAdmin && (
                                <th className="px-6 py-4 text-sm font-medium text-gray-1 text-center">
                                    الحالة
                                </th>
                            )}

                            <th className="px-6 py-4 text-sm font-medium text-gray-1 text-center">
                                مرئي
                            </th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-1 text-center">
                                عمليات
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4 text-sm font-medium text-center">
                                    {product.sku || product.id}
                                </td>
                                <td className="px-6 py-4 flex items-center justify-center">
                                    <div className="w-16 h-12 rounded-sm bg-gray-100 overflow-hidden ">
                                        {product.cover_url ? (
                                            <img
                                                src={product.cover_url}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-2 text-xs">
                                                No IMG
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm  text-center font-medium">
                                    {product.end_date || "-"}
                                </td>
                                <td className="px-6 py-4 text-sm  text-center font-medium">
                                    {product.favorites_count || 0}
                                </td>
                                <td className="px-6 py-4 text-sm  text-center font-medium">
                                    {product.view_count || 0}
                                </td>
                                <td className="px-6 py-4 text-sm  text-center font-medium">
                                    {product.messages_count || 0}
                                </td>

                                {/* Admin Column: Status Toggle */}
                                {isAdmin && (
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center">
                                            <ToggleSwitch
                                                enabled={product.status === "active"}
                                                onChange={() => onToggleStatus && onToggleStatus(product)}
                                            />
                                        </div>
                                    </td>
                                )}

                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center">
                                        <ToggleSwitch
                                            enabled={product.shown}
                                            onChange={() => onToggleShown(product)}
                                        />
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <DropdownMenu dir="rtl">
                                            <DropdownMenuTrigger asChild>
                                                <button type="button" className="w-8 h-8 flex items-center justify-center rounded-xs text-blue-3 bg-blue-5  cursor-pointer">
                                                    <MoreHorizontal className="w-5" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40 border-none text-blue-3 font-medium">
                                                <DropdownMenuItem className="cursor-pointer gap-2 ">
                                                    <Eye className="w-4 h-4" />
                                                    <span>مشاهدة المنتج</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="cursor-pointer gap-2 "
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEdit(product);
                                                    }}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                    <span>تعديل المنتج</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="cursor-pointer gap-2 "
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDelete(product);
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span>حذف المنتج</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                        <button
                                            type="button"
                                            onClick={() => handleShareClick(product)}
                                            className="w-8 h-8 flex items-center justify-center rounded-xs bg-[#E5FBFF] text-[#1298B2] cursor-pointer hover:bg-[#d0f5fc] transition-colors"
                                        >
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="p-4 border-t border-gray-200 mt-auto">
                    <Pagination
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={onPageChange}
                    />
                </div>
            )}

            {/* Share Modal */}
            <ShareProductModal
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                productUrl={selectedProductForShare ? `${window.location.origin}/products/${selectedProductForShare.id}` : ""}
            />
        </div>
    );
}