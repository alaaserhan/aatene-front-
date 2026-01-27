"use client";

import { Edit, RefreshCw, Trash2, Bell } from "lucide-react";
import { useState } from "react";
import { NotificationModel } from "../api";
import { useDeleteNotification, useResendNotification } from "../hooks";
import { Loader2 } from "lucide-react";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";

interface NotificationsTableProps {
    data: NotificationModel[];
    isLoading: boolean;
}

export function NotificationsTable({ data, isLoading }: NotificationsTableProps) {
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
        <div className="w-full overflow-x-auto bg-white rounded-lg border border-gray-200">
            <table className="w-full text-sm ">
                <thead className="bg-gray-50 font-medium text-gray-500">
                    <tr>
                        <th className="px-6 py-4 whitespace-nowrap">عنوان الاشعار</th>
                        <th className="px-6 py-4 whitespace-nowrap">محتوي الاشعار</th>
                        <th className="px-6 py-4 whitespace-nowrap">أرسل إلى</th>
                        <th className="px-6 py-4 whitespace-nowrap">التاريخ و الوقت</th>
                        <th className="px-6 py-4 whitespace-nowrap">الحالة</th>
                        <th className="px-6 py-4 whitespace-nowrap text-center">عمليات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.map((row) => {
                        const dateObj = new Date(row.created_at);
                        const date = dateObj.toLocaleDateString("en-GB"); // DD/MM/YYYY
                        const time = dateObj.toLocaleTimeString("en-US", { hour: 'numeric', minute: 'numeric', hour12: true });

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
                                        <span className="font-medium ">{row.title}</span>
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

                                {/* Date & Time */}
                                <td className="px-6 py-4 text-gray-600 dir-rtl">
                                    {date} - <span>{time}</span>
                                </td>

                                {/* Status */}
                                <td className="px-6 py-4  font-medium">
                                    {row.status === "sent" && "تم الإرسال"}
                                    {row.status === "scheduled" && "مجدول"}
                                    {row.status === "draft" && "مسودة"}
                                    {row.status === "failed" && "فشل"}
                                    {row.status === "sending" && "جاري الإرسال"}
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        {/* <ToggleSwitch
                                            enabled={row.status === "sent"} 
                                            onChange={() => { }}
                                            disabled 
                                        /> */}

                                        <button
                                            onClick={() => {
                                                setSelectedId(row.id);
                                                setShowDeleteModal(true);
                                            }}
                                            className="p-2 cursor-pointer bg-red-2 text-red-500 rounded-md hover:bg-red-100 transition-colors"
                                            disabled={isDeleting}
                                        >
                                            <img src="/icons/dashboard/trash.svg" className="w-4 h-4" alt="" />
                                        </button>

                                        {row.status === "draft" && (
                                            <button className="p-2 cursor-pointer bg-blue-50 text-blue-500 rounded-md hover:bg-blue-100 transition-colors">
                                                <img src="/icons/dashboard/edit.svg" className="w-4 h-4" alt="" />
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
