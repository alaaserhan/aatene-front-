// src/features/(dashboard)/services/components/ServicesTable.tsx
"use client";

import { useState } from "react";
import { Eye, Pencil, Trash2, Loader2, MoreHorizontal } from "lucide-react";
import { Service } from "../api";
import { ToggleSwitch } from "@/src/components/ui/ToggleSwitch";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Pagination } from "@/src/components/ui/Pagination";

interface ServicesTableProps {
    services: Service[];
    isLoading: boolean;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onToggleStatus: (service: Service) => void;
    onEdit: (service: Service) => void;
    onDelete: (service: Service) => void;
}

export function ServicesTable({
    services,
    isLoading,
    currentPage,
    totalPages,
    onPageChange,
    onToggleStatus,
    onEdit,
    onDelete,
}: ServicesTableProps) {

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] bg-white rounded-lg border border-gray-200">
                <Loader2 className="w-8 h-8 animate-spin text-blue-3" />
            </div>
        );
    }

    if (services.length === 0) {
        return (
            <div className="flex flex-col min-h-[400px] items-center justify-center bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">لا توجد خدمات للعرض</p>
            </div>
        );
    }

    // دالة مساعدة لترجمة نوع التنفيذ
    const getExecuteTypeLabel = (type: string) => {
        const map: Record<string, string> = {
            min: "دقيقة",
            hour: "ساعة",
            day: "يوم",
            week: "أسبوع",
            month: "شهر",
            year: "سنة",
        };
        return map[type] || type;
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col h-full">
            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-[#F0F0F0] border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-sm font-medium text-gray-1 text-center">ID</th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-1 text-start">الخدمة</th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-1 text-center">السعر</th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-1 text-center">مدة التنفيذ</th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-1 text-center">الحالة</th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-1 text-center">عمليات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {services.map((service) => (
                            <tr key={service.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4 text-sm font-medium text-center text-gray-500">
                                    #{service.id}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                                            {service.images_urls?.[0] ? (
                                                <img
                                                    src={service.images_urls[0]}
                                                    alt={service.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                                                    No IMG
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-sm font-medium text-gray-900 line-clamp-2 max-w-[200px]">
                                            {service.title}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-center text-blue-600">
                                    {Number(service.price).toLocaleString()} ر.س
                                </td>
                                <td className="px-6 py-4 text-sm text-center text-gray-600">
                                    {service.execute_count} {getExecuteTypeLabel(service.execute_type)}
                                </td>
                                
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center">
                                        <ToggleSwitch
                                            enabled={service.status === "approved"}
                                            onChange={() => onToggleStatus(service)}
                                        />
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center">
                                        <DropdownMenu dir="rtl">
                                            <DropdownMenuTrigger asChild>
                                                <button type="button" className="w-8 h-8 flex items-center justify-center rounded-xs text-blue-3 bg-blue-5 cursor-pointer hover:bg-blue-100 transition-colors">
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40 border-gray-100 shadow-lg">
                                                <DropdownMenuItem 
                                                    className="cursor-pointer gap-2 text-gray-700 focus:text-blue-600 focus:bg-blue-50"
                                                    onClick={() => onEdit(service)}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                    <span>تعديل</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    className="cursor-pointer gap-2 text-red-600 focus:text-red-700 focus:bg-red-50"
                                                    onClick={() => onDelete(service)}
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