// src/features/(dashboard)/home/components/DashboardNavbar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Users,
  Store,
  MoreHorizontal,
  Settings,
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
  Newspaper,
  Heart,
  Coins,
  FileText,
  TriangleAlert,
  ChevronLeft,
  Crown,
  Headset,
  Shield,
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
import { Button } from "@/src/components/ui/button";
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

const menuVariants: Variants = {
  closed: {
    x: "100%",
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  open: {
    x: "0%",
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

const overlayVariants: Variants = {
  closed: { opacity: 0 },
  open: { opacity: 1 },
};

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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

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

  const [storeType, setStoreType] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return Cookies.get("store_type") || null;
    }
    return null;
  });

  React.useEffect(() => {
    const handleStoreUpdate = () => {
      const newStoreId = Cookies.get("current_store_id") || null;
      const newStoreType = Cookies.get("store_type") || null;
      setActiveStoreId(newStoreId);
      setStoreType(newStoreType);
    };

    window.addEventListener("store-info-updated", handleStoreUpdate);
    return () => window.removeEventListener("store-info-updated", handleStoreUpdate);
  }, []);

  const allNavItems: NavItem[] = [
    { label: "الرئيسة", icon: <img src={"/icons/dashboard/nav_home.svg"} alt="" />, href: "/home", show: true },
    { label: "المستخدمين", icon: <img src={"/icons/dashboard/nav_users.svg"} alt="" />, href: "/users", show: isAdmin },
    { label: "المتاجر", icon: <img src={"/icons/dashboard/nav_stores.svg"} alt="" />, href: "/stores", show: true },
    { label: "المنتجات", icon: <img src={"/icons/dashboard/nav_products.svg"} alt="" />, href: "/products", show: !isMerchant || (isMerchant && storeType === "products") },
    { label: "الخدمات", icon: <img src={"/icons/dashboard/nav_services.svg"} alt="" />, href: `/serviceProviders/${activeStoreId}`, show: isMerchant && storeType === "services" },
    { label: "مقدمي الخدمات", icon: <img src={"/icons/dashboard/nav_services.svg"} alt="" />, href: "/serviceProviders", show: isAdmin },
    { label: "الفئات", icon: Boxes, href: "/categories", show: true },
    { label: "الإعدادات", icon: Settings, href: "/settings", show: isAdmin },
    { label: "مدن الشحن", icon: Map, href: "/cities", show: true },
    { label: "الاقسام", icon: PanelsRightBottom, href: `/sections?storeId=${activeStoreId}`, show: true },
    { label: "البنرات الإعلانية", icon: GalleryVerticalEnd, href: "/banners", show: isAdmin },
    { label: "مساعدي", icon: Bot, href: "/mosa3edy", show: isAdmin },
    { label: "القصص", icon: ImageIcon, href: "/stories ", show: isMerchant },
    { label: "طلبات الخدمات", icon: Wand2Icon, href: "/requested-services ", show: isAdmin },
    { label: "المدونات", icon: Newspaper, href: "/blogs", show: true },
    { label: "المتابعات", icon: Users, href: "/following", show: isMerchant },
    { label: "المفضله", icon: Heart, href: "/favorites", show: isAdmin },
    { label: "السجل المالى", icon: Coins, href: "/financial-record", show: isMerchant },
    { label: "إدارة المحتوى", icon: FileText, href: "/content-management", show: isAdmin },
    { label: "الكلمات المسيئة", icon: TriangleAlert, href: "/abusive-words", show: isAdmin },
  ];

  const mainNavItems = allNavItems.slice(0, 6);
  const moreMenuItems = allNavItems.slice(6);

  const notifications: Notification[] = [];
  const unreadCount = 0;

  const renderIcon = (
    icon: LucideIcon | React.ReactNode,
    isActiveItem: boolean,
    className: string = "w-6 h-6"
  ) => {
    if (React.isValidElement(icon)) {
      const iconProps = icon.props as IconProps;

      return React.cloneElement(icon as React.ReactElement<IconProps>, {
        className: cn(
          className,
          iconProps.className,
          isActiveItem ? "brightness-0 invert" : ""
        ),
      });
    }

    const Icon = icon as LucideIcon;
    return <Icon className={className} />;
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case "admin":
        return <Crown size={14} className="text-yellow-600" />;
      case "merchant":
        return <Store size={14} className="text-blue-600" />;
      default:
        return <Shield size={14} className="text-green-600" />;
    }
  };

  const getUserTypeBadge = (userType: string) => {
    const badgeClasses = {
      admin: "bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border border-yellow-200",
      merchant: "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200",
      client: "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200"
    };

    const labels = {
      admin: "مدير",
      merchant: "تاجر",
      client: "عميل"
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badgeClasses[userType as keyof typeof badgeClasses]}`}>
        {getUserTypeIcon(userType)}
        {labels[userType as keyof typeof labels]}
      </span>
    );
  };

  return (
    <nav
      className="w-full p-2 shadow-sm sticky top-0 z-50"
      style={{ backgroundColor: "var(--blue-1)" }}
    >
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 hover:bg-white/20 rounded-md cursor-pointer transition-colors duration-200"
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" style={{ color: "var(--blue-3)" }} />
              ) : (
                <Menu className="w-6 h-6" style={{ color: "var(--blue-3)" }} />
              )}
            </button>

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
          </div>
        </div>
      </div>

      {/* Mobile Menu - Same as MobileNav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm z-40"
              variants={overlayVariants}
              initial="closed"
              animate="open"
              exit="closed"
              onClick={toggleMobileMenu}
            />
            <motion.div
              className="fixed inset-y-0 right-0 w-4/5 max-w-sm bg-white z-50 shadow-2xl"
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-gray-100">
                  <Link
                    href={`/${lang}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:scale-105 transition-transform duration-200"
                  >
                    <img src="/black.svg" className="h-8" alt="logo" />
                  </Link>
                  <button
                    onClick={toggleMobileMenu}
                    aria-label="إغلاق القائمة"
                    className="p-2 hover:bg-white/50 rounded-full transition-all duration-200 hover:rotate-90 cursor-pointer"
                  >
                    <X size={24} className="text-gray-600" />
                  </button>
                </div>

                {/* Content Section */}
                <div className="flex-1 overflow-y-auto">
                  <div className="flex flex-col justify-between h-full">
                    {/* Navigation Links */}
                    <motion.div
                      className="px-4 py-4 space-y-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="mb-4">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">التصفح</h3>
                      </div>

                      {allNavItems
                        .filter((item) => item.show)
                        .map((item) => {
                          const href = `${navPrefix}${item.href}`;
                          const active = isActive(item.href);

                          return (
                            <Link
                              key={item.href}
                              href={href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={cn(
                                "group flex items-center justify-between gap-4 p-3 rounded-xl transition-all duration-200",
                                active
                                  ? "text-primary bg-primary/5"
                                  : "text-gray-700 hover:text-primary hover:bg-primary/5"
                              )}
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200",
                                    active
                                      ? "bg-blue-100"
                                      : "bg-blue-50 group-hover:bg-blue-100"
                                  )}
                                >
                                  {React.isValidElement(item.icon) ? (
                                    React.cloneElement(item.icon as React.ReactElement<any>, {
                                      className: "w-5 h-5"
                                    })
                                  ) : (
                                    (() => {
                                      const Icon = item.icon as LucideIcon;
                                      return <Icon className="w-5 h-5 text-gray-500" />;
                                    })()
                                  )}
                                </div>
                                <span className="font-medium">{item.label}</span>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <ChevronLeft size={16} className="text-gray-400" />
                              </div>
                            </Link>
                          );
                        })}
                    </motion.div>

                    {/* User Menu Section */}
                    <div className="px-4 pb-4">
                      {/* User Profile Card */}
                      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-4 mb-4">
                        <div className="flex items-center gap-4 mb-4">
                          {user?.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.fullname}
                              className="w-14 h-14 rounded-full object-cover ring-3 ring-white shadow-lg"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/80 to-primary text-white flex items-center justify-center font-bold text-lg shadow-lg">
                              {user?.fullname?.[0]?.toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-lg truncate">{user?.fullname}</h3>
                            <p className="text-gray-600 text-sm truncate">{user?.email}</p>
                            <div className="mt-2">
                              {getUserTypeBadge(user?.user_type || "client")}
                            </div>
                          </div>
                        </div>

                        {/* User Details */}
                        <div className="space-y-2">
                          <Link
                            href={`/${lang}/report/inquiry`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 text-sm text-gray-600"
                          >
                            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Headset size={12} />
                            </div>
                            <span className="font-medium">استعلام عن شكوى</span>
                          </Link>

                          {
                            isAdmin && (
                              <Link
                                href={`/${lang}/admin/settings`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 text-sm text-gray-600"
                              >
                                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <Settings size={12} />
                                </div>
                                <span className="font-medium">الاعدادات</span>
                              </Link>
                            )
                          }
                        </div>
                      </div>

                      {/* Action Links */}
                      <div className="space-y-2">
                        {isAdmin && (
                          <Link
                            href={`/${lang}/admin`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-between w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 group border border-gray-200"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                                <Crown size={16} className="text-yellow-600" />
                              </div>
                              <span className="font-medium">لوحة التحكم</span>
                            </div>
                            <ChevronLeft size={16} className="text-gray-400 group-hover:text-yellow-600" />
                          </Link>
                        )}

                        {isMerchant && (
                          <Link
                            href={`/${lang}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-between w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 group border border-gray-200"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                <Store size={16} className="text-blue-600" />
                              </div>
                              <span className="font-medium">المنصه</span>
                            </div>
                            <ChevronLeft size={16} className="text-gray-400 group-hover:text-blue-600" />
                          </Link>
                        )}

                        {/* Logout Button */}
                        <button
                          onClick={() => {
                            logout();
                            setMobileMenuOpen(false);
                          }}
                          className="flex cursor-pointer items-center justify-between w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group border border-red-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                              <LogOut size={16} />
                            </div>
                            <span className="font-medium">تسجيل الخروج</span>
                          </div>
                          <ChevronLeft size={16} className="text-gray-400 group-hover:text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default DashboardNavbar;