"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image"; // ⭐️ (1)
import {
  Home,
  Users,
  Store,
  Shirt,
  MoreHorizontal,
  Search,
  MessageSquare,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  Package,
  ShoppingCart,
  LayoutDashboard,
  Menu,
  LucideIcon,
  X,
  Map, // ⭐️ (2)
} from "lucide-react";
import { useAuthStore } from "@/src/stores/auth-store";
import { useLanguage } from "@/src/hooks/use-language";
import { useLogout } from "@/src/features/(web)/auth/hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel, // ⭐️ (3)
} from "@/src/components/ui/dropdown-menu";
import { Badge } from "@/src/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/src/components/ui/sheet"; // ⭐️ (4)
import { Button } from "@/src/components/ui/button"; // ⭐️ (5)
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"; // ⭐️ (6)
import { Separator } from "@/src/components/ui/separator"; // ⭐️ (7)

interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
  show: boolean;
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
    // الصفحة الرئيسية لازم تطابق بالضبط
    if (fullPath === navPrefix && pathname === fullPath) return true;
    // الصفحات التانية تطابق البداية
    if (fullPath !== navPrefix && pathname?.startsWith(fullPath)) return true;
    return false;
  };

  const allNavItems: NavItem[] = [
    { label: "الرئيسية", icon: Home, href: "", show: true },
    { label: "المستخدمين", icon: Users, href: "/users", show: isAdmin },
    { label: "المتاجر", icon: Store, href: "/stores", show: true },
    { label: "المنتجات", icon: Shirt, href: "/products", show: true },
    { label: "مقدمي الخدمات", icon: LayoutDashboard, href: "/service-providers", show: isAdmin },
    { label: "الطلبات", icon: ShoppingCart, href: "/orders", show: isMerchant },
    { label: "الفئات", icon: Package, href: "/categories", show: isAdmin },
    { label: "الإعدادات", icon: Settings, href: "/settings", show: true },
    { label: "مدن الشحن", icon: Map, href: "/cities", show: true },
  ];

  const mainNavItems = allNavItems.slice(0, 5);
  const moreMenuItems = allNavItems.slice(5);

  const notifications: Notification[] = [];
  const unreadCount = 0; // بيانات وهمية

  return (
    <nav 
      dir="rtl" 
      className="w-full p-2 shadow-sm"
      style={{ backgroundColor: "var(--blue-1)" }}
    >
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden p-2 hover:bg-white/20">
                  <Menu className="w-6 h-6" style={{ color: "var(--blue-3)" }} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0 flex flex-col border-none" style={{ backgroundColor: "var(--blue-1)" }}>
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
                            variant={active ? "default" : "ghost"}
                            className="w-full justify-start gap-3 text-base"
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
                              <item.icon className="w-5 h-5" />
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

            <Link href={`/${lang}`} className="flex items-center gap-2">
              <Image src="/black.svg" width={80} height={32} alt="logo" className="h-8 lg:h-8 w-auto" />
            </Link>

            <div className="hidden lg:flex items-center gap-2">
              {mainNavItems
                .filter((item) => item.show)
                .map((item) => {
                  const href = `${navPrefix}${item.href}`;
                  const active = isActive(item.href);
                  
                  return (
                    <Button
                      key={item.href}
                      variant={active ? "default" : "ghost"}
                      className="gap-2"
                      style={active ? { 
                        backgroundColor: 'var(--blue-3)', 
                        color: 'white' 
                      } : {
                        color: 'var(--blue-3)'
                      }}
                      asChild
                    >
                      <Link href={href}>
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    </Button>
                  );
                })}

              <DropdownMenu>
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
                <DropdownMenuContent align="end" className="w-48">
                  {moreMenuItems
                    .filter((item) => item.show)
                    .map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link
                          href={`${navPrefix}${item.href}`}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
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
              <Search className="w-5 h-5" style={{ color: "var(--blue-3)" }} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg hover:bg-white/20 relative"
              aria-label="الرسائل"
              asChild
            >
              <Link href={`${navPrefix}/chat`}>
                <MessageSquare className="w-5 h-5" style={{ color: "var(--blue-3)" }} />
                {/* <Badge 
                  className="absolute text-white -top-1 -right-1 h-4 w-4 justify-center p-0 text-[10px]"
                  variant="destructive"
                >
                  1
                </Badge> */}
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
                  <Bell className="w-5 h-5" style={{ color: "var(--blue-3)" }} />
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
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                            notification.unread ? "bg-blue-500" : "bg-gray-300"
                          }`} />
                          <div className="flex-1">
                            <p className="font-medium text-sm" style={{ color: "var(--blue-3)" }}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs mt-1" style={{ color: "var(--gray-1)" }}>
                              {notification.time}
                            </p>
                          </div>
                        </div>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/20 h-auto"
                    style={{ backgroundColor: "rgba(221, 228, 237, 0.5)" }}
                  >
                    <Avatar className="w-10 h-10 border-2 border-white">
                      <AvatarImage src={user?.avatar} alt={user?.fullname} />
                      <AvatarFallback style={{ backgroundColor: "var(--blue-3)", color: "white" }}>
                        {user?.fullname?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold" style={{ color: "var(--blue-3)" }}>
                        {user?.fullname}
                      </span>
                      <span 
                        className="text-xs px-2 py-0.5 rounded-full mt-0.5"
                        style={{ 
                          color: "var(--blue-3)",
                          border: "1px solid var(--blue-3)"
                        }}
                      >
                        {isAdmin ? "مدير" : "تاجر"}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4" style={{ color: "var(--blue-3)" }} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium" style={{ color: "var(--blue-3)" }}>
                        {user?.fullname}
                      </p>
                      <p className="text-xs" style={{ color: "var(--gray-1)" }}>
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <Separator />
                  <DropdownMenuItem asChild>
                    <Link href={`${navPrefix}/profile`} className="cursor-pointer">
                      <Settings className="w-4 h-4 ml-2" />
                      الملف الشخصي
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`${navPrefix}/settings`} className="cursor-pointer">
                      <Settings className="w-4 h-4 ml-2" />
                      الإعدادات
                    </Link>
                  </DropdownMenuItem>
                  <Separator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                    onClick={() => logout()}
                  >
                    <LogOut className="w-4 h-4 ml-2" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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