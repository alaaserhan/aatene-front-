// src/features/(dashboard)/products/components/ProductProvidersTable.tsx
"use client";

import { Eye, Loader2, PackageSearch } from "lucide-react";
import { Pagination } from "@/src/components/ui/Pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Store } from "../../stores/api";
import { getRelativeTimeArabic } from "@/src/lib/date-helper";

interface ProductProvidersTableProps {
    stores: Store[];
    isLoading: boolean;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onDelete: (store: Store) => void;
    onEdit: (store: Store) => void;
    onPreview: (store: Store) => void;
    onManageProducts: (store: Store) => void;
}

export function ProductProvidersTable({
    stores,
    isLoading,
    currentPage,
    totalPages,
    onPageChange,
    onDelete,
    onEdit,
    onPreview,
    onManageProducts,
}: ProductProvidersTableProps) {

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[500px] bg-white rounded-lg border border-gray-200">
                <Loader2 className="w-8 h-8 animate-spin text-blue-3" />
            </div>
        );
    }

    if (stores.length === 0) {
        return (
            <div className="flex flex-col min-h-[500px] items-center justify-center bg-white rounded-lg border border-gray-200">
                <p className="text-gray-2">لا يوجد مقدمي منتجات للعرض</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col h-full">
            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-[#F9FAFB] border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-sm font-medium text-gray-1 text-start">
                                اسم مقدم المنتجات
                            </th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-1 text-start">
                                البريد الإلكتروني
                            </th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-1 text-center">
                                عدد المنتجات
                            </th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-1 text-center">
                                منتجات تحت المراجعة
                            </th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-1 text-center">
                                حالة المتجر
                            </th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-1 text-center">
                                آخر نشاط
                            </th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-1 text-center">
                                عمليات
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {stores.map((store) => {
                            const productsCount = store.products_count ?? store.services_count ?? 0;
                            const pendingCount = store.pending_products_count ?? 0;
                            const lastActive = store.owner?.last_login_at
                                ? getRelativeTimeArabic(store.owner.last_login_at)
                                : "-";

                            return (
                                <tr key={store.id} className="hover:bg-gray-50/50 transition-colors">
                                    {/* Name + Avatar */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border border-gray-100">
                                                <AvatarImage
                                                    src={store.owner?.avatar_url || undefined}
                                                    alt={store.owner?.first_name}
                                                />
                                                <AvatarFallback>{store.owner?.first_name?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">
                                                    {store.owner?.first_name} {store.owner?.last_name}
                                                </span>
                                                <span className="text-xs text-gray-2">{store.name}</span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Email */}
                                    <td className="px-6 py-4 text-sm text-blue-3 font-medium">
                                        {store.owner?.email || store.email || "-"}
                                    </td>

                                    {/* Products count */}
                                    <td className="px-6 py-4 text-sm text-blue-4 font-medium text-center">
                                        {productsCount} منتجات
                                    </td>

                                    {/* Pending count */}
                                    <td className="px-6 py-4 text-sm text-blue-4 font-medium text-center">
                                        {pendingCount} منتجات
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4 text-center">
                                        <span
                                            className={`text-xs font-medium ${
                                                store.status === "approved"
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                            }`}
                                        >
                                            {store.status === "approved" ? "نشط" : "موقوف"}
                                        </span>
                                    </td>

                                    {/* Last active */}
                                    <td className="px-6 py-4 text-sm text-blue-3 text-center font-medium">
                                        {lastActive}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => onEdit(store)}
                                                className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-xs bg-blue-5 text-[#3A5779] hover:bg-[#e0eaff] transition-colors"
                                                title="تعديل"
                                            >
                                                <img src="/icons/dashboard/edit3.svg" className="w-4 h-4" alt="edit" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(store)}
                                                className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-xs bg-[#FFE5E7] text-[#FF4D4F] hover:bg-[#ffe0e2] transition-colors"
                                                title="حذف"
                                            >
                                                <img src="/icons/dashboard/trash.svg" className="w-4 h-4" alt="delete" />
                                            </button>
                                            <button
                                                onClick={() => onManageProducts(store)}
                                                className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-xs bg-[#EEF2F6] text-[#3A5779] hover:bg-[#dbe5ef] transition-colors"
                                                title="إدارة منتجات المتجر"
                                            >
                                                <PackageSearch className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onPreview(store)}
                                                className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-xs bg-[#E5FBFF] text-[#1298B2] hover:bg-[#d0f5fc] transition-colors"
                                                title="معاينة المتجر"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
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
        </div>
    );
}
