// src/features/(dashboard)/products/components/ProductsPage.tsx
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { Plus, Loader2, Store, ChevronRight } from "lucide-react";
import {
  useGetProducts,
  useUpdateProductStatus,
  useDeleteProduct,
  useUpdateProductShown
} from "../hooks";
import { MerchantProductStatus } from "../api";
import { useGetSections } from "../../sections/hooks";
import { useGetStores } from "../../stores/hooks";
import { useAuthStore } from "@/src/stores/auth-store";
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



export function ProductsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  // Read user_type and storeId directly from cookies (available on first render)
  const userTypeCookie = Cookies.get("user_type");
  const isAdmin = userTypeCookie === "admin";
  const isMerchant = userTypeCookie === "merchant";
  const storeId = isMerchant ? (Cookies.get("current_store_id") ?? null) : null;

  // --- States ---
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedAdminStoreId, setSelectedAdminStoreId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState<MerchantProductStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);

  const detailsRef = useRef<HTMLDivElement>(null);

  // --- Data Fetching ---
  const { data: storesData, isLoading: isLoadingStores } = useGetStores(
    new URLSearchParams("per_page=100"),
    { enabled: isAdmin  }
  );

  const sectionsQueryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("per_page", "100");
    return params;
  }, []);

  const { data: sectionsData, isLoading: isLoadingSections } = useGetSections(
    sectionsQueryParams,
    storeId || undefined,
    { enabled: !!storeId && isMerchant  }
  );

  const sections = useMemo(() => sectionsData?.data || [], [sectionsData?.data]);
  const hasSections = (sectionsData?.recordsTotal || 0) > 0;

  useEffect(() => {
    if (isMerchant && sectionsData && !selectedSectionId) {
      setSelectedSectionId("all");
    }
  }, [isMerchant, sectionsData, selectedSectionId]);

  // --- Status count queries (admin + merchant) ---
  const isProductsEnabled = isAdmin || (isMerchant && !!storeId);

  // For admin: use selectedAdminStoreId; for merchant: use storeId
  const effectiveStoreId = isAdmin ? selectedAdminStoreId : storeId;

  const activeCountParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("status", "active");
    params.set("per_page", "1");
    if (effectiveStoreId) params.set("store_id", effectiveStoreId);
    if (selectedSectionId && selectedSectionId !== "all" && selectedSectionId !== "other") params.set("section_id", selectedSectionId);
    if (searchQuery) params.set("name", searchQuery);
    return params;
  }, [effectiveStoreId, selectedSectionId, searchQuery]);

  const notActiveCountParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("status", "not-active");
    params.set("per_page", "1");
    if (effectiveStoreId) params.set("store_id", effectiveStoreId);
    if (selectedSectionId && selectedSectionId !== "all" && selectedSectionId !== "other") params.set("section_id", selectedSectionId);
    if (searchQuery) params.set("name", searchQuery);
    return params;
  }, [effectiveStoreId, selectedSectionId, searchQuery]);

  const rejectedCountParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("status", "rejected");
    params.set("per_page", "1");
    if (effectiveStoreId) params.set("store_id", effectiveStoreId);
    if (selectedSectionId && selectedSectionId !== "all" && selectedSectionId !== "other") params.set("section_id", selectedSectionId);
    if (searchQuery) params.set("name", searchQuery);
    return params;
  }, [effectiveStoreId, selectedSectionId, searchQuery]);

  const { data: activeCountData } = useGetProducts(activeCountParams, { enabled: isProductsEnabled });
  const { data: notActiveCountData } = useGetProducts(notActiveCountParams, { enabled: isProductsEnabled });
  const { data: rejectedCountData } = useGetProducts(rejectedCountParams, { enabled: isProductsEnabled });

  // Total count (for sidebar)
  const totalCountParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("per_page", "1");
    if (effectiveStoreId) params.set("store_id", effectiveStoreId);
    return params;
  }, [effectiveStoreId]);
  const { data: totalCountData } = useGetProducts(totalCountParams, { enabled: isProductsEnabled });

  const getCountForStatus = (key: MerchantProductStatus) => {
    switch (key) {
      case "active": return activeCountData?.recordsFiltered || 0;
      case "not-active": return notActiveCountData?.recordsFiltered || 0;
      case "rejected": return rejectedCountData?.recordsFiltered || 0;
      default: return 0;
    }
  };

  const statusTabs: { key: MerchantProductStatus; label: string; activeClass: string; activeTextClass: string; badgeClass: string }[] = [
    {
      key: "active",
      label: "تمت الموافقة عليه",
      activeClass: "border-emerald-500 text-emerald-500",
      activeTextClass: "text-emerald-500",
      badgeClass: "bg-emerald-500",
    },
    {
      key: "not-active",
      label: "قيد المراجعة",
      activeClass: "border-amber-400 text-amber-400",
      activeTextClass: "text-amber-400",
      badgeClass: "bg-amber-400",
    },
    {
      key: "rejected",
      label: "مرفوض",
      activeClass: "border-red-500 text-red-500",
      activeTextClass: "text-red-500",
      badgeClass: "bg-red-500",
    },
  ];

  const productsQueryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("per_page", "10");
    if (activeStatus !== "all") params.set("status", activeStatus);

    if (effectiveStoreId) params.set("store_id", effectiveStoreId);
    if (selectedSectionId && selectedSectionId !== "all" && selectedSectionId !== "other") params.set("section_id", selectedSectionId);
    if (searchQuery) params.set("name", searchQuery);

    return params;
  }, [effectiveStoreId, selectedSectionId, activeStatus, searchQuery, currentPage]);

  const {
    data: productsData,
    isLoading: isLoadingProducts,
  } = useGetProducts(productsQueryParams, {
    enabled: isProductsEnabled ,
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
    updateStatusMutation({
      id: product.id,
      payload: { status: newStatus }
    });
  };

  const handleMerchantSectionChange = (value: string) => {
    setSelectedSectionId(value);
    setCurrentPage(1);
    if (window.innerWidth < 1024) {
      detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleToggleShown = (product: Product) => {
    const newShown = !product.shown;
    updateShown({ id: product.id, payload: { shown: newShown } });
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
    router.push(`/admin/products/${product.id}/edit`);
  };

  const handleViewClick = (product: Product) => {
    router.push(`/admin/products/${product.id}/view`);
  };

  const handleSaveSection = (data: SectionFormData) => {
    if (!storeId) return;
    createSection.mutate({
      payload: {
        name: data.name,
        status: data.isActive ? "active" : "not-active",
        store_id: Number(storeId)
      },
      storeId: Number(storeId)
    }, {
      onSuccess: () => {
        setIsSectionModalOpen(false);
      }
    });
  };

  const renderHeaderAction = () => {
    if (isMerchant && !isLoadingSections && !hasSections) {
      return (
        <Link
          href="/admin/sections"
          className="flex text-sm items-center gap-2 cursor-pointer px-2 sm:px-6 py-2 text-white rounded-xs font-medium transition-colors"
          style={{ backgroundColor: "var(--blue-3)" }}
        >
          <Plus className="sm:w-5 sm:h-5 w-4 h-4" />
          إضافة قسم
        </Link>
      );
    }

    const showAddProduct = isAdmin || (isMerchant && hasSections && selectedSectionId);

    if (showAddProduct) {
      const href = isAdmin
        ? "/admin/products/add"
        : `/admin/products/add?section_id=${selectedSectionId}`;

      return (
        <Link
          href={href}
          className="flex text-sm items-center gap-2 cursor-pointer px-2 sm:px-6 py-2 text-white rounded-xs font-medium transition-colors"
          style={{ backgroundColor: "var(--blue-3)" }}
        >
          <Plus className="sm:w-5 sm:h-5 w-4 h-4" />
          منتج جديد
        </Link>
      );
    }

    return null;
  };

  if (!storeId && isMerchant) {
    return (
      <div className="p-6 h-screen flex items-center justify-center">
        <StoreEmptyState
          title="يجب إنشاء متجر أولاً"
          description="لإضافة المنتجات، يجب أن تمتلك متجراً واحداً على الأقل."
        />
      </div>
    );
  }


  const isNoSectionsEmptyState = isMerchant && !isLoadingSections && !hasSections;
  const isNoProductsEmptyState = isMerchant && !isLoadingProducts && products.length === 0;
  const totalProductsCount = totalCountData?.recordsFiltered || 0;

  return (
    <div className="bg-gray-50 h-full lg:h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <header className="w-full bg-transparent p-6 pb-0">
        <div className="flex flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl sm:text-2xl font-bold text-brand-black-1">
              إدارة المنتجات
            </h1>
            <p className="text-sm text-gray-2 mt-1">
              عرض وإدارة جميع المنتجات المتاحة
            </p>
          </div>
          {renderHeaderAction()}
        </div>
      </header>

      <main className="flex-1 p-6">
        {isNoSectionsEmptyState ? (
          <ProductEmptyState type="no-sections" />
        ) : (
          <div className="grid grid-cols-12 gap-6 items-start">

            {/* ── Sidebar (RIGHT in RTL = first col) ── */}
            {!isLoadingSections && sections.length > 0 && (
              <div className="col-span-12 lg:col-span-3 flex flex-col">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">

                  {/* "جميع المنتجات" row */}
                  <button
                    onClick={() => { setSelectedSectionId("all"); setCurrentPage(1); }}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 transition-colors cursor-pointer",
                      selectedSectionId === "all" || !selectedSectionId
                        ? "bg-blue-5 text-blue-3 font-semibold"
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <span className="flex-1 text-right text-sm mx-2">
                      جميع المنتجات
                      <span className={cn(
                        "mr-1 text-xs font-bold",
                        (selectedSectionId === "all" || !selectedSectionId) ? "text-blue-3" : "text-gray-400"
                      )}>
                        ({totalProductsCount})
                      </span>
                    </span>
                    <ChevronRight className={cn(
                      "w-4 h-4 flex-shrink-0 transition-transform rotate-180",
                      (selectedSectionId === "all" || !selectedSectionId) ? "text-blue-3" : "text-gray-400"
                    )} />
                  </button>

                  {/* Section rows */}
                  {sections.map((section) => {
                    const isActive = selectedSectionId === String(section.id);
                    return (
                      <button
                        key={section.id}
                        onClick={() => { handleMerchantSectionChange(String(section.id)); }}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-3 border-t border-gray-100 transition-colors cursor-pointer",
                          isActive ? "bg-blue-5 text-blue-3 font-semibold" : "text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        <span className="flex-1 text-right text-sm mx-2 ">{section.name}</span>
                        <ChevronRight className={cn(
                          "w-4 h-4 flex-shrink-0 rotate-180",
                          isActive ? "text-blue-3" : "text-gray-400"
                        )} />
                      </button>
                    );
                  })}

                  {/* Add section */}
                  <div className="p-3 border-t border-gray-100">
                    <Button
                      onClick={() => setIsSectionModalOpen(true)}
                      className="w-full gap-2 text-blue-3 border-blue-3 rounded-xs border text-sm"
                      style={{ backgroundColor: "var(--blue-5)" }}
                    >
                      <Plus className="w-4 h-4" />
                      إضافة أقسام جديدة
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Admin sidebar ── */}
            {isAdmin && (
              <div className="col-span-12 lg:col-span-3 flex flex-col">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">

                  {/* "جميع المنتجات" row */}
                  <button
                    onClick={() => {
                      setSelectedAdminStoreId(null);
                      setActiveStatus("all");
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 transition-colors cursor-pointer",
                      !selectedAdminStoreId
                        ? "bg-blue-5 text-blue-3 font-semibold"
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <span className="flex-1 text-right text-sm mx-2">
                      جميع المنتجات
                      <span className={cn(
                        "mr-1 text-xs font-bold",
                        !selectedAdminStoreId ? "text-blue-3" : "text-gray-400"
                      )}>
                        ({totalProductsCount})
                      </span>
                    </span>
                    <ChevronRight className={cn(
                      "w-4 h-4 flex-shrink-0 rotate-180",
                      !selectedAdminStoreId ? "text-blue-3" : "text-gray-400"
                    )} />
                  </button>

                  {/* Store rows */}
                  {isLoadingStores ? (
                    <div className="flex justify-center py-4 border-t border-gray-100">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    (storesData?.data || []).map((store) => {
                      const storeIdStr = String(store.id);
                      const isActive = selectedAdminStoreId === storeIdStr;
                      return (
                        <button
                          key={store.id}
                          onClick={() => {
                            setSelectedAdminStoreId(storeIdStr);
                            setActiveStatus("active");
                            setCurrentPage(1);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-4 py-3 border-t border-gray-100 transition-colors cursor-pointer",
                            isActive ? "bg-blue-5 text-blue-3 font-semibold" : "text-gray-600 hover:bg-gray-50"
                          )}
                        >
                          <span className="flex-1 text-right text-sm mx-2">{store.name}</span>
                          <ChevronRight className={cn(
                            "w-4 h-4 flex-shrink-0 rotate-180",
                            isActive ? "text-blue-3" : "text-gray-400"
                          )} />
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* ── Main content ── */}
            <div
              className={`col-span-12 ${(!isLoadingSections && sections.length > 0) || isAdmin ? "lg:col-span-9" : "lg:col-span-12"} bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col`}
              ref={detailsRef}
            >
              {/* Status Tabs — merchant and admin */}
              {(isMerchant || isAdmin) && (
                <div className="flex items-center gap-8 px-6 pt-4 border-b border-gray-100">
                  {statusTabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => { setActiveStatus(tab.key); setCurrentPage(1); }}
                      className={`flex cursor-pointer items-center gap-2 pb-3 border-b-[3px] transition-all duration-200 ${
                        activeStatus === tab.key
                          ? tab.activeClass
                          : "border-transparent text-gray-2 hover:text-gray-2"
                      }`}
                    >
                      <span className="font-bold text-sm">{tab.label}</span>
                      <span className={`flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded text-xs font-bold text-white ${
                        activeStatus === tab.key ? tab.badgeClass : "bg-gray-2"
                      }`}>
                        {getCountForStatus(tab.key)}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Table or empty */}
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