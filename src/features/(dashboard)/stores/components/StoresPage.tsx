// src/features/(dashboard)/stores/components/StoresPage.tsx
"use client";

import { useState, useMemo, useRef } from "react";
import { useInfiniteGetStores } from "../hooks"; // استبدال الهوك
import { Store } from "../api";
import { GenericSidebarList } from "@/src/components/(dashboard)/GenericSidebarList";
import { StoreEmptyState } from "./StoreEmptyState";
import { cn } from "@/src/lib/utils";
import Link from "next/link";
import { Plus } from "lucide-react";
import { SidebarFilterPanel } from "@/src/components/(dashboard)/SidebarFilterPanel";

const statusFilterOptions = [
    { label: "الكل", value: "all" },
    { label: "مفعل", value: "active" },
    { label: "غير مفعل", value: "not-active" },
];

export function StoresPage() {
    const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // لم نعد بحاجة لـ currentPage في الحالة المحلية مع infinite scroll
    // const [currentPage, setCurrentPage] = useState(1);

    const detailsRef = useRef<HTMLDivElement>(null);

    const queryParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set("per_page", "10"); // عدد العناصر لكل صفحة

        if (searchQuery) {
            params.set("name", searchQuery);
        }

        if (statusFilter !== "all") {
            params.set("status", statusFilter);
        }

        return params;
    }, [searchQuery, statusFilter]);

    // استخدام هوك Infinite Scroll
    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteGetStores(queryParams);

    // دمج جميع البيانات من الصفحات المختلفة
    const allStores = useMemo(() => {
        return data?.pages.flatMap((page) => page.data) || [];
    }, [data]);

    // التحقق من الحالة الفارغة الحقيقية (بدون بحث أو فلتر)
    const isTrueEmpty = !isLoading && !isError && allStores.length === 0 && !searchQuery && statusFilter === "all";

    const handleStoreClick = (store: Store) => {
        setSelectedStoreId(store.id);
        if (window.innerWidth < 1024) {
            detailsRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    };

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        // عند البحث، React Query سيعيد جلب البيانات تلقائياً من الصفحة الأولى
        // ولكن يفضل تصفير التحديد
        setSelectedStoreId(null);
    };

    const handleFilterChange = (value: string) => {
        setStatusFilter(value);
        setSelectedStoreId(null);
    };

    const renderStoreItem = (store: Store) => {
        const isSelected = selectedStoreId === store.id;
        const isActive = store.status === "active";

        return (
            <div
                key={store.id}
                onClick={() => handleStoreClick(store)}
                className={cn(
                    "flex items-center justify-between p-4 cursor-pointer transition-colors border-b border-gray-50 last:border-0",
                    isSelected ? "bg-blue-5" : "hover:bg-gray-50"
                )}
            >
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                        <img
                            src={store.logo_url || "/default-store.png"}
                            alt={store.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold truncate max-w-[120px] sm:max-w-[150px]">
                            {store.name}
                        </span>
                        <span className="text-xs text-gray-2">
                            {store.type === 'products' ? 'متجر منتجات' : 'متجر خدمات'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center gap-1.5">
                        <div className={cn("w-2 h-2 rounded-full", isActive ? "bg-green-500" : "bg-red-500")} />
                        <span className={cn("text-xs font-medium", isActive ? "text-green-600" : "text-red-600")}>
                            {isActive ? "مفعل" : "غير مفعل"}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gray-50 h-full lg:h-[calc(100vh-80px)] flex flex-col">
            <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-10 h-[65px]">
                <div className="flex items-center justify-between h-16 px-6">
                    <h1 className="text-blue-4 font-semibold">إدارة المتاجر</h1>
                    <Link
                        href="/admin/stores/add"
                        className="flex items-center gap-2 px-4 py-2 bg-[#3A5779] rounded-xs text-white text-sm font-semibold cursor-pointer hover:bg-[#2d4460] transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        إضافة متجر
                    </Link>
                </div>
            </header>

            <main className="flex-1 p-6 min-h-[calc(100vh-145px)]">
                {isTrueEmpty ? (
                    <StoreEmptyState />
                ) : (
                    <div className="grid grid-cols-12 gap-4 h-full">
                        <div className="col-span-12 lg:col-span-4 h-full order-1 lg:order-1">
                            <GenericSidebarList
                                data={allStores}
                                isLoading={isLoading}
                                isError={isError}
                                searchQuery={searchQuery}
                                onSearchChange={handleSearchChange}
                                filterValue={statusFilter}
                                onFilterChange={handleFilterChange}
                                filterOptions={statusFilterOptions}
                                renderItem={renderStoreItem}
                                emptyText="لا توجد متاجر مطابقة للبحث"
                                selectedId={selectedStoreId}
                                onLoadMore={fetchNextPage}
                                hasNextPage={hasNextPage}
                                isFetchingNextPage={isFetchingNextPage}
                            />
                        </div>

                        <div className="col-span-12 lg:col-span-8 h-full order-2 lg:order-2" ref={detailsRef}>
                            <div className="bg-white rounded-lg border border-gray-200 h-full flex items-center justify-center">
                                {!selectedStoreId ? (
                                    <div className="text-center p-6">
                                        <div className="h-44 mx-auto mb-2 flex items-center justify-center">
                                            <img src="/icons/dashboard/nostore.svg" className="h-44" alt="placeholder" />
                                        </div>
                                        <h3 className="text-xl font-bold">لم يتم اختيار متجر</h3>
                                        <p className="text-gray-3 text-sm mt-1">قم بتحديد متجر لمشاهدة تفاصيله هنا
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-10 text-center text-gray-500">
                                        {/* هنا سيتم وضع مكون تفاصيل المتجر لاحقاً */}
                                        <p>تفاصيل المتجر ID: {selectedStoreId}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}