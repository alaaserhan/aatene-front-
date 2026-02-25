// src/features/(dashboard)/components/DashboardUserMenu.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { useAuthStore } from "@/src/stores/auth-store";
import { useLogout } from "@/src/features/(web)/auth/hooks";
import { useGetStores } from "@/src/features/(dashboard)/stores/hooks";
import { useLanguage } from "@/src/hooks/use-language";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
    ChevronDown,
    LogOut,
    Settings,
    FileText,
    Compass,
    Search,
    Bell,
    Star,
    FileQuestion,
    TicketPercent,
    Truck,
    LayoutTemplate,
    FileEdit,
    MessageSquareOff,
    Bot,
    Frown,
    Home,
    Store,
    ArrowRight,
    ChevronLeft,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

export function DashboardUserMenu() {
    const user = useAuthStore((state) => state.user);
    const { mutate: logout } = useLogout();
    const pathname = usePathname();
    const lang = useLanguage();


    const [storeSearch, setStoreSearch] = useState("");
    const [currentStoreId, setCurrentStoreId] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            return Cookies.get("current_store_id") || null;
        }
        return null;
    });

    const isAdmin = user?.user_type === "admin";
    const isMerchant = user?.user_type === "merchant";

    // --- Fetch Stores (Only if Merchant) ---
    const { data: storesData, isLoading: isLoadingStores } = useGetStores(
        new URLSearchParams("per_page=100"),
        { enabled: isMerchant }
    );

    const storesRaw = storesData?.data;
    const stores = useMemo(() => storesRaw || [], [storesRaw]);

    // قراءة المتجر الحالي من الكوكيز عند التحميل
    useEffect(() => {
        if (!currentStoreId && stores.length > 0) {
            const timer = setTimeout(() => {
                const firstStoreId = String(stores[0].id);
                setCurrentStoreId(firstStoreId);
                Cookies.set("current_store_id", firstStoreId, { expires: 365 });
                Cookies.set("store_type", stores[0].type, { expires: 365 });
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [stores, currentStoreId]);

    // تحديد المتجر النشط حالياً لعرض بياناته في الهيدر
    const activeStore = stores.find((s) => String(s.id) === currentStoreId);

    // تصفية المتاجر بناءً على البحث
    const filteredStores = stores.filter((store) =>
        store.name.toLowerCase().includes(storeSearch.toLowerCase())
    );

    // دالة اختيار المتجر
    const handleStoreSelect = (storeId: number) => {
        const selectedStore = stores.find((s) => s.id === storeId);
        Cookies.set("current_store_id", String(storeId), { expires: 365 });
        if (selectedStore) {
            Cookies.set("store_type", selectedStore.type, { expires: 365 });
        }
        setCurrentStoreId(String(storeId));

        if (pathname?.includes("/admin/products/") && pathname?.endsWith("/edit")) {
            const baseUrl = pathname.split("/admin/products/")[0];
            window.location.assign(`${baseUrl}/admin/products`);
        } else {
            window.location.reload();
        }
    };

    // --- Admin Menu Items ---
    const adminMenuItems = [
        { label: "الشكاوى", desc: "متابعة الشكاوى", icon: Frown, href: "/admin/all-reports" },
        { label: "الإشعارات", desc: "ادارة و متابعة الاشعارات", icon: Bell, href: "/admin/settings" },
        { label: "المفضلة", desc: "ادارة و متابعة المفضلة", icon: Star, href: "/admin/favorites" },
        { label: "الطلبات الغير موجودة", desc: "ادارة و متابعة الطلبات الغير موجودة", icon: FileQuestion, href: "/admin/requested-services" },
        { label: "البنرات الإعلانية", desc: "ادارة و متابعة البنرات الإعلانية", icon: TicketPercent, href: "/admin/banners" },
        { label: "الشحن", desc: "اختر وجهات الشحن", icon: Truck, href: "/admin/cities" },
        { label: "إدارة المحتوى", desc: "تحكم بالمحتوى الأساسي", icon: LayoutTemplate, href: "/admin/content-management" },
        { label: "الإعدادات", desc: "تخصيص الاشعارات و التنبيهات لعملائك", icon: Settings, href: "/admin/settings" },
        { label: "المدونات", desc: "إضافة وإدارة المدونات", icon: FileEdit, href: "/admin/blogs" },
        { label: "الكلمات المسيئة", desc: "إدارة الكلمات المسيئة", icon: MessageSquareOff, href: "/admin/abusive-words" },
        { label: "الذكاء الإصطناعي", desc: "إدارة التشات بوت ومعرفة الإحصائيات", icon: Bot, href: "/admin/mosa3edy" },
    ];

    return (
        <DropdownMenu
            dir="rtl"
        >
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex items-center gap-3 px-2 py-1 rounded-lg hover:bg-transparent h-auto outline-none ring-0 focus-visible:ring-0 group"
                >
                    <Avatar className="w-10 h-10 border border-white group-hover:border-blue-100 transition-colors">
                        {/* هنا في الزر الخارجي، نعرض صورة المستخدم كما هي */}
                        <AvatarImage src={user?.avatar_url || undefined} alt={user?.fullname} />
                        <AvatarFallback className="bg-blue-4 text-white">
                            {user?.fullname?.[0]?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:flex flex-col items-start">
                        <span className="text-sm font-semibold text-blue-3 truncate block max-w-[140px]">
                            {user?.fullname || "المستخدم"}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full mt-0.5 border border-blue-3 text-blue-3">
                            {isAdmin ? "ادمن" : "تاجر"}
                        </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-blue-3 hidden lg:block" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className={cn(
                    "max-h-[85vh] overflow-y-auto p-0 rounded-sm shadow-sm border-none bg-white",
                    isAdmin ? "w-[300px]" : "w-[280px]"
                )}
                sideOffset={8}
            >
                {/* --- Header Section (MERCHANT: Show Active Store Data) --- */}
                {isMerchant && (
                    <div className="bg-white p-4 flex flex-row gap-3">
                        <Avatar className="w-12 h-12">
                            {/* عرض صورة المتجر المختار */}
                            <AvatarImage src={activeStore?.logo_url || ""} />
                            <AvatarFallback className="bg-blue-4 text-white text-xl">
                                {activeStore?.name?.[0] || user?.fullname?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            {/* عرض اسم المتجر المختار */}
                            <h3 className="font-medium text-blue-4 mb-1">
                                {activeStore ? activeStore.name : "اختر متجر"}
                            </h3>
                            <span className="text-xs font-medium text-blue-4 bg-blue-5 border border-blue-4 px-4 py-1 pt-0.5 w-fit rounded-full">
                                {
                                    activeStore?.type === "services" ? "متجر خدمات" : "متجر منتجات"
                                }
                            </span>
                        </div>
                    </div>
                )}



                {/* ================= MERCHANT MENU ================= */}
                {isMerchant && (
                    <div className="bg-white">
                        <div className=" space-y-1 p-2">
                            {/* <MenuItem href={`/${lang}/admin/points`} icon={Coins} label="النقاط" /> */}
                            <MenuItem href={`/${lang}/admin/financial-record`} icon={FileText} label=" السجل المالي" />
                            {/* <MenuItem href={`/${lang}/admin/stores`} icon={Settings} label="ادارة المتاجر" /> */}
                            {/* <MenuItem href={`/${lang}/admin/roles`} icon={Users} label="الادوار الوظيفية" /> */}
                            <MenuItem href={`/${lang}`} icon={Store} label="العودة للمنصة" />

                            <button
                                onClick={() => logout()}
                                className="flex items-center gap-2 w-full px-4 py-3 rounded-lg hover:bg-red-50 transition-colors group cursor-pointer mt-1"
                            >
                                <LogOut className="w-5 h-5 text-red-600" strokeWidth={1.5} />
                                <span className="text-sm font-medium text-red-600 ">تسجيل خروج</span>
                            </button>
                        </div>

                        <div className="h-px bg-gray-100 mx-4 mb-3" />

                        {/* --- Store Switcher Section --- */}
                        <div className="px-4 pb-4">
                            <div className="relative mb-3">
                                <Input
                                    placeholder="تغير المتجر"
                                    className="h-10 text-right pr-4 pl-9 text-xs bg-white border-gray-200 focus-visible:ring-blue-4 rounded-lg"
                                    value={storeSearch}
                                    onChange={(e) => setStoreSearch(e.target.value)}
                                />
                                <Search className="w-4 h-4 text-gray-2 absolute left-3 top-3" />
                            </div>

                            <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar">
                                {isLoadingStores ? (
                                    <p className="text-xs text-center text-gray-2 py-2">جاري التحميل...</p>
                                ) : filteredStores.length === 0 ? (
                                    <p className="text-xs text-center text-gray-2 py-2">لا يوجد متاجر</p>
                                ) : (
                                    filteredStores.map((store) => {
                                        const isActive = String(store.id) === currentStoreId;
                                        return (
                                            <div
                                                key={store.id}
                                                onClick={() => handleStoreSelect(store.id)}
                                                className={cn(
                                                    "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all border",
                                                    isActive
                                                        ? "bg-blue-50 border-blue-200"
                                                        : "hover:bg-gray-50 border-transparent"
                                                )}
                                            >
                                                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center  overflow-hidden shadow-sm shrink-0">
                                                    {store.logo_url ? (
                                                        <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                                                    ) : store.type === "services" ? (
                                                        <img src="/icons/dashboard/nav_services.svg" alt="service" className="w-4 h-4" style={{ filter: "brightness(0)" }} />
                                                    ) : (
                                                        <img src="/icons/dashboard/nav_products.svg" alt="product" className="w-4 h-4" style={{ filter: "brightness(0)" }} />
                                                    )}
                                                </div>
                                                <span className={cn(
                                                    "text-sm",
                                                    isActive ? "text-gray-2" : "text-gray-2"
                                                )}>
                                                    {store.name}
                                                </span>
                                                {store.type === "services" ? (
                                                    <img src="/icons/dashboard/nav_services.svg" alt="service" className="w-4 h-4" style={{ filter: "brightness(1)" }} />
                                                ) : (
                                                    <img src="/icons/dashboard/nav_products.svg" alt="product" className="w-4 h-4" style={{ filter: "brightness(1)" }} />
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ================= ADMIN MENU ================= */}
                {isAdmin && (
                    <div className="px-2 py-2">
                        <Link
                            href={`/${lang}/admin/settings`}
                            className="flex items-center justify-between gap-3 w-full px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer text-gray-2"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Settings className="w-4 h-4"/>
                            </div>
                            <span className="text-sm font-medium">
                                الإعدادات
                            </span>
                            </div>
                            <ChevronLeft className="w-4 h-4"/>
                        </Link>

                        <Link
                            href={`/${lang}`}
                            className="flex items-center justify-between gap-3 w-full px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer text-gray-2"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <Home className="w-4 h-4"/>
                                </div>
                                <span className="text-sm font-medium">
                                    العودة للمنصة
                                </span>
                            </div>
                            <ChevronLeft className="w-4 h-4"/>
                        </Link>
                        <DropdownMenuSeparator className="my-2" />
                        <button
                            onClick={() => logout()}
                            className="flex items-center w-full px-3 py-3 rounded-lg hover:bg-red-50 transition-colors group cursor-pointer text-red-600 text-sm font-bold gap-3"
                        >
                            <LogOut className="w-5 h-5" strokeWidth={1.5} />
                            تسجيل الخروج
                        </button>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function MenuItem({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-2 w-full px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors group"
        >
            <Icon className="w-5 h-5 text-gray-2 group-hover:text-blue-4" strokeWidth={1.5} />
            <span className="text-sm  ">
                {label}
            </span>
        </Link>
    );
}