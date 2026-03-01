"use client";

import { useState, useEffect } from "react";
import { useMyNotifications, useMarkNotificationsAsSeen, useDeleteNotification } from "../hooks";
import { Pagination } from "@/src/components/ui/Pagination";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Loader2, Trash2 } from "lucide-react";

export default function NotificationsPage() {
    const [page, setPage] = useState(1);
    const { data, isLoading } = useMyNotifications(page, 10);
    const { mutate: markAsSeen } = useMarkNotificationsAsSeen();
    const { mutate: deleteNotification } = useDeleteNotification();

    const notifications = data?.notifications || [];
    const totalPages = data ? Math.ceil(data.recordsTotal / 10) : 1;

    useEffect(() => {
        const unseenIds = notifications.filter(n => !n.seen).map(n => n.id);
        if (unseenIds.length > 0) {
            markAsSeen(unseenIds);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notifications]);

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-4" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 my-6 " dir="rtl">
            <h1 className="text-2xl font-medium mb-6 ">تنبيهاتي</h1>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                        <p className="text-gray-2 font-medium">لا توجد تنبيهات حالياً</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`bg-white border border-gray-200 rounded-xl p-3 md:p-4 flex flex-col gap-4 relative group transition-colors ${!notification.seen ? 'border-blue-100 bg-[#f4f7fa]' : 'border-gray-200 hover:border-[#456A8E]/30'}`}
                        >
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    deleteNotification(notification.id);
                                }}
                                className="absolute top-4 left-4 p-2 bg-red-2 rounded-md cursor-pointer"
                                title="حذف التنبيه"
                            >
                                <img src="/icons/dashboard/trash.svg" alt="" className="w-4 h-4" />
                            </button>

                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-medium text-gray-2">
                                    {notification.created_at ? formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ar }) : 'الآن'}
                                </p>

                                <div>
                                    {notification.title && <h3 className="font-semimedium  text-base mb-1">{notification.title}</h3>}
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed font-medium">
                                        {notification.body}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center pb-8">
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
