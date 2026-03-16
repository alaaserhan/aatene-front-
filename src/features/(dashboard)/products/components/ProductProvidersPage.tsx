// src/features/(dashboard)/products/components/ProductProvidersPage.tsx
"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, Plus, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useGetStores, useDeleteStore } from "../../stores/hooks";
import { Store } from "../../stores/api";
import { ProductProvidersTable } from "./ProductProvidersTable";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { Input } from "@/src/components/ui/input";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { useGetProducts, useUpdateProductStatus, useUpdateProductShown, useDeleteProduct } from "../hooks";
import { MerchantProductStatus, Product } from "../api";
import { ProductTable } from "./ProductTable";
import { ProductEmptyState } from "./ProductEmptyState";
import { useGetAllSectionsAdmin } from "../../sections/hooks";
import { cn } from "@/src/lib/utils";

const statusFilterOptions = [
    { label: "الكل", value: "all" },
    { label: "نشط", value: "active" },
    { label: "غير نشط", value: "not-active" },
];

const productStatusTabs: { key: MerchantProductStatus; label: string; activeClass: string; activeTextClass: string; badgeClass: string }[] = [
    { key: "active", label: "تمت الموافقة عليه", activeClass: "border-emerald-500 text-emerald-500", activeTextClass: "text-emerald-500", badgeClass: "bg-emerald-500" },
    { key: "not-active", label: "قيد المراجعة", activeClass: "border-amber-400 text-amber-400", activeTextClass: "text-amber-400", badgeClass: "bg-amber-400" },
    { key: "rejected", label: "مرفوض", activeClass: "border-red-500 text-red-500", activeTextClass: "text-red-500", badgeClass: "bg-red-500" },
];

// ── مكوّن عرض كل المنتجات مع sections sidebar ──
function AllProductsSection() {
    const router = useRouter();
    const detailsRef = useRef<HTMLDivElement>(null);

    const [activeStatus, setActiveStatus] = useState<MerchantProductStatus>("active");
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [productToDelete, setProductToDelete] = useState<number | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // جلب كل الأقسام (أدمن بدون store_id → كل أقسام جميع المتاجر)
    const sectionsQueryParams = useMemo(() => {
        const p = new URLSearchParams();
        p.set("per_page", "200");
        p.set("status", "active");
        return p;
    }, []);
    const { data: sectionsData } = useGetAllSectionsAdmin(sectionsQueryParams, { staleTime: 60_000 });
    const sections = useMemo(() => sectionsData?.data || [], [sectionsData?.data]);

    // عدد كل المنتجات (لـ sidebar "جميع المنتجات")
    const totalCountParams = useMemo(() => {
        const p = new URLSearchParams();
        p.set("per_page", "1");
        if (searchQuery) p.set("name", searchQuery);
        return p;
    }, [searchQuery]);
    const { data: totalCountData } = useGetProducts(totalCountParams);
    const totalProductsCount = totalCountData?.recordsFiltered ?? 0;

    const productsQueryParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set("page", String(currentPage));
        params.set("per_page", "10");
        params.set("status", activeStatus);
        if (searchQuery) params.set("name", searchQuery);
        if (selectedSectionId) params.set("section_id", selectedSectionId);
        return params;
    }, [activeStatus, searchQuery, currentPage, selectedSectionId]);

    const { data: productsData, isLoading } = useGetProducts(productsQueryParams, {
        staleTime: 0,
        refetchOnWindowFocus: true,
        refetchInterval: 30_000,
    });
    const products = productsData?.data || [];
    const totalPages = Math.ceil((productsData?.recordsFiltered || 0) / 10);

    const activeCountParams = useMemo(() => { const p = new URLSearchParams(); p.set("status", "active"); p.set("per_page", "1"); if (searchQuery) p.set("name", searchQuery); if (selectedSectionId) p.set("section_id", selectedSectionId); return p; }, [searchQuery, selectedSectionId]);
    const notActiveCountParams = useMemo(() => { const p = new URLSearchParams(); p.set("status", "not-active"); p.set("per_page", "1"); if (searchQuery) p.set("name", searchQuery); if (selectedSectionId) p.set("section_id", selectedSectionId); return p; }, [searchQuery, selectedSectionId]);
    const rejectedCountParams = useMemo(() => { const p = new URLSearchParams(); p.set("status", "rejected"); p.set("per_page", "1"); if (searchQuery) p.set("name", searchQuery); if (selectedSectionId) p.set("section_id", selectedSectionId); return p; }, [searchQuery, selectedSectionId]);

    const { data: activeCountData } = useGetProducts(activeCountParams);
    const { data: notActiveCountData } = useGetProducts(notActiveCountParams);
    const { data: rejectedCountData } = useGetProducts(rejectedCountParams);

    const getCount = (key: MerchantProductStatus) => {
        if (key === "active") return activeCountData?.recordsFiltered ?? 0;
        if (key === "not-active") return notActiveCountData?.recordsFiltered ?? 0;
        return rejectedCountData?.recordsFiltered ?? 0;
    };

    const { mutate: updateStatusMutation } = useUpdateProductStatus();
    const { mutate: updateShown } = useUpdateProductShown();
    const { mutate: deleteProduct } = useDeleteProduct();

    const handleToggleStatus = (product: Product) => {
        const newStatus = product.status === "active" ? "not-active" : "active";
        updateStatusMutation({ id: product.id, payload: { status: newStatus } });
    };
    const handleToggleShown = (product: Product) => {
        updateShown({ id: product.id, payload: { shown: !product.shown } });
    };
    const handleDeleteClick = (product: Product) => { setProductToDelete(product.id); setDeleteModalOpen(true); };
    const handleConfirmDelete = () => {
        if (productToDelete) { deleteProduct(productToDelete); setDeleteModalOpen(false); setProductToDelete(null); }
    };
    const handleEditClick = (product: Product) => { router.push(`/admin/products/${product.id}/edit`); };
    const handleViewClick = (product: Product) => { router.push(`/admin/products/${product.id}/view?from=${encodeURIComponent("/admin/productProviders")}`); };

    const handleSectionClick = (sectionId: string | null) => {
        setSelectedSectionId(sectionId);
        setCurrentPage(1);
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
            detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <>
            {/* Search */}
            <div className="mb-4">
                <div className="relative bg-white rounded-lg border border-gray-200 max-w-full">
                    <Search className="w-5 h-5 text-gray-2 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                        placeholder="ابحث باسم المنتج..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="pr-10 h-12 border-none shadow-none focus-visible:ring-0"
                    />
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 items-start">

                {/* Sections sidebar — يظهر فقط إن وُجدت أقسام */}
                {sections.length > 0 && (
                    <div className="col-span-12 lg:col-span-3">
                        {/* زر التبديل — يظهر فقط على الهاتف */}
                        <button
                            onClick={() => setIsSidebarOpen(v => !v)}
                            className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-gray-200 mb-2 cursor-pointer"
                        >
                            <span className="font-medium text-sm text-gray-700">
                                {selectedSectionId
                                    ? sections.find(s => String(s.id) === selectedSectionId)?.name ?? "الأقسام"
                                    : "جميع المنتجات"}
                            </span>
                            <ChevronRight className={cn("w-4 h-4 text-gray-400 transition-transform duration-200", isSidebarOpen ? "-rotate-90" : "rotate-90")} />
                        </button>

                        {/* قائمة الأقسام — دائمة على الشاشات الكبيرة، تُفتح/تُغلق على الهاتف */}
                        {/* على الهاتف: تظهر فقط عند isSidebarOpen | على lg+: دائماً مرئية */}
                        <div className={cn(
                            "bg-white rounded-lg border border-gray-200 overflow-hidden",
                            "lg:!block",
                            isSidebarOpen ? "block" : "hidden"
                        )}>
                            {/* جميع المنتجات */}
                            <button
                                onClick={() => handleSectionClick(null)}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-3 transition-colors cursor-pointer",
                                    !selectedSectionId ? "bg-blue-5 text-blue-3 font-medium" : "text-gray-600 hover:bg-gray-50"
                                )}
                            >
                                <span className="flex-1 text-right text-sm mx-2">
                                    جميع المنتجات
                                    <span className={cn("mr-1 text-sm font-medium", !selectedSectionId ? "text-blue-3" : "text-gray-400")}>
                                        ({totalProductsCount})
                                    </span>
                                </span>
                                <ChevronRight className={cn("w-4 h-4 flex-shrink-0 rotate-180", !selectedSectionId ? "text-blue-3" : "text-gray-400")} />
                            </button>

                            {sections.map((section) => {
                                const isActive = selectedSectionId === String(section.id);
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => handleSectionClick(String(section.id))}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-3 border-t border-gray-100 transition-colors cursor-pointer",
                                            isActive ? "bg-blue-5 text-blue-3 font-medium" : "text-gray-600 hover:bg-gray-50"
                                        )}
                                    >
                                        <span className="flex-1 text-right text-sm mx-2">{section.name}</span>
                                        <ChevronRight className={cn("w-4 h-4 flex-shrink-0 rotate-180", isActive ? "text-blue-3" : "text-gray-400")} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Main content */}
                <div
                    ref={detailsRef}
                    className={cn(
                        "col-span-12 bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col",
                        sections.length > 0 ? "lg:col-span-9" : "lg:col-span-12"
                    )}
                >
                    {/* Status tabs */}
                    <div className="flex items-center gap-8 px-6 pt-4 border-b border-gray-100">
                        {productStatusTabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => { setActiveStatus(tab.key); setCurrentPage(1); }}
                                className={`flex cursor-pointer items-center gap-2 pb-3 border-b-[3px] transition-all duration-200 ${
                                    activeStatus === tab.key ? tab.activeClass : "border-transparent text-gray-2 hover:text-gray-2"
                                }`}
                            >
                                <span className="font-bold text-sm">{tab.label}</span>
                                <span className={`flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded text-sm font-bold text-white ${
                                    activeStatus === tab.key ? tab.badgeClass : "bg-gray-2"
                                }`}>
                                    {getCount(tab.key)}
                                </span>
                            </button>
                        ))}
                    </div>

                    {!isLoading && products.length === 0 ? (
                        <ProductEmptyState type="no-products" />
                    ) : (
                        <ProductTable
                            products={products}
                            isLoading={isLoading}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            onToggleShown={handleToggleShown}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                            onView={handleViewClick}
                            onToggleStatus={handleToggleStatus}
                            activeStatus={activeStatus}
                        />
                    )}
                </div>
            </div>

            <ConfirmDeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="هل أنت متأكد من حذف هذا المنتج؟"
                description="لا يمكن التراجع عن هذا الإجراء"
            />
        </>
    );
}

// ── مكوّن عرض مقدمي المنتجات ──
function ProvidersSection() {
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [storeToDelete, setStoreToDelete] = useState<number | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const queryParams = useMemo(() => {
        const params = new URLSearchParams();
        params.set("page", String(currentPage));
        params.set("per_page", "10");
        params.set("type", "products");
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (searchQuery) params.set("owner_name", searchQuery);
        return params;
    }, [statusFilter, searchQuery, currentPage]);

    const { data, isLoading } = useGetStores(queryParams);
    const stores = data?.data || [];
    const totalPages = Math.ceil((data?.recordsFiltered || 0) / 10);

    const { mutate: deleteStore } = useDeleteStore();

    const handleDeleteClick = (store: Store) => { setStoreToDelete(store.id); setDeleteModalOpen(true); };
    const handleConfirmDelete = () => {
        if (storeToDelete) { deleteStore(storeToDelete); setDeleteModalOpen(false); setStoreToDelete(null); }
    };
    const handleShowClick = (store: Store) => { router.push(`/admin/productProviders/${store.id}`); };
    const handleEditClick = (store: Store) => { router.push(`/admin/users?userId=${store.owner?.id}`); };

    return (
        <>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="w-5 h-5 text-gray-2 absolute right-3 top-1/2 -translate-y-1/2" />
                        <Input
                            placeholder="ابحث باسم مقدم المنتجات..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="ps-4 pr-10 h-[46px] bg-white border-gray-200 w-full"
                            dir="rtl"
                        />
                    </div>
                    <div className="w-full md:w-[180px] shrink-0">
                        <ReusableDropdown
                            options={statusFilterOptions}
                            value={statusFilter}
                            onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
                            placeholder="تصفية"
                            className="bg-white h-[46px] border-gray-200 w-full"
                            triggerIcon={<Filter className="w-4 h-4 text-gray-2" />}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-lg overflow-hidden">
                    <ProductProvidersTable
                        stores={stores}
                        isLoading={isLoading}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        onDelete={handleDeleteClick}
                        onEdit={handleEditClick}
                        onShow={handleShowClick}
                    />
                </div>
            </div>

            <ConfirmDeleteModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="هل أنت متأكد من حذف مقدم المنتجات؟"
                description="سيتم حذف المتجر وجميع المنتجات المرتبطة به. لا يمكن التراجع عن هذا الإجراء."
            />
        </>
    );
}

// ── الصفحة الرئيسية بتبويبين ──
type MainTab = "products" | "providers";

export function ProductProvidersPage() {
    const [activeTab, setActiveTab] = useState<MainTab>("products");

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-10 h-[65px]">
                <div className="flex items-center justify-between h-16 px-6">
                    {/* تبويبان قابلان للنقر */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setActiveTab("products")}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                activeTab === "products"
                                    ? "bg-blue-3 text-white"
                                    : "text-blue-4 hover:bg-blue-50"
                            }`}
                        >
                            المنتجات
                        </button>
                        <button
                            onClick={() => setActiveTab("providers")}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                activeTab === "providers"
                                    ? "bg-blue-3 text-white"
                                    : "text-blue-4 hover:bg-blue-50"
                            }`}
                        >
                            مقدمي المنتجات
                        </button>
                    </div>

                    {/* زر الإضافة يظهر فقط في تبويب مقدمي المنتجات */}
                    {activeTab === "providers" && (
                        <Link href="/admin/users/add">
                            <button className="flex items-center gap-2 bg-blue-3 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-4 transition-colors">
                                <Plus className="w-4 h-4" />
                                إضافة مقدم منتج جديد
                            </button>
                        </Link>
                    )}
                </div>
            </div>

            <main className="px-4 pb-4">
                {activeTab === "products" && <AllProductsSection />}
                {activeTab === "providers" && <ProvidersSection />}
            </main>
        </div>
    );
}
