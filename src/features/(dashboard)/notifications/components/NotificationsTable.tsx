"use client";

import { Edit, RefreshCw, Trash2, Bell } from "lucide-react";
import { ToggleSwitch } from "@/src/components/ui/ToggleSwitch";
import { NotificationModel } from "../api";
import { Loader2 } from "lucide-react";

interface NotificationsTableProps {
    data: NotificationModel[];
    isLoading: boolean;
}

export function NotificationsTable({ data, isLoading }: NotificationsTableProps) {
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

                        const isSent = row.status === "sent";
                        // Helper to get send_to label
                        const sendToLabel = row.send_to?.join(", ") || "الكل";

                        return (
                            <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                                {/* Title + Indicator */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium ">{row.title}</span>

                                    </div>
                                </td>

                                {/* Content */}
                                <td className="px-6 py-4">
                                    <div className="bg-blue-5 px-3 py-2 rounded-md max-w-[300px] text-gray-700 whitespace-normal line-clamp-2" title={row.message || row.body}>
                                        {row.message || row.body}
                                    </div>
                                </td>

                                {/* Sent To */}
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

                                        <button className="p-2 cursor-pointer bg-red-2 text-red-500 rounded-md hover:bg-red-100 transition-colors">
                                            <img src="/icons/dashboard/trash.svg" className="w-4 h-4" alt="" />
                                        </button>

                                        <button className="p-2 cursor-pointer bg-blue-50 text-blue-500 rounded-md hover:bg-blue-100 transition-colors">
                                            <img src="/icons/dashboard/edit.svg" className="w-4 h-4" alt="" />
                                        </button>

                                        <button className="p-2 cursor-pointer bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors">
                                            <RefreshCw className="w-4 h-4" />
                                        </button>

                                        {/* <button className="p-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors">
                                            <Bell className="w-4 h-4" />
                                        </button> */}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
