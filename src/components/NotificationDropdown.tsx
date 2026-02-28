"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { useLanguage } from "@/src/hooks/use-language";
import { useMyNotifications, useMyNotificationStats } from "@/src/features/(web)/notifications/hooks";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from "@/src/components/ui/dropdown-menu";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";
import { Button } from "@/src/components/ui/button";

interface NotificationDropdownProps {
    variant?: "web" | "dashboard";
}

export function NotificationDropdown({ variant = "web" }: NotificationDropdownProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const lang = useLanguage();
    const { data: notificationsData } = useMyNotifications(1, 4);
    const notifications = notificationsData?.notifications || [];

    const { data: statsData } = useMyNotificationStats();
    const unreadCount = statsData?.unseen || 0;

    const handleNotificationsClick = () => {
        setOpen(false);
        router.push(`/${lang}/notifications`); // Use standard routing instead of root redirect
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen} dir="rtl">
            <DropdownMenuTrigger asChild>
                {variant === "dashboard" ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-lg outline-none hover:bg-white/20 relative cursor-pointer"
                        aria-label="الإشعارات"
                    >
                        <img src="/icons/ring.svg" className="w-5 h-5" alt="notifications" />
                        {unreadCount > 0 && (
                            <Badge
                                className="absolute bg-red-600 -top-1 text-white -right-1 h-4 w-4 justify-center p-0 text-[10px]"
                                variant="destructive"
                            >
                                {unreadCount}
                            </Badge>
                        )}
                    </Button>
                ) : (
                    <button className="cursor-pointer relative bg-gray-4 rounded-full p-1.5" aria-label="الإشعارات">
                        <img src="/icons/Notification.svg" alt="notifications" className="h-6 w-6" />
                        {unreadCount > 0 && (
                            <Badge
                                className="absolute bg-red-600 -top-1 text-white -right-1 h-4 w-4 justify-center p-0 text-[10px]"
                                variant="destructive"
                            >
                                {unreadCount}
                            </Badge>
                        )}
                    </button>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-[280px] p-2 border-none shadow-sm rounded-sm bg-white max-h-[85vh] overflow-y-auto custom-scrollbar"
                sideOffset={8}
            >
                <DropdownMenuLabel className="p-2">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium text-blue-4">الإشعارات</h3>
                        {unreadCount > 0 && (
                            <Badge variant="secondary" className="bg-blue-5 text-blue-4">
                                {unreadCount} جديد
                            </Badge>
                        )}
                    </div>
                </DropdownMenuLabel>
                <Separator className=" bg-gray-50" />
                <div className="flex flex-col max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                    {notifications.length === 0 ? (
                        <p className="text-sm text-gray-2 text-center py-4">
                            لا توجد إشعارات جديدة
                        </p>
                    ) : (
                        <>
                            {notifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className="p-2 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 outline-none cursor-pointer transition-colors mb-1 shadow-none flex flex-col rounded-none items-start focus:bg-gray-50 align-top"
                                    onClick={handleNotificationsClick}
                                >
                                    <div className="flex w-full items-center justify-between gap-2 mb-1">
                                        <h4 className="text-sm font-medium text-blue-4 truncate">{notification.title}</h4>
                                        <span className="text-[10px] text-gray-2 whitespace-nowrap shrink-0">
                                            {notification.created_at ? formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ar }) : 'الآن'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-2 line-clamp-1">{notification.body}</p>
                                </DropdownMenuItem>
                            ))}
                            <div className="p-2 pt-0 w-full mt-2">
                                <Button
                                    variant="outline"
                                    className="w-full bg-blue-5 text-xs h-8 text-blue-4 border-blue-200 hover:bg-blue-50 cursor-pointer"
                                    onClick={handleNotificationsClick}
                                >
                                    عرض جميع الإشعارات
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
