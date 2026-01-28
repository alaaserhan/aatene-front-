"use client";

import { Loader2 } from "lucide-react";
import { NotificationTemplate } from "../api";
import { useDeleteNotificationTemplate } from "../hooks";
import { format } from "date-fns";
import { formatDate, toLocal } from "@/src/lib/date-helper";

interface NotificationTemplatesTableProps {
    data: NotificationTemplate[];
    isLoading: boolean;
}

export function NotificationTemplatesTable({ data, isLoading, onEdit }: NotificationTemplatesTableProps & { onEdit: (template: NotificationTemplate) => void }) {
    const deleteMutation = useDeleteNotificationTemplate();

    const handleDelete = (id: number) => {
        if (confirm("هل انت متأكد من حذف هذا القالب؟")) {
            deleteMutation.mutate(id);
        }
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
                لا توجد قوالب
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto bg-white rounded-lg border border-gray-200 text-right" dir="rtl">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 font-medium text-gray-500">
                    <tr>
                        <th className="px-6 py-4 whitespace-nowrap text-start">عنوان القالب</th>
                        <th className="px-6 py-4 whitespace-nowrap text-center">تم الانشاء</th>
                        <th className="px-6 py-4 whitespace-nowrap text-start">عمليات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.map((row) => {
                        const date = formatDate(row.created_at, "dd-MM-yyyy");
                        const time = format(toLocal(row.created_at), "hh:mm a");

                        return (
                            <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                                {/* Title */}
                                <td className="px-6 py-4">
                                    <span className="font-medium text-gray-900">{row.title}</span>
                                </td>

                                {/* Created At */}
                                <td className="px-6 py-4 text-center text-gray-600 dir-rtl">
                                    {date} - {time}
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleDelete(row.id)}
                                            disabled={deleteMutation.isPending}
                                            className="p-2 cursor-pointer bg-red-2 text-red-500 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50"
                                        >
                                            <img src="/icons/dashboard/trash.svg" className="w-4 h-4" alt="delete" />
                                        </button>

                                        <button
                                            onClick={() => onEdit(row)}
                                            className="p-2 cursor-pointer bg-blue-50 text-blue-500 rounded-md hover:bg-blue-100 transition-colors"
                                        >
                                            <img src="/icons/dashboard/edit.svg" className="w-4 h-4" alt="edit" />
                                        </button>
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
