// src/features/(dashboard)/products/components/ProductsPage.tsx
"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { Plus, Loader2, ChevronRight, Search } from "lucide-react";
import {
  useGetProducts,
  useUpdateProductStatus,
  useDeleteProduct,
  useUpdateProductShown
} from "../hooks";
import { MerchantProductStatus } from "../api";
import { useGetSections } from "../../sections/hooks";
import { useGetSingleStore } from "../../stores/hooks";
import { Product } from "../api";
import { ProductEmptyState } from "./ProductEmptyState";
import { ProductTable } from "./ProductTable";
import { cn } from "@/src/lib/utils";
import { useRouter } from "next/navigation";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { StoreEmptyState } from "@/src/components/(dashboard)/StoreEmptyState";
import { SectionModal, SectionFormData } from "../../sections/components/SectionModal";
import { useCreateSection } from "../../sections/hooks";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Input } from "@/src/components/ui/input";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";

interface ProductsPageProps {
  /** When provided (admin viewing a specific store), acts like ServicesPage */
  storeId?: number;
}

export function ProductsPage({ storeId: propStoreId }: ProductsPageProps = {}) {
  const router = useRouter();

  const userTypeCookie = Cookies.get("user_type");
  const isAdmin = userTypeCookie === "admin";
  const isMerchant = userTypeCookie === "merchant";

  // Base navigation prefix based on user type
  const navPrefix = "/admin" ;

  // If propStoreId is provided → admin is viewing a specific store (ServicesPage-style)
  const isAdminViewingStore = isAdmin && !!propStoreId;

  // Merchant's own store from cookie
  const merchantStoreId = isMerchant ? (Cookies.get("current_store_id") ?? null) : null;

  // The effective store ID for queries
  const effectiveStoreId = propStoreId
    ? String(propStoreId)
    : merchantStoreId;

  // --- States ---
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState<MerchantProductStatus | "all">("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);

  const detailsRef = useRef<HTMLDivElement>(null);

  // --- Store info (for admin viewing a specific store) ---
  const { data: storeData } = useGetSingleStore(
    propStoreId ? String(propStoreId) : undefined,
    { enabled: isAdminViewingStore }
  );
  const store = storeData?.record;

  // --- Sections ---
  const sectionsQueryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("per_page", "100");
    if (effectiveStoreId) params.set("store_id", effectiveStoreId);
    return params;
  }, [effectiveStoreId]);

  const { data: sectionsData, isLoading: isLoadingSections } = useGetSections(
    sectionsQueryParams,
    effectiveStoreId || undefined,
    { enabled: !!effectiveStoreId }
  );

  const sections = useMemo(() => sectionsData?.data || [], [sectionsData?.data]);
  const hasSections = (sectionsData?.recordsTotal || 0) > 0;

  // --- Status count queries ---
  const isProductsEnabled = !!effectiveStoreId;

  const activeCountParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("status", "active");
    params.set("per_page", "1");
    if (effectiveStoreId) params.set("store_id", effectiveStoreId);
    if (selectedSectionId && selectedSectionId !== "other") params.set("section_id", selectedSectionId);
    if (searchQuery) params.set("name", searchQuery);
    return params;
  }, [effectiveStoreId, selectedSectionId, searchQuery]);

  const notActiveCountParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("status", "not-active");
    params.set("per_page", "1");
    if (effectiveStoreId) params.set("store_id", effectiveStoreId);
    if (selectedSectionId && selectedSectionId !== "other") params.set("section_id", selectedSectionId);
    if (searchQuery) params.set("name", searchQuery);
    return params;
  }, [effectiveStoreId, selectedSectionId, searchQuery]);

  const rejectedCountParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("status", "rejected");
    params.set("per_page", "1");
    if (effectiveStoreId) params.set("store_id", effectiveStoreId);
    if (selectedSectionId && selectedSectionId !== "other") params.set("section_id", selectedSectionId);
    if (searchQuery) params.set("name", searchQuery);
    return params;
  }, [effectiveStoreId, selectedSectionId, searchQuery]);

  const countQueryOptions = { enabled: isProductsEnabled, staleTime: 0 };
  const { data: activeCountData } = useGetProducts(activeCountParams, countQueryOptions);
  const { data: notActiveCountData } = useGetProducts(notActiveCountParams, countQueryOptions);
  const { data: rejectedCountData } = useGetProducts(rejectedCountParams, countQueryOptions);

  const totalCountParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("per_page", "1");
    if (effectiveStoreId) params.set("store_id", effectiveStoreId);
    if (searchQuery) params.set("name", searchQuery);
    return params;
  }, [effectiveStoreId, searchQuery]);

  const { data: totalCountData } = useGetProducts(totalCountParams, { enabled: isProductsEnabled });
  const totalProductsCount = totalCountData?.recordsFiltered ?? 0;

  const getCountForStatus = (key: MerchantProductStatus) => {
    switch (key) {
      case "active": return activeCountData?.recordsFiltered ?? 0;
      case "not-active": return notActiveCountData?.recordsFiltered ?? 0;
      case "rejected": return rejectedCountData?.recordsFiltered ?? 0;
      default: return 0;
    }
  };

  const statusTabs: { key: MerchantProductStatus; label: string; activeClass: string; activeTextClass: string; badgeClass: string }[] = [
    { key: "active", label: "تمت الموافقة عليه", activeClass: "border-emerald-500 text-emerald-500", activeTextClass: "text-emerald-500", badgeClass: "bg-emerald-500" },
    { key: "not-active", label: "قيد المراجعة", activeClass: "border-amber-400 text-amber-400", activeTextClass: "text-amber-400", badgeClass: "bg-amber-400" },
    { key: "rejected", label: "مرفوض", activeClass: "border-red-500 text-red-500", activeTextClass: "text-red-500", badgeClass: "bg-red-500" },
  ];

  const productsQueryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("per_page", "10");
    if (activeStatus !== "all") params.set("status", activeStatus);
    if (effectiveStoreId) params.set("store_id", effectiveStoreId);
    if (selectedSectionId && selectedSectionId !== "other") params.set("section_id", selectedSectionId);
    if (searchQuery) params.set("name", searchQuery);
    return params;
  }, [effectiveStoreId, selectedSectionId, activeStatus, searchQuery, currentPage]);

  const { data: productsData, isLoading: isLoadingProducts } = useGetProducts(productsQueryParams, {
    enabled: isProductsEnabled,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const products = productsData?.data || [];
  const totalPages = Math.ceil((productsData?.recordsFiltered || 0) / 10);

  // --- Mutations ---
  const { mutate: updateStatusMutation } = useUpdateProductStatus();
  const { mutate: updateShown } = useUpdateProductShown();
  const { mutate: deleteProduct } = useDeleteProduct();
  const createSection = useCreateSection();

  const handleToggleStatus = (product: Product) => {
    const newStatus = product.status === "active" ? "not-active" : "active";
    updateStatusMutation({ id: product.id, payload: { status: newStatus } });
  };

  const handleToggleShown = (product: Product) => {
    updateShown({ id: product.id, payload: { shown: !product.shown } });
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product.id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete);
      setDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const handleEditClick = (product: Product) => {
    router.push(`${navPrefix}/products/${product.id}/edit`);
  };

  const handleViewClick = (product: Product) => {
    const currentPage = propStoreId
      ? `${navPrefix}/productProviders/${propStoreId}`
      : `${navPrefix}/products`;
    router.push(`${navPrefix}/products/${product.id}/view?from=${encodeURIComponent(currentPage)}`);
  };

  const handleSaveSection = (data: SectionFormData) => {
    if (!effectiveStoreId) return;
    createSection.mutate({
      payload: {
        name: data.name,
        status: data.isActive ? "active" : "not-active",
        store_id: Number(effectiveStoreId),
      },
      storeId: Number(effectiveStoreId),
    }, {
      onSuccess: () => setIsSectionModalOpen(false),
    });
  };

  // Merchant with no store
  if (!effectiveStoreId && isMerchant) {
    return (
      <div className="p-6 h-screen flex items-center justify-center">
        <StoreEmptyState
          title="يجب إنشاء متجر أولاً"
          description="لإضافة المنتجات، يجب أن تمتلك متجراً واحداً على الأقل."
        />
      </div>
    );
  }

  const sectionOptions = [
    ...sections.map((s) => ({ name: s.name, value: String(s.id) })),
    { name: "الكل", value: "other" },
  ];

  // ── Breadcrumb for admin viewing a store ──
  const breadcrumbItems = [
    { label: "مقدمي المنتجات", href: "/admin/productProviders" },
    { label: store ? `${store.owner?.first_name} ${store.owner?.last_name}` : "..." },
  ];

  // ── Merchant: add product button ──
  const merchantAddHref = merchantStoreId
    ? `${navPrefix}/products/add${selectedSectionId && selectedSectionId !== "other" ? `?section_id=${selectedSectionId}` : ""}`
    : `${navPrefix}/products/add`;

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">

      {/* ── Header ── */}
      {isAdminViewingStore ? (
        <>
          <Breadcrumb items={breadcrumbItems} className="bg-white px-6" />
          <header className="p-4 pb-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border border-gray-100 shadow-sm">
                  <AvatarImage src={store?.owner?.avatar_url || undefined} />
                  <AvatarFallback>{store?.owner?.first_name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl text-blue-3 font-medium mb-1">
                    {store ? `${store.owner?.first_name} ${store.owner?.last_name}` : "جاري التحميل..."}
                  </h1>
                  <p className="text-sm text-gray-2 font-medium">{totalProductsCount} منتج</p>
                </div>
              </div>
              <div className="flex flex-row gap-2">
                <Link href={`/admin/products/add?store_id=${propStoreId}`}>
                  <Button className="bg-blue-3 text-white px-6 gap-2">
                    <Plus className="w-5 h-5" />
                    أضف منتجاً جديداً
                  </Button>
                </Link>
                <Link href={`/admin/reports/${propStoreId}?type=product`}>
                  <Button className="bg-red-2 text-red-1 px-6 gap-2">الإبلاغات</Button>
                </Link>
              </div>
            </div>
          </header>
        </>
      ) : isMerchant ? (
        <header className="w-full bg-transparent p-6 pb-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-brand-black-1">إدارة المنتجات</h1>
              <p className="text-sm text-gray-2 mt-1">عرض وإدارة جميع منتجاتك</p>
            </div>
            {!isLoadingSections && hasSections ? (
              <Link
                href={merchantAddHref}
                className="flex text-sm items-center gap-2 cursor-pointer px-2 sm:px-6 py-2 text-white rounded-xs font-medium transition-colors"
                style={{ backgroundColor: "var(--blue-3)" }}
              >
                <Plus className="sm:w-5 sm:h-5 w-4 h-4" />
                منتج جديد
              </Link>
            ) : !isLoadingSections && !hasSections ? (
              <Link
                href={`${navPrefix}/sections`}
                className="flex text-sm items-center gap-2 cursor-pointer px-2 sm:px-6 py-2 text-white rounded-xs font-medium transition-colors"
                style={{ backgroundColor: "var(--blue-3)" }}
              >
                <Plus className="sm:w-5 sm:h-5 w-4 h-4" />
                إضافة قسم
              </Link>
            ) : null}
          </div>
        </header>
      ) : null}

      {/* ── Main ── */}
      <main className="flex-1 p-4">
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

        {isMerchant && !isLoadingSections && !hasSections ? (
          <ProductEmptyState type="no-sections" />
        ) : (
          <div className="grid grid-cols-12 gap-6 items-start">

            {/* Sections sidebar (merchant or admin-viewing-store) */}
            {!isLoadingSections && sections.length > 0 && (
              <div className="col-span-12 lg:col-span-3 h-full flex flex-col">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
                  {/* All products row */}
                  <button
                    onClick={() => { setSelectedSectionId(null); setCurrentPage(1); }}
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
                        onClick={() => { setSelectedSectionId(String(section.id)); setCurrentPage(1); if (window.innerWidth < 1024) detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
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

                  <div className="p-3 border-t border-gray-100">
                    <Button
                      onClick={() => setIsSectionModalOpen(true)}
                      className="w-full gap-2 text-blue-3 border-blue-3 rounded-xs border text-base"
                      style={{ backgroundColor: "var(--blue-5)" }}
                    >
                      <Plus className="w-4 h-4" />
                      إضافة أقسام جديدة
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Main content */}
            <div
              ref={detailsRef}
              className={`col-span-12 ${sections.length > 0 ? "lg:col-span-9" : "lg:col-span-12"} bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col`}
            >
              {/* Status tabs */}
              <div className="flex items-center gap-8 px-6 pt-4 border-b border-gray-100">
                {statusTabs.map((tab) => (
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
                      {getCountForStatus(tab.key)}
                    </span>
                  </button>
                ))}
              </div>

              {!isLoadingProducts && products.length === 0 ? (
                <ProductEmptyState type="no-products" />
              ) : (
                <ProductTable
                  products={products}
                  isLoading={isLoadingProducts}
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
        )}
      </main>

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="هل أنت متأكد من حذف هذا المنتج؟"
        description="لا يمكن التراجع عن هذا الإجراء"
      />

      <SectionModal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        onSave={handleSaveSection}
        mode="add"
      />
    </div>
  );
}
