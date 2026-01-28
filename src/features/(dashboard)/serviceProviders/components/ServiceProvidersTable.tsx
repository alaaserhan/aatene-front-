// src/features/(dashboard)/stores/components/ServiceProvidersTable.tsx
"use client";

import { useState } from "react";
import { Eye, Pencil, Trash2, Loader2, MoreHorizontal } from "lucide-react";
import { ToggleSwitch } from "@/src/components/ui/ToggleSwitch";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Pagination } from "@/src/components/ui/Pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Store } from "../../stores/api";
import { getRelativeTimeArabic } from "@/src/lib/date-helper";

interface ServiceProvidersTableProps {
    stores: Store[];
    isLoading: boolean;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onToggleStatus: (store: Store) => void;
    onEdit: (store: Store) => void;
    onDelete: (store: Store) => void;
    onShow: (store: Store) => void;
}

export function ServiceProvidersTable({
    stores,
    isLoading,
    currentPage,
    totalPages,
    onPageChange,
    onEdit,
    onDelete,
    onShow
}: ServiceProvidersTableProps) {

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
                <p className="text-gray-2">لا يوجد مقدمي خدمات للعرض</p>
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
                                اسم مقدم الخدمة
                            </th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-1 text-start">
                                البريد الإلكتروني
                            </th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-1 text-center">
                                عدد الخدمات
                            </th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-1 text-center">
                                خدمات تحت المراجعة
                            </th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-1 text-center">
                                حالة التاجر
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
                            const servicesCount = (store as Store).services_count || 0;
                            const lastActive = store.owner?.last_login_at ? getRelativeTimeArabic(store.owner.last_login_at) : "-";

                            return (
                                <tr key={store.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border border-gray-100">
                                                <AvatarImage src={store.owner?.avatar_url || ""} alt={store.owner?.first_name} />
                                                <AvatarFallback>{store.owner?.first_name?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium ">
                                                    {store.owner?.first_name} {store.owner?.last_name}
                                                </span>
                                                <span className="text-xs text-gray-2">{store.name}</span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-sm text-blue-3  font-medium">
                                        {store.owner?.email || store.email || "-"}
                                    </td>

                                    <td className="px-6 py-4 text-sm text-blue-4 font-medium text-center">
                                        {servicesCount} خدمات
                                    </td>
                                    <td className="px-6 py-4 text-sm text-blue-4 font-medium text-center">
                                        {store.pending_services_count} خدمات
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center items-center gap-2">
                                            <span className={`text-xs font-medium ${store.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                                                {store.status === 'active' ? 'نشط' : 'موقوف'}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-sm text-blue-3 text-center font-medium">
                                        {lastActive}
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => onEdit(store)}
                                                className="w-8 h-8  cursor-pointer flex items-center justify-center rounded-xs bg-blue-5 text-[#3A5779] hover:bg-[#e0eaff] transition-colors"
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
                                                onClick={() => onShow(store)}
                                                className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-xs bg-[#E5FBFF] text-[#1298B2] hover:bg-[#d0f5fc] transition-colors"
                                                title="عرض التفاصيل"
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