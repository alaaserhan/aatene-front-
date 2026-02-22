"use client";

import { Edit, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { NotificationModel } from "../api";
import { useDeleteNotification, useResendNotification } from "../hooks";
import { Loader2 } from "lucide-react";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";
import { formatDate, toLocal } from "@/src/lib/date-helper";
import { format } from "date-fns";
import Image from "next/image";

interface NotificationsTableProps {
    data: NotificationModel[];
    isLoading: boolean;
    onEdit?: (notification: NotificationModel) => void;
}

export function NotificationsTable({ data, isLoading, onEdit }: NotificationsTableProps) {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    const { mutate: deleteNotification, isPending: isDeleting } = useDeleteNotification();
    const { mutate: resendNotification, isPending: isResending } = useResendNotification();

    const handleDelete = () => {
        if (!selectedId) return;
        deleteNotification(selectedId, {
            onSuccess: () => {
                setSuccessMsg("تم حذف الإشعار بنجاح");
                setShowSuccessModal(true);
            },
            onError: () => {
                toast.error("حدث خطأ أثناء الحذف");
            }
        });
    };

    const handleResend = (id: number) => {
        resendNotification(id, {
            onSuccess: () => {
                setSuccessMsg("تم إعادة إرسال الإشعار بنجاح");
                setShowSuccessModal(true);
            },
            onError: () => {
                toast.error("حدث خطأ أثناء إعادة الإرسال");
            }
        });
    };
    if (isLoading) {
        return (
            <div className="w-full h-64 flex items-center justify-center bg-white rounded-lg shadow-sm">
                <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="w-full h-64 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-500">
                لا توجد اشعارات
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* --- Desktop View --- */}
            <div className="hidden md:block overflow-x-auto bg-white rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 font-medium text-gray-500">
                        <tr>
                            <th className="px-6 py-4 whitespace-nowrap text-right">عنوان الاشعار</th>
                            <th className="px-6 py-4 whitespace-nowrap text-right">محتوي الاشعار</th>
                            <th className="px-6 py-4 whitespace-nowrap text-right">أرسل إلى</th>
                            <th className="px-6 py-4 whitespace-nowrap text-right">التاريخ و الوقت</th>
                            <th className="px-6 py-4 whitespace-nowrap text-right">الحالة</th>
                            <th className="px-6 py-4 whitespace-nowrap text-center">عمليات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.map((row) => {
                            const date = formatDate(row.created_at, "dd-MM-yyyy");
                            const time = format(toLocal(row.created_at), "hh:mm a");

                            const sendToMap: Record<string, string> = {
                                all: "الكل",
                                merchant: "تجار",
                                customers: "عملاء",
                                product_stores: "متاجر منتجات",
                                service_stores: "متاجر خدمات",
                                store_followers: "متابعين متجر",
                                selected_users: "اشخاص محددين",
                            };

                            const sendToLabel = row.send_to?.includes("all")
                                ? "الكل"
                                : row.send_to?.map(val => sendToMap[val] || val).join(", ") || "الكل";

                            return (
                                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{row.title}</span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div
                                            className="bg-[#F4F9FF] px-4 py-3 rounded-xl border border-blue-50 max-w-[340px] text-[#4B5563] text-sm whitespace-normal line-clamp-2 leading-relaxed"
                                            title={row.message || row.body}
                                        >
                                            {row.message || row.body}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-gray-700 font-medium truncate max-w-[150px]" title={sendToLabel}>
                                        {sendToLabel}
                                    </td>

                                    <td className="px-6 py-4 text-gray-600 dir-rtl">
                                        {date} - <span>{time}</span>
                                    </td>

                                    <td className="px-6 py-4 font-medium">
                                        {row.status === "sent" && "تم الإرسال"}
                                        {row.status === "scheduled" && "مجدول"}
                                        {row.status === "draft" && "مسودة"}
                                        {row.status === "failed" && "فشل"}
                                        {row.status === "sending" && "جاري الإرسال"}
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedId(row.id);
                                                    setShowDeleteModal(true);
                                                }}
                                                className="p-2 cursor-pointer bg-red-2 text-red-500 rounded-md hover:bg-red-100 transition-colors"
                                                disabled={isDeleting}
                                            >
                                                <Image src="/icons/dashboard/trash.svg" width={16} height={16} className="w-4 h-4" alt="" />
                                            </button>

                                            {row.status === "draft" && (
                                                <button
                                                    onClick={() => onEdit?.(row)}
                                                    className="p-2 cursor-pointer bg-blue-50 text-blue-500 rounded-md hover:bg-blue-100 transition-colors"
                                                >
                                                    <Image src="/icons/dashboard/edit.svg" width={16} height={16} className="w-4 h-4" alt="" />
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleResend(row.id)}
                                                className="p-2 cursor-pointer bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                                                disabled={isResending}
                                            >
                                                <RefreshCw className={cn("w-4 h-4", isResending && "animate-spin")} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* --- Mobile View --- */}
            <div className="md:hidden space-y-4 pb-20">
                {data.map((row) => {
                    const date = formatDate(row.created_at, "dd-MM-yyyy");
                    const time = format(toLocal(row.created_at), "hh:mm a");

                    const sendToMap: Record<string, string> = {
                        all: "الكل",
                        merchant: "تجار",
                        customers: "عملاء",
                        product_stores: "متاجر منتجات",
                        service_stores: "متاجر خدمات",
                        store_followers: "متابعين متجر",
                        selected_users: "اشخاص محددين",
                    };

                    const sendToLabel = row.send_to?.includes("all")
                        ? "الكل"
                        : row.send_to?.map(val => sendToMap[val] || val).join(", ") || "الكل";

                    return (
                        <div key={row.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-4">
                            <div className="flex items-start justify-between">
                                <span className="font-medium  text-sm">{row.title}</span>
                                <div className="text-xs font-medium min-w-[70px] text-center px-2 py-1 rounded-full bg-blue-5 text-blue-3">
                                    {row.status === "sent" && "تم الإرسال"}
                                    {row.status === "scheduled" && "مجدول"}
                                    {row.status === "draft" && "مسودة"}
                                    {row.status === "failed" && "فشل"}
                                    {row.status === "sending" && "جاري الإرسال"}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <span className="text-sm text-gray-400">أرسل إلى:</span>
                                <p className="text-sm font-medium text-gray-700">{sendToLabel}</p>
                            </div>

                            <div className="space-y-1">
                                <span className="text-sm text-gray-400 mb-1">محتوى الإشعار:</span>
                                <div className="bg-[#F4F9FF] p-3 mt-1 rounded-lg border border-blue-50 text-gray-600 text-sm leading-relaxed">
                                    {row.message || row.body}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                <div className="text-xs text-gray-400 dir-rtl">
                                    {date} - {time}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedId(row.id);
                                            setShowDeleteModal(true);
                                        }}
                                        className="p-2 cursor-pointer bg-red-2 text-red-500 rounded-md hover:bg-red-100 transition-colors"
                                        disabled={isDeleting}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    {row.status === "draft" && (
                                        <button
                                            onClick={() => onEdit?.(row)}
                                            className="p-2 cursor-pointer bg-blue-50 text-blue-500 rounded-md hover:bg-blue-100 transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleResend(row.id)}
                                        className="p-2 cursor-pointer bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                                        disabled={isResending}
                                    >
                                        <RefreshCw className={cn("w-4 h-4", isResending && "animate-spin")} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <ConfirmDeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="هل أنت متأكد من حذف هذا الإشعار؟"
                description="سيتم حذف الإشعار نهائياً من القائمة."
            />

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="نجاح!"
                message={successMsg}
            />
        </div>
    );
}
