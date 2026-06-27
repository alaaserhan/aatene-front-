// src/features/(dashboard)/components/DashboardUserMenu.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { useAuthStore } from "@/src/stores/auth-store";
import { setStoreContext } from "@/src/store-context";
import { useLogout } from "@/src/auth";
import { useGetStores } from "@/src/features/(dashboard)/stores/hooks";
import { useLanguage } from "@/src/hooks/use-language";
import { isSegmentAllowedForRole, MerchantRole } from "@/src/config/role-permissions";
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
    Coins,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

export function DashboardUserMenu() {
    const user = useAuthStore((state) => state.user);
    const { mutate: logout } = useLogout();
    const pathname = usePathname();
    const lang = useLanguage();


    const [isOpen, setIsOpen] = useState(false);
    const [storeSearch, setStoreSearch] = useState("");
    const [currentStoreId, setCurrentStoreId] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            return Cookies.get("current_store_id") || null;
        }
        return null;
    });

    const [storeRole, setStoreRole] = useState<MerchantRole | null>(() => {
        if (typeof window !== 'undefined') {
            return (Cookies.get("store_role") as MerchantRole) || null;
        }
        return null;
    });

    const isAdmin = user?.user_type === "admin";
    const isMerchant = user?.user_type === "merchant";

    // --- Fetch Stores (Only if Merchant) — المعتمدة فقط في مبدّل المتاجر ---
    const merchantStoresParams = useMemo(() => {
        const p = new URLSearchParams();
        p.set("per_page", "100");
        p.set("status", "approved");
        return p;
    }, []);

    const { data: storesData, isLoading: isLoadingStores } = useGetStores(
        merchantStoresParams,
        { enabled: isMerchant }
    );

    const stores = useMemo(
        () => (storesData?.data ?? []).filter((s) => s.status === "approved"),
        [storesData?.data]
    );

    // مزامنة المتجر النشط: فقط متاجر معتمدة (إن كان الكوكي لمتجر pending يُستبدل)
    useEffect(() => {
        if (stores.length === 0) return;

        const currentValid = stores.find((s) => String(s.id) === currentStoreId);
        const target = currentValid ?? stores[0];
        const targetId = String(target.id);

        if (currentValid && currentStoreId === targetId) return;

        const timer = setTimeout(() => {
            setCurrentStoreId(targetId);
            setStoreContext({
                storeId: targetId,
                storeType: target.type,
                storeSlug: target.slug ?? null,
                storeRole: target.role_in_store ?? null,
            });
            setStoreRole(target.role_in_store ?? null);
        }, 0);
        return () => clearTimeout(timer);
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
        if (selectedStore) {
            setStoreContext({
                storeId: String(storeId),
                storeType: selectedStore.type,
                storeSlug: selectedStore.slug ?? null,
                storeRole: selectedStore.role_in_store ?? null,
            });
            setStoreRole(selectedStore.role_in_store ?? null);
        }
        setCurrentStoreId(String(storeId));

        if (pathname?.includes("/admin/products/") && pathname?.endsWith("/edit")) {
            const baseUrl = pathname.split("/admin/products/")[0];
            window.location.assign(`${baseUrl}/admin/products`);
        } else {
            window.location.reload();
        }
    };

    // --- Admin Menu Items ----
    // const adminMenuItems = [
    //     { label: "الشكاوى", desc: "متابعة الشكاوى", icon: Frown, href: "/admin/all-reports" },
    //     { label: "الإشعارات", desc: "ادارة و متابعة الاشعارات", icon: Bell, href: "/admin/settings" },
    //     { label: "المفضلة", desc: "ادارة و متابعة المفضلة", icon: Star, href: "/admin/favorites" },
    //     { label: "الطلبات الغير موجودة", desc: "ادارة و متابعة الطلبات الغير موجودة", icon: FileQuestion, href: "/admin/requested-services" },
    //     { label: "البنرات الإعلانية", desc: "ادارة و متابعة البنرات الإعلانية", icon: TicketPercent, href: "/admin/banners" },
    //     { label: "الشحن", desc: "اختر وجهات الشحن", icon: Truck, href: "/admin/cities" },
    //     { label: "إدارة المحتوى", desc: "تحكم بالمحتوى الأساسي", icon: LayoutTemplate, href: "/admin/content-management" },
    //     { label: "الإعدادات", desc: "تخصيص الاشعارات و التنبيهات لعملائك", icon: Settings, href: "/admin/settings" },
    //     { label: "المدونات", desc: "إضافة وإدارة المدونات", icon: FileEdit, href: "/admin/blogs" },
    //     { label: "الكلمات المسيئة", desc: "إدارة الكلمات المسيئة", icon: MessageSquareOff, href: "/admin/abusive-words" },
    //     { label: "الذكاء الإصطناعي", desc: "إدارة التشات بوت ومعرفة الإحصائيات", icon: Bot, href: "/admin/mosa3edy" },
    // ];

    return (
        <DropdownMenu
            dir="rtl"
            open={isOpen}
            onOpenChange={setIsOpen}
        >
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size={null}
                    className="flex items-center gap-3 px-0 md:px-1 py-1 rounded-lg hover:bg-transparent h-auto outline-none ring-0 focus-visible:ring-0 group"
                >
                    <Avatar className="w-12 h-12 border border-white group-hover:border-blue-100 transition-colors">
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
                            {isAdmin ? "ادمن" : (activeStore?.name || "تاجر")}
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
                        <Avatar className="w-13 h-13 border border-blue-1">
                            {/* عرض صورة المتجر المختار */}
                            <AvatarImage src={activeStore?.logo_url || ""} className="object-contain" />
                            <AvatarFallback className="bg-blue-4 text-white text-xl">
                                {activeStore?.name?.[0] || user?.fullname?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            {/* عرض اسم المتجر المختار */}
                            <h3 className="font-medium text-blue-4 mb-1">
                                {activeStore ? activeStore.name : "اختر متجر"}
                            </h3>
                            <span className="text-xs font-medium text-blue-4 bg-blue-5 border border-blue-4 px-4 py-1 pb-0.5 w-fit rounded-full">
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
                            {/* ⚠️ رابط شراء العملات الذهبية - معطّل مؤقتاً */}
                            {/* {isSegmentAllowedForRole(storeRole || undefined, "coins") && (
                                <MenuItem href={`/${lang}/admin/coins/buy`} icon={Coins} label="النقاط" onClick={() => setIsOpen(false)} />
                            )} */}
                            {/* ⚠️ السجل المالي مرتبط بنظام coins - معطّل مؤقتاً */}
                            {/* {isSegmentAllowedForRole(storeRole || undefined, "financial-record") && (
                                <MenuItem href={`/${lang}/admin/financial-record`} icon={FileText} label="السجل المالي" onClick={() => setIsOpen(false)} />
                            )} */}
                            {activeStore?.slug && (
                                <MenuItem href={`/${lang}/store/${activeStore.slug}`} icon={Store} label="الذهاب للمتجر" onClick={() => setIsOpen(false)} />
                            )}
                            <MenuItem href={`/${lang}`} icon={Home} label="العودة للمنصة" onClick={() => setIsOpen(false)} />

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
                                    <p className="text-xs text-center text-gray-2 py-2">لا يوجد متاجر معتمدة</p>
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
                                                        ? "bg-blue-5 border-blue-1"
                                                        : "hover:bg-gray-50 border-transparent"
                                                )}
                                            >
                                                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center  overflow-hidden shadow-sm shrink-0">
                                                    {store.logo_url ? (
                                                        <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                                                    ) : store.type === "services" ? (
                                                        <img src="/icons/dashboard/nav_services.svg" alt="" aria-hidden className="w-4 h-4" style={{ filter: "brightness(0)" }} />
                                                    ) : (
                                                        <img src="/icons/dashboard/nav_products.svg" alt="" aria-hidden className="w-4 h-4" style={{ filter: "brightness(0)" }} />
                                                    )}
                                                </div>
                                                <span className={cn(
                                                    "text-sm line-clamp-1 flex-1",
                                                    isActive ? "text-gray-2" : "text-gray-2"
                                                )}>
                                                    {store.name}
                                                </span>
                                                {store.type === "services" ? (
                                                    <img src="/icons/dashboard/nav_services.svg" alt="" aria-hidden className="w-4 h-4" />
                                                ) : (
                                                    <img src="/icons/dashboard/nav_products.svg" alt="" aria-hidden className="w-4 h-4" />
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
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-between gap-3 w-full px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer text-gray-2"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <Settings className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium">
                                    الإعدادات
                                </span>
                            </div>
                            <ChevronLeft className="w-4 h-4" />
                        </Link>

                        <Link
                            href={`/${lang}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-between gap-3 w-full px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer text-gray-2"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <Home className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium">
                                    العودة للمنصة
                                </span>
                            </div>
                            <ChevronLeft className="w-4 h-4" />
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

function MenuItem({ href, icon: Icon, label, onClick }: { href: string; icon: React.ElementType; label: string; onClick?: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="flex items-center gap-2 w-full px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors group"
        >
            <Icon className="w-5 h-5 text-gray-2 group-hover:text-blue-4" strokeWidth={1.5} />
            <span className="text-sm  text-gray-3">
                {label}
            </span>
        </Link>
    );
}