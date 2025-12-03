// src/features/(dashboard)/services/components/ServiceTable.tsx
"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Loader2, Eye, Clock } from "lucide-react";
import { Service } from "../api";
import { ToggleSwitch } from "@/src/components/ui/ToggleSwitch";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Pagination } from "@/src/components/ui/Pagination";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { cn } from "@/src/lib/utils";

interface ServiceTableProps {
    services: Service[];
    isLoading: boolean;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onToggleStatus: (service: Service) => void;
    onEdit: (service: Service) => void;
    onDelete: (id: number) => void;
}

export function ServiceTable({
    services,
    isLoading,
    currentPage,
    totalPages,
    onPageChange,
    onToggleStatus,
    onEdit,
    onDelete,
}: ServiceTableProps) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);

    const handleDeleteClick = (id: number) => {
        setServiceToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (serviceToDelete) {
            onDelete(serviceToDelete);
            setDeleteModalOpen(false);
            setServiceToDelete(null);
        }
    };

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
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Eye className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">لا توجد خدمات للعرض</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col h-full shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-[#F9FAFB] border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-sm font-medium text-gray-500 text-center w-24">
                                الصورة
                            </th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-500 text-start">
                                اسم الخدمة
                            </th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-500 text-center">
                                السعر
                            </th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-500 text-center">
                                مدة التنفيذ
                            </th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-500 text-center">
                                الحالة
                            </th>
                            <th className="px-6 py-4 text-sm font-medium text-gray-500 text-center">
                                عمليات
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {services.map((service) => (
                            <tr key={service.id} className="hover:bg-gray-50/60 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex justify-center">
                                        <div className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden">
                                            {service.images_urls && service.images_urls.length > 0 ? (
                                                <img
                                                    src={service.images_urls[0]}
                                                    alt={service.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <Eye className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-bold text-gray-900 line-clamp-1">
                                        {service.title}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="text-sm font-bold text-[#3A5779]">
                                        {Number(service.price).toFixed(2)}
                                        <span className="text-xs font-normal text-gray-500 mr-1">ر.س</span>
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full w-fit mx-auto border border-gray-200">
                                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                                        <span>{service.execute_count}</span>
                                        <span className="text-gray-400">
                                            {service.execute_type === "day" ? "أيام" : 
                                             service.execute_type === "hour" ? "ساعات" : service.execute_type}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center">
                                        <ToggleSwitch
                                            enabled={service.status === "approved" || service.status === "pending"}
                                            onChange={() => onToggleStatus(service)}
                                        />
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center">
                                        <DropdownMenu dir="rtl">
                                            <DropdownMenuTrigger asChild>
                                                <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 transition-colors">
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40 border-gray-100 shadow-lg">
                                                <DropdownMenuItem
                                                    className="cursor-pointer gap-2 focus:bg-gray-50"
                                                    onClick={() => onEdit(service)}
                                                >
                                                    <Pencil className="w-4 h-4 text-blue-500" />
                                                    <span className="font-medium">تعديل</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="cursor-pointer gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                                                    onClick={() => handleDeleteClick(service.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span className="font-medium">حذف</span>
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
                <div className="p-4 border-t border-gray-200 mt-auto bg-gray-50">
                    <Pagination
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={onPageChange}
                    />
                </div>
            )}

            <ConfirmDeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="حذف الخدمة"
                description="هل أنت متأكد من رغبتك في حذف هذه الخدمة؟ لا يمكن التراجع عن هذا الإجراء."
            />
        </div>
    );
}