// src/features/(dashboard)/services/components/ServicesTable.tsx
"use client";

import { useState } from "react";
import { Pencil, Trash2, Loader2, MoreHorizontal, Eye } from "lucide-react";
import { Service } from "../api";
import { ToggleSwitch } from "@/src/components/ui/ToggleSwitch";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Pagination } from "@/src/components/ui/Pagination";
import { VideoOrImage } from "@/src/components/ui/VideoOrImage";

interface ServicesTableProps {
    services: Service[];
    isLoading: boolean;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onToggleShown: (service: Service) => void;
    onEdit: (service: Service) => void;
    onDelete: (service: Service) => void;
    onReview: (service: Service) => void;
    activeStatus?: "approved" | "pending" | "rejected";
}

export function ServicesTable({
    services,
    isLoading,
    currentPage,
    totalPages,
    onPageChange,
    onToggleShown,
    onReview,
    onEdit,
    onDelete,
    activeStatus = "approved",
}: ServicesTableProps) {

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[#3A5779]" />
            </div>
        );
    }

    if (services.length === 0) {
        return (
            <div className="flex flex-col min-h-[300px] items-center justify-center">
                <p className="text-gray-2">لا توجد خدمات في هذا القسم</p>
            </div>
        );
    }

    return (
          <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full min-w-[900px]">
                    <thead className="bg-[#EEF2F6] border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-medium text-center whitespace-nowrap">كود الخدمة</th>
                            <th className="px-6 py-4 text-xs font-medium text-center whitespace-nowrap">صورة الخدمة</th>
                            <th className="px-6 py-4 text-xs font-medium text-right whitespace-nowrap">عنوان الخدمة</th>

                            {activeStatus === "rejected" && (
                                <>
                                    <th className="px-6 py-4 text-xs font-medium text-center whitespace-nowrap">سبب رفض الخدمة</th>
                                    <th className="px-6 py-4 text-xs font-medium text-center whitespace-nowrap">تاريخ الرد</th>
                                </>
                            )}

                            {activeStatus !== "rejected" && (
                                <>
                                    <th className="px-6 py-4 text-xs font-medium text-center whitespace-nowrap">مشاهدات</th>
                                    <th className="px-6 py-4 text-xs font-medium text-center whitespace-nowrap">عدد التواصل</th>
                                    <th className="px-6 py-4 text-xs font-medium text-center whitespace-nowrap">للمفضلة</th>
                                    <th className="px-6 py-4 text-xs font-medium text-center whitespace-nowrap">مرئي</th>
                                </>
                            )}

                            <th className="px-6 py-4 text-xs font-medium text-center whitespace-nowrap">عمليات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {services.map((service) => (
                            <tr key={service.id} className="hover:bg-gray-50/50 transition-colors">

                                {/* Code */}
                                <td className="px-6 py-4 text-sm font-medium text-center whitespace-nowrap">
                                    {service.id}#
                                </td>

                                {/* Image */}
                                <td className="px-6 py-4">
                                    <div className="flex justify-center">
                                        <div className="w-16 h-12 rounded bg-gray-100 overflow-hidden relative shrink-0">
                                            {service.images_url ? (
                                                <div className="relative w-full h-full pointer-events-none">
                                                    <VideoOrImage
                                                        src={Array.isArray(service.images_url) ? service.images_url[0] : service.images_url}
                                                        alt={service.title}
                                                        fill
                                                        thumb
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-300">
                                                    <span className="text-[10px]">No Img</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                {/* Title */}
                                <td className="px-6 py-4">
                                    <span className="text-sm font-medium line-clamp-2 leading-relaxed">
                                        {service.title}
                                    </span>
                                </td>

                                {/* Rejected Columns */}
                                {activeStatus === "rejected" && (
                                    <>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <span className="text-sm text-red-500 font-medium">
                                                {service.reason || "لا يوجد سبب"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <span className="text-sm text-gray-2 font-medium">
                                                {service.response_date || "-"}
                                            </span>
                                        </td>
                                    </>
                                )}

                                {/* Default Columns */}
                                {activeStatus !== "rejected" && (
                                    <>
                                        {/* Views */}
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <span className="text-sm ">{service.view_count || 0}</span>
                                        </td>

                                        {/* Contacts (Messages) */}
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <span className="text-sm ">{service.messages_count || 0}</span>
                                        </td>

                                        {/* Favorites */}
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <span className="text-sm ">{service.favorites_count || 0}</span>
                                        </td>

                                        {/* Visible Toggle */}
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <div className="flex justify-center">
                                                <ToggleSwitch
                                                    enabled={service.shown || false}
                                                    onChange={() => onToggleShown(service)}
                                                />
                                            </div>
                                        </td>
                                    </>
                                )}

                                {/* Actions */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                                        {/* View */}
                                        <button
                                            onClick={() => onReview(service)}
                                            className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-xs bg-[#E0F7FA] text-[#00ACC1] hover:bg-[#B2EBF2] transition-colors"
                                            title="مشاهدة"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>

                                        {/* More Actions (Grey bg) */}
                                        <DropdownMenu dir="rtl">
                                            <DropdownMenuTrigger asChild>
                                                <button type="button" className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-xs bg-gray-100 text-gray-2 hover:bg-gray-200 transition-colors">
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40 border-gray-100 shadow-lg bg-white">
                                                <DropdownMenuItem
                                                    className="cursor-pointer gap-2 text-blue-3 focus:text-blue-4 focus:bg-blue-50"
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
