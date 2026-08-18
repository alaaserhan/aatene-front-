"use client";

import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { toLocal } from "@/src/lib/date-helper";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Button } from "@/src/components/ui/button";
import type { DashboardNotification } from "@/src/features/(web)/notifications/api";

// Notification body can be plain text, JSON, or HTML — normalize it to plain text.
function cleanNotificationBody(body: string): string {
    if (!body) return "";
    try {
        const parsed = JSON.parse(body);
        if (typeof parsed === "object" && parsed !== null) {
            return parsed.message || parsed.body || parsed.text || parsed.title || JSON.stringify(parsed);
        }
        return String(parsed);
    } catch {
        return body.replace(/<[^>]*>/g, "").trim();
    }
}

interface NotificationListProps {
    notifications: DashboardNotification[];
    onItemClick: () => void;
    onViewAllClick: () => void;
}

export function NotificationList({ notifications, onItemClick, onViewAllClick }: NotificationListProps) {
    if (notifications.length === 0) {
        return <p className="text-sm text-gray-2 text-center py-4">لا توجد إشعارات جديدة</p>;
    }

    return (
        <>
            <ScrollArea className="max-h-75">
                <div className="flex flex-col p-1">
                    {notifications.map((notification) => (
                        <button
                            key={notification.id}
                            type="button"
                            className="w-full p-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 outline-none cursor-pointer transition-colors mb-1 flex flex-col items-start text-start"
                            onClick={onItemClick}
                        >
                            <div className="flex w-full items-center justify-between gap-2 mb-1">
                                <h4 className="text-sm font-medium text-blue-4 truncate">{notification.title}</h4>
                                <span className="text-[10px] text-gray-2 whitespace-nowrap shrink-0">
                                    {notification.created_at
                                        ? formatDistanceToNow(toLocal(notification.created_at), { addSuffix: true, locale: ar })
                                        : "الآن"}
                                </span>
                            </div>
                            <p className="text-xs text-gray-2 line-clamp-1">{cleanNotificationBody(notification.body)}</p>
                        </button>
                    ))}
                </div>
            </ScrollArea>
            <div className="p-2 pt-0 w-full mt-2">
                <Button
                    variant="outline"
                    className="w-full bg-blue-5 text-xs h-8 text-blue-4 border-blue-200 hover:bg-blue-50 cursor-pointer"
                    onClick={onViewAllClick}
                >
                    عرض جميع الإشعارات
                </Button>
            </div>
        </>
    );
}
