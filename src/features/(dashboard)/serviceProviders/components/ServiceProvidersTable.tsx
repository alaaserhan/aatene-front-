// src/features/(dashboard)/stores/components/ServiceProvidersTable.tsx
"use client";

import { BriefcaseBusiness, Eye, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
    onEdit: (store: Store) => void;
    onDelete: (store: Store) => void;
    onPreview: (store: Store) => void;
    onManageServices: (store: Store) => void;
}

export function ServiceProvidersTable({
    stores,
    isLoading,
    currentPage,
    totalPages,
    onPageChange,
    onEdit,
    onDelete,
    onPreview,
    onManageServices,
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
                <table className="w-full text-right min-w-[900px]">
                    <thead className="bg-[#F9FAFB] border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-sm font-medium text-gray-1 text-start whitespace-nowrap">
                                اسم مقدم الخدمة
                            </th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-1 text-start whitespace-nowrap">
                                البريد الإلكتروني
                            </th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-1 text-center whitespace-nowrap">
                                عدد الخدمات
                            </th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-1 text-center whitespace-nowrap">
                                خدمات تحت المراجعة
                            </th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-1 text-center whitespace-nowrap">
                                حالة التاجر
                            </th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-1 text-center whitespace-nowrap">
                                آخر نشاط
                            </th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-1 text-center whitespace-nowrap">
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
                                            <Avatar className="h-10 w-10 border border-gray-100 shrink-0">
                                                <AvatarImage src={store.owner?.avatar_url || ""} alt={store.owner?.first_name} />
                                                <AvatarFallback>{store.owner?.first_name?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium whitespace-nowrap">
                                                    {store.owner?.first_name} {store.owner?.last_name}
                                                </span>
                                                <span className="text-xs text-gray-2">{store.name}</span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-sm text-blue-3 font-medium whitespace-nowrap">
                                        {store.owner?.email || store.email || "-"}
                                    </td>

                                    <td className="px-6 py-4 text-sm text-blue-4 font-medium text-center whitespace-nowrap">
                                        {servicesCount} خدمات
                                    </td>
                                    <td className="px-6 py-4 text-sm text-blue-4 font-medium text-center whitespace-nowrap">
                                        {store.pending_services_count} خدمات
                                    </td>

                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                        <div className="flex justify-center items-center gap-2">
                                            <span className={`text-xs font-medium ${store.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                                                {store.status === 'approved' ? 'نشط' : 'موقوف'}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-sm text-blue-3 text-center font-medium whitespace-nowrap">
                                        {lastActive}
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="hidden sm:flex items-center gap-2">
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
                                                    onClick={() => onManageServices(store)}
                                                    className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-xs bg-[#EEF2F6] text-[#3A5779] hover:bg-[#dbe5ef] transition-colors"
                                                    title="إدارة خدمات المتجر"
                                                >
                                                    <BriefcaseBusiness className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onPreview(store)}
                                                    className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-xs bg-[#E5FBFF] text-[#1298B2] hover:bg-[#d0f5fc] transition-colors"
                                                    title="معاينة المتجر"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="sm:hidden">
                                                <DropdownMenu dir="rtl">
                                                    <DropdownMenuTrigger asChild>
                                                        <button type="button" className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-xs bg-gray-100 text-gray-2 hover:bg-gray-200 transition-colors">
                                                            <MoreHorizontal className="w-5 h-5" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-44 border-gray-100 shadow-lg bg-white">
                                                        <DropdownMenuItem className="cursor-pointer gap-2 text-blue-3 focus:text-blue-4 focus:bg-blue-50" onClick={() => onEdit(store)}>
                                                            <img src="/icons/dashboard/edit3.svg" className="w-4 h-4" alt="edit" />
                                                            <span>تعديل</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="cursor-pointer gap-2 text-red-600 focus:text-red-700 focus:bg-red-50" onClick={() => onDelete(store)}>
                                                            <img src="/icons/dashboard/trash.svg" className="w-4 h-4" alt="delete" />
                                                            <span>حذف</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="cursor-pointer gap-2 text-blue-3 focus:text-blue-4 focus:bg-blue-50" onClick={() => onManageServices(store)}>
                                                            <BriefcaseBusiness className="w-4 h-4" />
                                                            <span>إدارة الخدمات</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="cursor-pointer gap-2 text-blue-3 focus:text-blue-4 focus:bg-blue-50" onClick={() => onPreview(store)}>
                                                            <Eye className="w-4 h-4" />
                                                            <span>معاينة</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
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
