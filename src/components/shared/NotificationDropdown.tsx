"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useLanguage } from "@/src/hooks/use-language";
import {
  useMyNotifications,
  useMyNotificationStats,
} from "@/src/features/(web)/notifications/hooks";
import { NotificationList } from "@/src/components/shared/NotificationList";
import { NavIconButton } from "@/src/components/(web)/NavIconButton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Badge } from "@/src/components/ui/badge";
import { Separator } from "@/src/components/ui/separator";

export function NotificationDropdown({
  triggerClassName,
}: {
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const lang = useLanguage();
  const { data: notificationsData, refetch: refetchNotifications } =
    useMyNotifications(1, 3);
  const notifications = notificationsData?.notifications || [];

  const { data: statsData } = useMyNotificationStats();
  const unreadCount = statsData?.unseen || 0;

  const handleNotificationsClick = () => {
    setOpen(false);
    router.push(`/${lang}/notifications`);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      refetchNotifications();
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <NavIconButton
          count={unreadCount}
          aria-label="الإشعارات"
          className={triggerClassName}
        >
          <Bell className="size-5" />
        </NavIconButton>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        dir="rtl"
        className="w-88 max-w-[calc(100vw-2rem)] p-0 border border-c2-neutral-200 shadow-lg rounded-xl bg-white max-h-[85vh] overflow-y-auto custom-scrollbar"
        sideOffset={8}
      >
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <h3 className="text-base font-semibold text-c2-navy-900">الإشعارات</h3>
          {unreadCount > 0 && (
            <Badge
              variant="secondary"
              className="bg-c2-navy-700-a08 text-c2-primary text-xs font-medium"
            >
              {unreadCount} جديد
            </Badge>
          )}
        </div>
        <Separator className="bg-c2-neutral-200" />
        <NotificationList
          notifications={notifications}
          onItemClick={handleNotificationsClick}
          onViewAllClick={handleNotificationsClick}
        />
      </PopoverContent>
    </Popover>
  );
}
