"use client";

import { useState, useEffect } from "react";
import { useMyNotifications, useMarkNotificationsAsSeen, useDeleteNotification } from "../hooks";
import { Pagination } from "@/src/components/ui/Pagination";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { toLocal } from "@/src/lib/date-helper";

export default function NotificationsPage() {
    const [page, setPage] = useState(1);
    const { data, isLoading } = useMyNotifications(page, 6);
    const { mutate: markAsSeen } = useMarkNotificationsAsSeen();
    const { mutate: deleteNotification } = useDeleteNotification();
    const [visuallyUnseenIds, setVisuallyUnseenIds] = useState<Set<number>>(new Set());

    const notifications = data?.notifications || [];
    const totalPages = data ? Math.ceil(data.recordsTotal / 6) : 1;

    useEffect(() => {
        const unseenIds = notifications.filter(n => !n.seen).map(n => n.id);
        if (unseenIds.length > 0) {
            setVisuallyUnseenIds(prev => {
                const next = new Set(prev);
                unseenIds.forEach(id => next.add(id));
                return next;
            });
            markAsSeen(unseenIds);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notifications]);

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
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
                    notifications.map((notification) => {
                        const isVisuallyUnseen = !notification.seen || visuallyUnseenIds.has(notification.id);
                        return (
                            <div
                                key={notification.id}
                                className={`bg-white border rounded-xl p-3 md:p-4 flex flex-col gap-4 relative group transition-all duration-300 border-gray-100 hover:border-gray-200 ${isVisuallyUnseen ? ' bg-blue-50/40 shadow-sm' : ' shadow-xs'}`}
                            >
                                <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                                    {/* Unread Indicator */}
                                    {isVisuallyUnseen && (
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                            </span>
                                            <span className="text-[10px] font-bold text-blue-600 bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded-full uppercase tracking-wider">جديد</span>
                                        </div>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            deleteNotification(notification.id);
                                        }}
                                        className="p-2 bg-red-50  text-red-500 rounded-lg cursor-pointer transition-all shrink-0"
                                        title="حذف التنبيه"
                                    >
                                        <Image src="/icons/dashboard/trash.svg" alt="" width={16} height={16} className="w-4 h-4" />
                                    </button>

                                </div>

                                <div className="flex flex-col gap-2">
                                    <p className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                                        <span className={`w-1.5 h-1.5 rounded-full ${isVisuallyUnseen ? 'bg-blue-400' : 'bg-gray-300'}`}></span>
                                        {notification.created_at ? formatDistanceToNow(toLocal(notification.created_at), { addSuffix: true, locale: ar }) : 'الآن'}
                                    </p>

                                    <div>
                                        {notification.title && <h3 className={`font-medium text-base mb-1 ${isVisuallyUnseen ? 'text-[#395A7D]' : 'text-gray-800'}`}>{notification.title}</h3>}
                                        <p className={`text-sm whitespace-pre-wrap leading-relaxed ${isVisuallyUnseen ? 'text-gray-700' : 'text-gray-500'}`}>
                                            {notification.body}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })
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
