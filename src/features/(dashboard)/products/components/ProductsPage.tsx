// src/features/(dashboard)/products/components/ProductsPage.tsx
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { Plus, Loader2, Store, Package, Layers } from "lucide-react";
import { useInfiniteGetProducts } from "../hooks";
import { useGetSections } from "../../sections/hooks";
import { useAuthStore } from "@/src/stores/auth-store";
import { Product } from "../api";
import { Section } from "../../sections/api";
import { GenericSidebarList } from "@/src/components/(dashboard)/GenericSidebarList";
import { SidebarFilterPanel } from "@/src/components/(dashboard)/SidebarFilterPanel";
import { ProductEmptyState } from "./ProductEmptyState";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";

// خيارات الفلتر للأدمن
const adminFilterOptions = [
    { name: "الكل", value: "all" },
    { name: "مفعل", value: "active" },
    { name: "غير مفعل", value: "not-active" },
];

export function ProductsPage() {
    const [isMounted, setIsMounted] = useState(false);
    const user = useAuthStore((state) => state.user);
    const isAdmin = user?.user_type === "admin";
    const isMerchant = user?.user_type === "merchant";

    // --- Page Mode (Products vs Services) ---
    const [pageMode, setPageMode] = useState<"product" | "service">("product");

    // --- Store ID Logic (Merchant Only) ---
    const [storeId] = useState<string | null>(() => {
        if (typeof window !== "undefined" && isMerchant) {
            return Cookies.get("current_store_id") || null;
        }
        return null;
    });

    const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const detailsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // --- 1. Fetch Sections (Merchant Only) ---
    const sectionsQueryParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set("per_page", "100");
        if (searchQuery && isMerchant) {
            params.set("name", searchQuery);
        }
        return params;
    }, [searchQuery, isMerchant]);

    const { data: sectionsData, isLoading: isLoadingSections } = useGetSections(
        sectionsQueryParams,
        storeId || undefined,
        { enabled: !!storeId && isMerchant && isMounted }
    );

    const sections = sectionsData?.data || [];
    const hasSections = (sectionsData?.recordsTotal || 0) > 0;

    // --- 2. Fetch Products ---
    const productsQueryParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set("per_page", "10");

        // منطق الأدمن: الفلترة حسب الحالة والبحث العام (بدون store_id لجلب كل المنتجات)
        if (isAdmin) {
            if (statusFilter !== "all") {
                params.set("status", statusFilter);
            }
            if (searchQuery) {
                params.set("name", searchQuery);
            }
        }

        // منطق التاجر: الفلترة حسب المتجر والقسم
        if (isMerchant) {
            if (storeId) {
                params.set("store_id", storeId);
            }
            if (selectedSectionId) {
                params.set("section_id", String(selectedSectionId));
            }
            // بحث التاجر داخل منتجات القسم المختار
            if (searchQuery && selectedSectionId) {
                params.set("name", searchQuery);
            }
        }

        return params;
    }, [storeId, selectedSectionId, statusFilter, searchQuery, isAdmin, isMerchant]);

    // التحكم في تفعيل جلب المنتجات
    const isProductsEnabled = isAdmin || (isMerchant && !!selectedSectionId);

    const {
        data: productsData,
        isLoading: isLoadingProducts,
        isError: isProductsError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteGetProducts(productsQueryParams);

    const allProducts = useMemo(() => {
        if (!isProductsEnabled) return [];
        return productsData?.pages.flatMap((page) => page.data) || [];
    }, [productsData, isProductsEnabled]);

    // --- Handlers ---

    const handleSectionClick = (section: Section) => {
        setSelectedSectionId(section.id);
        if (window.innerWidth < 1024) {
            detailsRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    };

    const handleAdminFilterChange = (value: string) => {
        setStatusFilter(value);
    };

    // --- UI Render Helpers ---

    const renderSectionItem = (section: Section) => {
        const isSelected = selectedSectionId === section.id;
        const isActive = (section as Section).status === "active";

        return (
            <div
                key={section.id}
                onClick={() => handleSectionClick(section)}
                className={cn(
                    "flex items-center justify-between p-4 cursor-pointer transition-colors border-b border-gray-50 last:border-0",
                    isSelected ? "bg-blue-5" : "hover:bg-gray-50"
                )}
            >
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                        {section.image_url ? (
                            <img
                                src={section.image_url}
                                alt={section.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Layers className="w-5 h-5 text-gray-400" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold truncate max-w-[150px] text-gray-900">
                            {section.name}
                        </span>
                    </div>
                </div>

                {isActive !== undefined && (
                    <div className={cn("w-2 h-2 rounded-full", isActive ? "bg-green-500" : "bg-red-500")} />
                )}
            </div>
        );
    };

    const renderProductGridItem = (product: Product) => (
        <div
            key={product.id}
            className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition-shadow cursor-pointer"
        >
            <div className="relative w-full aspect-square bg-gray-50 rounded-lg overflow-hidden">
                {product.cover_url ? (
                    <img
                        src={product.cover_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-300" />
                    </div>
                )}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-[10px] font-medium ${product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {product.status === 'active' ? 'مفعل' : 'غير مفعل'}
                </div>
            </div>
            <div>
                <h4 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{product.sku}</p>
                <p className="text-sm font-bold text-blue-4 mt-2">{product.price} {product.category?.name}</p>
            </div>
        </div>
    );

    // --- Loading & Empty States ---

    if (!isMounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-3" />
            </div>
        );
    }

    // حالة التاجر: لم يتم اختيار متجر (للأدمن يتم تخطي هذا الشرط)
    if (isMerchant && !storeId) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 bg-gray-50">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Store className="w-8 h-8 text-blue-4" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">لم يتم اختيار متجر</h2>
                    <p className="text-gray-500 mb-6">
                        يرجى اختيار المتجر الذي تريد إدارة منتجاته من القائمة العلوية.
                    </p>
                </div>
            </div>
        );
    }

    // حساب الحالات الفارغة للتاجر فقط (لأن الأدمن لديه فلترة مختلفة)
    const isNoSectionsEmptyState = isMerchant && !isLoadingSections && !hasSections;
    const isNoProductsEmptyState = isMerchant && selectedSectionId && !isLoadingProducts && allProducts.length === 0;

    // --- Header Action Button Logic ---
    const renderHeaderAction = () => {
        if (pageMode === 'service') {
            return (
                <Link
                    href="/dashboard/services/add"
                    className="flex items-center gap-2 px-4 py-2 bg-[#3A5779] rounded-sm text-white text-sm font-semibold cursor-pointer hover:bg-[#2d4460] transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    خدمة جديدة
                </Link>
            );
        }

        // Product Mode Logic
        if (isMerchant && isNoSectionsEmptyState) {
            return (
                <Link
                    href="/dashboard/sections"
                    className="flex items-center gap-2 px-4 py-2 bg-[#3A5779] rounded-sm text-white text-sm font-semibold cursor-pointer hover:bg-[#2d4460] transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    إضافة قسم
                </Link>
            );
        }

        const showAddProduct = isAdmin || (isMerchant && !isNoSectionsEmptyState && selectedSectionId);

        if (showAddProduct) {
            const href = isAdmin
                ? "/dashboard/products/add"
                : `/dashboard/products/add?section_id=${selectedSectionId}`;

            return (
                <Link
                    href={href}
                    className="flex items-center gap-2 px-4 py-2 bg-[#3A5779] rounded-sm text-white text-sm font-semibold cursor-pointer hover:bg-[#2d4460] transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    منتج جديد
                </Link>
            );
        }

        return null;
    };

    return (
        <div className="bg-gray-50 h-full lg:h-[calc(100vh-80px)] flex flex-col">
            <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-10 h-[65px]">
                <div className="flex items-center justify-between h-16 px-6">
                    {/* Tabs Navigation */}
                    <nav className="flex items-center h-full">
                        <ul className="flex items-center gap-8 h-full">
                            <li className="h-full flex items-center">
                                <button
                                    onClick={() => setPageMode("product")}
                                    className={cn(
                                        "text-sm font-semibold h-full flex items-center transition-colors cursor-pointer px-1",
                                        pageMode === "product"
                                            ? "text-blue-4 border-b-2 border-blue-4"
                                            : "text-gray-400 hover:text-blue-4"
                                    )}
                                >
                                    المنتجات
                                </button>
                            </li>
                            <li className="h-full flex items-center">
                                <button
                                    onClick={() => setPageMode("service")}
                                    className={cn(
                                        "text-sm font-semibold h-full flex items-center transition-colors cursor-pointer px-1",
                                        pageMode === "service"
                                            ? "text-blue-4 border-b-2 border-blue-4"
                                            : "text-gray-400 hover:text-blue-4"
                                    )}
                                >
                                    الخدمات
                                </button>
                            </li>
                        </ul>
                    </nav>

                    {/* Header Action Button */}
                    {renderHeaderAction()}
                </div>
            </header>

            <main className="flex-1 p-6 min-h-[calc(100vh-145px)] overflow-hidden">
                {/* Placeholder for Services Tab */}
                {pageMode === "service" ? (
                    <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg border border-gray-200 p-8 text-center shadow-sm">
                        <div className="h-32 w-32 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Store className="h-16 w-16 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">إدارة الخدمات</h3>
                        <p className="text-gray-500">سيتم عرض الخدمات هنا قريباً.</p>
                    </div>
                ) : (
                    /* Product Tab Content */
                    isNoSectionsEmptyState ? (
                        <ProductEmptyState type="no-sections" />
                    ) : (
                        <div className="grid grid-cols-12 gap-4 h-full">

                            {/* --- SIDEBAR --- */}
                            <div className="col-span-12 lg:col-span-3 h-full order-1 lg:order-1 flex flex-col">
                                {isAdmin ? (
                                    // 1. Sidebar for ADMIN: Filter Panel
                                    <SidebarFilterPanel
                                        options={adminFilterOptions}
                                        activeValue={statusFilter}
                                        onValueChange={handleAdminFilterChange}
                                        className="h-full border border-gray-200 rounded-lg"
                                    />
                                ) : (
                                    // 2. Sidebar for MERCHANT: Generic List (Sections)
                                    <GenericSidebarList
                                        data={sections}
                                        isLoading={isLoadingSections}
                                        isError={false}
                                        searchQuery={searchQuery}
                                        onSearchChange={setSearchQuery}
                                        renderItem={renderSectionItem}
                                        emptyText="لا توجد أقسام"
                                        selectedId={selectedSectionId}
                                        className="h-full"
                                    />
                                )}
                            </div>

                            {/* --- MAIN CONTENT --- */}
                            <div className="col-span-12 lg:col-span-9 h-full order-2 lg:order-2 overflow-y-auto" ref={detailsRef}>

                                {/* حالة التاجر: لم يتم اختيار قسم */}
                                {isMerchant && !selectedSectionId ? (
                                    <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col items-center justify-center shadow-sm p-8">
                                        <div className="h-44 mx-auto mb-2 flex items-center justify-center">
                                            <img src="/icons/dashboard/nostore.svg" className="h-44" alt="placeholder" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2 ">لم يتم اختيار قسم</h3>
                                        <p className="text-gray-3 text-sm">
                                            قم باختيار قسم من القائمة الجانبية لعرض المنتجات الخاصة به
                                        </p>
                                    </div>
                                ) : isNoProductsEmptyState ? (
                                    // حالة التاجر: القسم مختار لكن فارغ
                                    <ProductEmptyState type="no-products" />
                                ) : isLoadingProducts ? (
                                    <div className="bg-white rounded-lg border border-gray-200 h-full flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-3" />
                                    </div>
                                ) : (
                                    // عرض شبكة المنتجات (للأدمن أو للتاجر بعد اختيار القسم)
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                                        {allProducts.length > 0 ? (
                                            allProducts.map(renderProductGridItem)
                                        ) : (
                                            // حالة الأدمن: لا توجد منتجات مطابقة للفلتر
                                            <div className="col-span-full flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-gray-200">
                                                <Package className="h-12 w-12 text-gray-300 mb-2" />
                                                <p className="text-gray-500">لا توجد منتجات للعرض</p>
                                            </div>
                                        )}

                                        {/* زر تحميل المزيد */}
                                        {(hasNextPage || isFetchingNextPage) && (
                                            <div className="col-span-full flex justify-center py-4">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => fetchNextPage()}
                                                    disabled={isFetchingNextPage}
                                                    className="text-blue-4"
                                                >
                                                    {isFetchingNextPage ? "جاري التحميل..." : "تحميل المزيد"}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                )}
            </main>
        </div>
    );
}