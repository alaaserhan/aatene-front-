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
  const { data: notificationsData } = useMyNotifications(1, 3);
  const notifications = notificationsData?.notifications || [];

  const { data: statsData } = useMyNotificationStats();
  const unreadCount = statsData?.unseen || 0;

  const handleNotificationsClick = () => {
    setOpen(false);
    router.push(`/${lang}/notifications`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
        className="w-70 p-2 border-none shadow-sm rounded-sm bg-white max-h-[85vh] overflow-y-auto custom-scrollbar"
        sideOffset={8}
      >
        <div className="p-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-c2-primary">الإشعارات</h3>
            {unreadCount > 0 && (
              <Badge
                variant="secondary"
                className="bg-c2-neutral-300-a10 text-c2-primary"
              >
                {unreadCount} جديد
              </Badge>
            )}
          </div>
        </div>
        <Separator className="bg-gray-50" />
        <NotificationList
          notifications={notifications}
          onItemClick={handleNotificationsClick}
          onViewAllClick={handleNotificationsClick}
        />
      </PopoverContent>
    </Popover>
  );
}
