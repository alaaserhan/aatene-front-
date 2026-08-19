"use client";

import { Bell, BellOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { toLocal } from "@/src/lib/date-helper";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Button } from "@/src/components/ui/button";
import type { DashboardNotification } from "@/src/features/(web)/notifications/api";
import { notificationBodyToText } from "@/src/lib/utils";

interface NotificationListProps {
    notifications: DashboardNotification[];
    onItemClick: () => void;
    onViewAllClick: () => void;
}

export function NotificationList({ notifications, onItemClick, onViewAllClick }: NotificationListProps) {
    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-c2-navy-700-a08">
                    <BellOff className="size-5 text-c2-navy-300" />
                </span>
                <p className="text-sm text-c2-neutral-600">لا توجد إشعارات جديدة</p>
            </div>
        );
    }

    return (
        <>
            {/* Radix ScrollArea.Root defaults to dir="ltr" and would override the popover's rtl. */}
            <ScrollArea dir="rtl" className="max-h-96">
                <div className="flex flex-col gap-0.5 p-1.5">
                    {notifications.map((notification) => (
                        <button
                            key={notification.id}
                            type="button"
                            className={`group w-full rounded-lg p-3 outline-none cursor-pointer transition-colors flex items-start gap-3 text-start hover:bg-c2-neutral-50 ${
                                notification.seen ? "" : "bg-c2-navy-700-a08"
                            }`}
                            onClick={onItemClick}
                        >
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-c2-navy-700-a08 text-c2-primary">
                                <Bell className="size-4.5" />
                            </span>
                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                                <h4
                                    className={`text-sm leading-6 line-clamp-1 ${
                                        notification.seen ? "font-normal text-c2-neutral-800" : "font-semibold text-c2-navy-900"
                                    }`}
                                >
                                    {notification.title}
                                </h4>
                                <p className="text-[13px] leading-5 text-c2-neutral-600 line-clamp-2">
                                    {notificationBodyToText(notification.body)}
                                </p>
                                <span className="text-xs text-c2-navy-300">
                                    {notification.created_at
                                        ? formatDistanceToNow(toLocal(notification.created_at), { addSuffix: true, locale: ar })
                                        : "الآن"}
                                </span>
                            </div>
                            {!notification.seen && <span className="mt-2 size-2 shrink-0 rounded-full bg-c2-danger" />}
                        </button>
                    ))}
                </div>
            </ScrollArea>
            <div className="p-1.5 pt-1 w-full">
                <Button
                    variant="ghost"
                    className="w-full text-sm h-10 font-medium text-c2-primary hover:bg-c2-navy-700-a08 hover:text-c2-primary cursor-pointer"
                    onClick={onViewAllClick}
                >
                    عرض جميع الإشعارات
                </Button>
            </div>
        </>
    );
}
