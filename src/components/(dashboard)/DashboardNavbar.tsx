// src/features/(dashboard)/home/components/DashboardNavbar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import {
  Users,
  Store,
  MoreHorizontal,
  Settings,
  Package,
  Menu,
  LucideIcon,
  X,
  Map,
  GalleryVerticalEnd,
  LogOut,
  Bot,
  ImageIcon,
  Wand2Icon,
  PanelsRightBottom,
  Boxes,
} from "lucide-react";
import { useAuthStore } from "@/src/stores/auth-store";
import { useLanguage } from "@/src/hooks/use-language";
import { useLogout } from "@/src/features/(web)/auth/hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/src/components/ui/dropdown-menu";
import { Badge } from "@/src/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/src/components/ui/sheet";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Separator } from "@/src/components/ui/separator";
import { DashboardUserMenu } from "./DashboardUserMenu";
import { cn } from "@/src/lib/utils";
import Cookies from "js-cookie";

interface NavItem {
  label: string;
  icon: LucideIcon | React.ReactNode;
  href: string;
  show: boolean;
}

// تعريف واجهة لخصائص الأيقونة لتجنب استخدام any
interface IconProps {
  className?: string;
  [key: string]: unknown;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

interface DashboardNavbarProps {
  navPrefix: "/admin" | "/dashboard";
}

export function DashboardNavbar({ navPrefix }: DashboardNavbarProps) {
  const user = useAuthStore((state) => state.user);
  const lang = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const { mutate: logout } = useLogout();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.user_type === "admin";
  const isMerchant = user?.user_type === "merchant";

  const isActive = (path: string) => {
    const fullPath = `${navPrefix}${path}`;
    if (fullPath === navPrefix && pathname === fullPath) return true;
    if (fullPath !== navPrefix && pathname?.startsWith(fullPath)) return true;
    return false;
  };

      const [activeStoreId, setActiveStoreId] = useState<string | number | null>(() => {
        if (typeof window !== "undefined") {
            return Cookies.get("current_store_id") || null;
        }
        return null;
    });

  const allNavItems: NavItem[] = [
    { label: "الرئيسة", icon: <img src={"/icons/dashboard/nav_home.svg"} alt="" />, href: "/home", show: true },
    { label: "المستخدمين", icon: <img src={"/icons/dashboard/nav_users.svg"} alt="" />, href: "/users", show: isAdmin },
    { label: "المتاجر", icon: <img src={"/icons/dashboard/nav_stores.svg"} alt="" />, href: "/stores", show: true },
    { label: "المنتجات", icon: <img src={"/icons/dashboard/nav_products.svg"} alt="" />, href: "/products", show: true },
    { label: "مقدمي الخدمات", icon: <img src={"/icons/dashboard/nav_services.svg"} alt="" />, href: "/serviceProviders", show: isAdmin },
    { label: "الفئات", icon: Boxes, href: "/categories", show: true },
    { label: "الإعدادات", icon: Settings, href: "/settings", show: isAdmin },
    { label: "مدن الشحن", icon: Map, href: "/cities", show: true },
    { label: "الاقسام", icon: PanelsRightBottom, href: `/sections?storeId=${activeStoreId}`, show: true },
    { label: "البنرات الإعلانية", icon: GalleryVerticalEnd, href: "/banners", show: isAdmin },
    { label: "مساعدي", icon: Bot, href: "/mosa3edy", show: true },
    { label: "القصص", icon: ImageIcon, href: "/stories ", show: true },
    { label: "طلبات الخدمات", icon: Wand2Icon, href: "/requested-services ", show: isAdmin },

  ];

  const mainNavItems = allNavItems.slice(0, 5);
  const moreMenuItems = allNavItems.slice(5);

  const notifications: Notification[] = [];
  const unreadCount = 0;

  // دالة مساعدة لرسم الأيقونة
  const renderIcon = (
    icon: LucideIcon | React.ReactNode,
    isActiveItem: boolean, // معامل جديد لتحديد حالة النشاط
    className: string = "w-6 h-6"
  ) => {
    if (React.isValidElement(icon)) {
      // استخراج الخصائص مع تحديد النوع بدلاً من any
      const iconProps = icon.props as IconProps;

      return React.cloneElement(icon as React.ReactElement<IconProps>, {
        className: cn(
          className,
          iconProps.className,
          // تطبيق فلتر يقلب الألوان ويجعلها بيضاء عند النشاط
          isActiveItem ? "brightness-0 invert" : ""
        ),
      });
    }

    const Icon = icon as LucideIcon;
    // للأيقونات من نوع Lucide، اللون يتم التحكم به عبر CSS color للأب، فلا نحتاج لفلتر هنا
    return <Icon className={className} />;
  };

  return (
    <nav
      className="w-full p-2 shadow-sm sticky top-0 z-50"
      style={{ backgroundColor: "var(--blue-1)" }}
    >
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden p-2 hover:bg-white/20">
                  <Menu className="w-6 h-6" style={{ color: "var(--blue-3)" }} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0 flex flex-col border-none">
                <SheetHeader className="p-4 border-b" style={{ borderColor: "var(--blue-2)" }}>
                  <SheetTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 border-2 border-white">
                        <AvatarImage src={user?.avatar} alt={user?.fullname} />
                        <AvatarFallback style={{ backgroundColor: "var(--blue-3)", color: "white" }}>
                          {user?.fullname?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold" style={{ color: "var(--blue-3)" }}>
                          {user?.fullname}
                        </p>
                        <p className="text-xs" style={{ color: "var(--gray-1)" }}>
                          {isAdmin ? "مدير" : "تاجر"}
                        </p>
                      </div>
                    </div>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/20">
                        <X className="w-5 h-5" style={{ color: "var(--blue-3)" }} />
                      </Button>
                    </SheetClose>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-4">
                  <nav className="space-y-2">
                    {allNavItems
                      .filter((item) => item.show)
                      .map((item) => {
                        const href = `${navPrefix}${item.href}`;
                        const active = isActive(item.href);

                        return (
                          <Button
                            key={item.href}
                            variant={active ? "default" : "default"}
                            className="w-full justify-start gap-3 text-base hover:bg-blue-3"
                            style={active ? {
                              backgroundColor: 'var(--blue-3)',
                              color: 'white'
                            } : {
                              color: 'var(--blue-3)'
                            }}
                            asChild
                          >
                            <Link
                              href={href}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {renderIcon(item.icon, active, "w-6 h-6")}
                              {item.label}
                            </Link>
                          </Button>
                        );
                      })}
                  </nav>
                </div>

                <div className="p-4 border-t" style={{ borderColor: "var(--blue-2)" }}>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-start gap-3 text-base text-red-600 hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5" />
                    تسجيل الخروج
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href={`/${lang}`} className="flex items-center gap-2">
              <Image src="/black.svg" width={80} height={32} alt="logo" className="h-8 lg:h-8 w-auto" />
            </Link>

            {/* Desktop Menu Items */}
            <div className="hidden lg:flex items-center gap-1">
              {mainNavItems
                .filter((item) => item.show)
                .map((item) => {
                  const href = `${navPrefix}${item.href}`;
                  const active = isActive(item.href);

                  return (
                    <Button
                      key={item.href}
                      variant={active ? "default" : "ghost"}
                      className="gap-2 hover:bg-transparent"
                      style={active ? {
                        backgroundColor: 'var(--blue-3)',
                        color: 'white'
                      } : {
                        color: 'var(--blue-3)'
                      }}
                      asChild
                    >
                      <Link href={href}>
                        {renderIcon(item.icon, active, "w-5 h-5")}
                        {item.label}
                      </Link>
                    </Button>
                  );
                })}

              <DropdownMenu dir="rtl">
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="gap-2"
                    style={{ color: "var(--blue-3)" }}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                    المزيد
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 border-gray-200">
                  {moreMenuItems
                    .filter((item) => item.show)
                    .map((item) => {
                      const active = isActive(item.href);
                      return (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link
                            href={`${navPrefix}${item.href}`}
                            className="flex items-center gap-2 cursor-pointer"
                            style={active ? { color: 'var(--blue-3)', fontWeight: 'bold' } : {}}
                          >
                            {renderIcon(item.icon, active, "w-4 h-4")}
                            {item.label}
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg hover:bg-white/20"
              aria-label="بحث"
              onClick={() => router.push(`${navPrefix}/search`)}
            >
              <img src="/icons/search.svg" className="w-5 h-5" alt="search" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg hover:bg-white/20 relative"
              aria-label="الرسائل"
              asChild
            >
              <Link href={`${navPrefix}/chat`}>
                <img src="/icons/chat.svg" className="w-5 h-5" alt="chat" />
              </Link>
            </Button>

            <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg hover:bg-white/20 relative"
                  aria-label="الإشعارات"
                >
                  <img src="/icons/ring.svg" className="w-5 h-5" alt="notifications" />
                  {unreadCount > 0 && (
                    <Badge
                      className="absolute -top-1 -right-1 h-4 w-4 justify-center p-0 text-[10px]"
                      variant="destructive"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg" style={{ color: "var(--blue-3)" }}>
                      الإشعارات
                    </h3>
                    {unreadCount > 0 && (
                      <Badge variant="secondary">{unreadCount} جديد</Badge>
                    )}
                  </div>
                </DropdownMenuLabel>
                <Separator />
                <div className="p-2 max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-center text-sm text-brand-gray-1">
                      لا توجد إشعارات جديدة
                    </p>
                  ) : (
                    notifications.map((notification) => (
                      <DropdownMenuItem key={notification.id} className="p-3 rounded-lg data-[highlighted]:bg-brand-blue-1">
                        {/* Notification content */}
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
                <Separator />
                <DropdownMenuItem asChild>
                  <Link
                    href={`${navPrefix}/notifications`}
                    className="w-full text-center justify-center text-sm py-2 cursor-pointer"
                    style={{ color: "var(--blue-3)" }}
                  >
                    عرض جميع الإشعارات
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden lg:block">
              <DashboardUserMenu />
            </div>

            <Button
              className="lg:hidden px-3 py-2 text-xs h-auto"
              style={{
                backgroundColor: "var(--blue-3)",
                color: "white",
              }}
              onClick={() => logout()}
            >
              خروج
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;