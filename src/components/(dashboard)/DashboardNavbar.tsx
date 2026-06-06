
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  FileText,
  TriangleAlert,
  ChevronLeft,
  Crown,
  Headset,
  Shield,
  ShieldOff,
  Bell,
  Video,
  TicketPercent,
  Trash2,
  Mail,
  Truck,
} from "lucide-react";
import { useAuthStore } from "@/src/stores/auth-store";
import { useLanguage } from "@/src/hooks/use-language";
import { useLogout } from "@/src/features/(web)/auth/hooks";
import { NotificationDropdown } from "@/src/components/shared/NotificationDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Button } from "@/src/components/ui/button";
import { DashboardUserMenu } from "./DashboardUserMenu";
import { cn } from "@/src/lib/utils";
import Cookies from "js-cookie";
import useFCMToken from "@/src/hooks/use-fcm-token";
import { useSettingsStore } from "@/src/stores/settings-store";
import { isSegmentAllowedForRole, isSegmentAllowedForAdmin, MerchantRole } from "@/src/config/role-permissions";
// import { useGetStoreBalance } from "@/src/features/(dashboard)/coins/hooks"; // ⚠️ معطّل مؤقتاً - نظام العملات الذهبية
import { useTotalUnreadCount } from "@/src/features/(dashboard)/chat/hooks";
import { Badge } from "@/src/components/ui/badge";

// ⚠️ مكوّن رصيد العملات الذهبية - معطّل مؤقتاً
// const MerchantNavbarPoints = ({ storeId }: { storeId?: string | number | null }) => {
//   const { data, isLoading } = useGetStoreBalance(undefined, storeId || undefined);
//   const [mounted, setMounted] = React.useState(false);
//   React.useEffect(() => { setMounted(true); }, []);
//   if (!mounted) return <div className="hidden md:block w-24 h-9 animate-pulse bg-gray-100 rounded-full mx-2"></div>;
//   return (
//     <Link href="/admin/coins/buy" className="hidden md:flex items-center gap-1.5 px-2 rounded-full transition-colors min-h-9 cursor-pointer">
//       <img src="/icons/dashboard/coins.svg" alt="coins" className="w-8 h-8 object-contain drop-shadow-sm" />
//       <span className="font-semibold pt-1 text-sm whitespace-nowrap">
//         {isLoading ? "..." : (data?.balance || 0)} نقطة
//       </span>
//     </Link>
//   );
// };
const MerchantNavbarPoints = ({ storeId }: { storeId?: string | number | null }) => null;
interface NavItem {
  label: string;
  icon: LucideIcon | React.ReactNode;
  href: string;
  show: boolean;
  desc?: string;
}

interface IconProps {
  className?: string;
  [key: string]: unknown;
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
  const { mutate: logout } = useLogout();

  useFCMToken();
  const { settings } = useSettingsStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.user_type === "admin";
  const isMerchant = user?.user_type === "merchant";

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isActive = (path: string) => {
    const basePath = path.split("?")[0];
    const fullPath = `${navPrefix}${basePath}`;
    const isStoreShippingPath = /^\/(?:admin|dashboard)\/stores\/[^/]+\/shipping(?:\/|$)/.test(pathname || "");

    if (basePath === "/stores" && isStoreShippingPath) return false;
    
    if (basePath === "/users" && pathname?.startsWith(`${navPrefix}/permissions`)) return true;

    if (fullPath === navPrefix && pathname === fullPath) return true;
    if (fullPath !== navPrefix && pathname?.startsWith(fullPath)) return true;
    return false;
  };

  const [activeStoreId, setActiveStoreId] = useState<string | number | null>(null);
  const [storeType, setStoreType] = useState<string | null>(null);
  const [storeRole, setStoreRole] = useState<MerchantRole | null>(null);
  const [mounted, setMounted] = useState(false);


  React.useEffect(() => {
    // Client-side initialization to avoid hydration mismatch
    setMounted(true);
    setActiveStoreId(Cookies.get("current_store_id") || null);
    setStoreType(Cookies.get("store_type") || null);
    setStoreRole((Cookies.get("store_role") as MerchantRole) || null);

    const handleStoreUpdate = () => {
      const newStoreId = Cookies.get("current_store_id") || null;
      const newStoreType = Cookies.get("store_type") || null;
      const newStoreRole = (Cookies.get("store_role") as MerchantRole) || null;
      setActiveStoreId(newStoreId);
      setStoreType(newStoreType);
      setStoreRole(newStoreRole);
    };


    window.addEventListener("store-info-updated", handleStoreUpdate);
    return () => window.removeEventListener("store-info-updated", handleStoreUpdate);
  }, []);

  const { data: unreadData } = useTotalUnreadCount(
    isMerchant ? (activeStoreId || undefined) : undefined,
    !isMerchant
  );
  const unreadCount = unreadData?.unread_conversations_count || 0;

  const getSegmentFromHref = (href: string): string => {
    const clean = href.split("?")[0].split("/").filter(Boolean);
    return clean[0] || "";
  };

  const isAllowedByRole = (href: string): boolean => {
    if (!isMerchant || !storeRole) return true;
    const segment = getSegmentFromHref(href);
    return isSegmentAllowedForRole(storeRole, segment);
  };

  const adminPermissions = isAdmin ? (user?.permissions || []) : [];

  const hasAdminPerm = (href: string): boolean => {
    if (!isAdmin) return false;
    const segment = getSegmentFromHref(href);
    return isSegmentAllowedForAdmin(adminPermissions, segment);
  };


  const allNavItems: NavItem[] = [

    { label: "الرئيسة", icon: <img src={"/icons/dashboard/nav_home.svg"} alt="" />, href: "/home", show: true },
    { label: "المستخدمين", icon: <img src={"/icons/dashboard/nav_users.svg"} alt="" />, href: "/users", show: hasAdminPerm("/users") },
    { label: "المتاجر", icon: <img src={"/icons/dashboard/nav_stores.svg"} alt="" />, href: "/stores", show: hasAdminPerm("/stores") || isMerchant },
    { label: "المنتجات", icon: <img src={"/icons/dashboard/nav_products.svg"} alt="" />, href: "/products", show: isMerchant && (storeType === "products") && isAllowedByRole("/products") },
    {
      label: "الشحن",
      icon: Truck,
      href: activeStoreId ? `/stores/${activeStoreId}/shipping` : "/stores",
      show: isMerchant && storeType === "products" && !!activeStoreId && isAllowedByRole("/stores"),
      desc: "إعداد طريقة الشحن وشركات التوصيل للمتجر الحالي",
    },
    { label: "مقدمي المنتجات", icon: <img src={"/icons/dashboard/nav_products.svg"} alt="" />, href: "/productProviders", show: hasAdminPerm("/productProviders") },
    { label: "الخدمات", icon: <img src={"/icons/dashboard/nav_services.svg"} alt="" />, href: activeStoreId ? `/serviceProviders/${activeStoreId}` : "/serviceProviders", show: isMerchant && (storeType === "services") && !!activeStoreId && isAllowedByRole("/serviceProviders") },
    { label: "مقدمي الخدمات", icon: <img src={"/icons/dashboard/nav_services.svg"} alt="" />, href: "/serviceProviders", show: hasAdminPerm("/serviceProviders"), desc: "إدارة ومتابعة مقدمي الخدمات" },
    { label: "الاقسام", icon: PanelsRightBottom, href: activeStoreId ? `/sections?storeId=${activeStoreId}` : "/sections", show: hasAdminPerm("/sections") || (isMerchant && isAllowedByRole("/sections")), desc: "إدارة وتصنيف الاقسام" },
    { label: "مدن الشحن", icon: Map, href: "/cities", show: hasAdminPerm("/cities"), desc: "اختر وجهات الشحن المتاحة" },
    { label: "الفئات", icon: Boxes, href: "/categories", show: hasAdminPerm("/categories"), desc: "إدارة وعرض الفئات" },
    { label: "البنرات الإعلانية", icon: GalleryVerticalEnd, href: "/banners", show: hasAdminPerm("/banners"), desc: "ادارة ومتابعة البنرات الإعلانية" },
    { label: "مساعدي", icon: Bot, href: "/mosa3edy", show: hasAdminPerm("/mosa3edy"), desc: "إدارة التشات بوت والإحصائيات" },
    { label: "القصص", icon: ImageIcon, href: "/stories", show: isMerchant && isAllowedByRole("/stories"), desc: "إضافة وإدارة القصص" },
    { label: "طلبات الخدمات", icon: Wand2Icon, href: "/requested-services", show: hasAdminPerm("/requested-services"), desc: "الطلبات الغير موجودة والمخصصة" },
    { label: "المدونات", icon: Newspaper, href: "/blogs", show: hasAdminPerm("/blogs"), desc: "إضافة وإدارة المدونات والمقالات" },
    { label: "المتابعات", icon: Users, href: "/following", show: isMerchant && isAllowedByRole("/following"), desc: "إدارة واحصائيات المتابعات" },
    { label: "المفضله", icon: Heart, href: "/favorites", show: hasAdminPerm("/favorites"), desc: "ادارة ومتابعة المفضلة" },
    { label: "إدارة المحتوى", icon: FileText, href: "/content-management", show: hasAdminPerm("/content-management"), desc: "تحكم بالمحتوى الأساسي للموقع" },
    { label: "الكلمات المسيئة", icon: TriangleAlert, href: "/abusive-words", show: hasAdminPerm("/abusive-words"), desc: "إدارة الكلمات والعبارات المسيئة" },
    { label: "البلاغات", icon: ShieldOff, href: "/all-reports?type=store", show: hasAdminPerm("/all-reports"), desc: "متابعة الشكاوى والبلاغات" },
    { label: "رسائل التواصل", icon: Mail, href: "/contacts", show: isAdmin, desc: "رسائل المستخدمين من صفحة من نحن" },
    { label: "الإشعارات", icon: Bell, href: "/notifications", show: hasAdminPerm("/notifications"), desc: "إدارة ومتابعة سجل الاشعارات" },
    { label: "الكوبونات", icon: TicketPercent, href: "/coupons", show: isMerchant && (storeType === "products") && isAllowedByRole("/coupons"), desc: "إدارة ومتابعة الخصومات" },

    { label: "المحذوفات", icon: Trash2, href: "/trash", show: hasAdminPerm("/trash"), desc: "إدارة ومتابعة المحذوفات" },
    { label: "دليل الاستخدام", icon: Video, href: "/user-guide", show: isAdmin, desc: "إضافة فيديوهات لمساعدة المستخدمين" },
  ];

  const visibleNavItems = allNavItems.filter((item) => item.show);
  const mainNavItems = visibleNavItems.slice(0, 5);
  const moreMenuItems = visibleNavItems.slice(5);

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
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClasses[userType as keyof typeof badgeClasses]}`}>
        {getUserTypeIcon(userType)}
        <span className="pt-0.5">{labels[userType as keyof typeof labels]}</span>
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
              {settings?.logo_url ? (
                <img src={settings.logo_url} className="h-8 lg:h-9 w-auto object-contain" alt={settings?.name || "logo"} />
              ) : (
                <Image src="/black.svg" width={80} height={32} alt="logo" className="h-8 lg:h-9 w-auto" />
              )}
            </Link>

            {/* Desktop Menu Items */}
            <div className="hidden lg:flex items-center gap-1">
              {mounted && mainNavItems
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

              {mounted && moreMenuItems.length > 0 && (
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
                  <DropdownMenuContent align="end" className="w-[280px] p-2 border-none shadow-sm rounded-sm bg-white max-h-[85vh] overflow-y-auto custom-scrollbar">
                    {mounted && moreMenuItems
                      .filter((item) => item.show)
                      .map((item) => {
                        const active = isActive(item.href);
                        return (
                          <DropdownMenuItem key={item.href} asChild className="p-0 outline-none hover:bg-transparent">
                            <Link
                              href={`${navPrefix}${item.href}`}
                              className="flex gap-2 w-full px-1 py-1.5 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer"
                              style={active ? { backgroundColor: '#F9FAFB' } : {}}
                            >
                              <div className="w-10 h-10 rounded-md bg-blue-5 flex items-center justify-center group-hover:bg-[#DBEAFE] transition-colors shrink-0">
                                {renderIcon(item.icon, false, "w-5 h-5 text-blue-4 group-hover:text-blue-600")}
                              </div>
                              <div className="flex flex-col flex-1 justify-center">
                                <span className={cn(
                                  "text-sm font-medium group-hover:text-blue-700",
                                  active ? "text-blue-3" : "text-blue-4"
                                )}>
                                  {item.label}
                                </span>
                                {item.desc && (
                                  <span className="text-[10px] text-gray-2 mt-0.5 whitespace-normal leading-tight">
                                    {item.desc}
                                  </span>
                                )}
                              </div>
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isMerchant && activeStoreId && <MerchantNavbarPoints storeId={activeStoreId} />}

            {/* <Button
              variant="ghost"
              size="icon"
              className="rounded-lg hover:bg-white/20"
              aria-label="بحث"
              onClick={() => router.push(`${navPrefix}/search`)}
            >
              <img src="/icons/search.svg" className="w-5 h-5" alt="search" />
            </Button> */}

            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg hover:bg-white/20 relative cursor-pointer"
              aria-label="الرسائل"
              asChild
            >
              <Link href={`/admin/chat`}>
                <img src="/icons/dashboard/chat3.svg" className="w-5 h-5" alt="chat" />
                {unreadCount > 0 && (
                  <Badge
                    className="absolute bg-red-600 -top-1 text-white -right-1 h-4 w-4 flex items-center justify-center p-0 pt-[3px] text-[10px]"
                    variant="destructive"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Link>
            </Button>

            <NotificationDropdown variant="dashboard" />

            <div className="">
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
                                    React.cloneElement(item.icon as React.ReactElement<IconProps>, {
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
                        <div className="flex gap-4 mb-4">
                          <Link href={`/${lang}/profile/${user?.slug}`} onClick={() => setMobileMenuOpen(false)}>
                            {user?.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.fullname}
                                className="w-15 h-15 rounded-full object-cover border border-gray-300 shadow-lg"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/80 to-primary text-white flex items-center justify-center font-bold text-lg shadow-lg">
                                {user?.fullname?.[0]?.toUpperCase()}
                              </div>
                            )}
                          </Link>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg truncate">{user?.fullname}</h3>
                            <p className="text-gray-2 mt-0.5 text-sm truncate">{user?.email}</p>
                            <div className="mt-2">
                              {getUserTypeBadge(user?.user_type || "client")}
                            </div>
                          </div>
                        </div>

                        {/* User Details */}
                        <div className="space-y-2">
                          {!isAdmin && (
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
                          )}

                          {
                            isAdmin && (
                              <Link
                                href={`/${lang}/settings`}
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

                        <Link
                          href={`/`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 group border border-gray-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-5 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                              <Store size={16} className="text-blue-4" />
                            </div>
                            <span className="font-medium">المنصه</span>
                          </div>
                          <ChevronLeft size={16} className="text-gray-400 " />
                        </Link>


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
