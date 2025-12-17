// src/features/(dashboard)/products/components/ProductsPage.tsx
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { Plus, Loader2, Store } from "lucide-react";
import {
  useGetProducts,
  useUpdateProductStatus,
  useDeleteProduct,
  useUpdateProductShown
} from "../hooks";
import { useGetSections } from "../../sections/hooks";
import { useGetStores } from "../../stores/hooks";
import { useAuthStore } from "@/src/stores/auth-store";
import { Product } from "../api";
import { SidebarFilterPanel } from "@/src/components/(dashboard)/SidebarFilterPanel";
import { ProductEmptyState } from "./ProductEmptyState";
import { ProductTable } from "./ProductTable";
import { cn } from "@/src/lib/utils";
import { useRouter } from "next/navigation";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";

const adminFilterOptions = [
  { name: "الكل", value: "all" },
  { name: "مفعل", value: "active" },
  { name: "غير مفعل", value: "not-active" },
];

export function ProductsPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.user_type === "admin";
  const isMerchant = user?.user_type === "merchant";

  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    if (isMerchant) {
      const savedStoreId = Cookies.get("current_store_id");
      if (savedStoreId) {
        setStoreId(savedStoreId);
      }
    }
  }, [isMerchant]);

  // --- States ---
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const detailsRef = useRef<HTMLDivElement>(null);

  // --- Data Fetching ---
  const { data: storesData, isLoading: isLoadingStores } = useGetStores(
    new URLSearchParams("per_page=100"),
    { enabled: isAdmin && isMounted }
  );

  const sectionsQueryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("per_page", "100");
    return params;
  }, []);

  const { data: sectionsData, isLoading: isLoadingSections } = useGetSections(
    sectionsQueryParams,
    storeId || undefined,
    { enabled: !!storeId && isMerchant && isMounted }
  );

  const sections = sectionsData?.data || [];
  const hasSections = (sectionsData?.recordsTotal || 0) > 0;

  // Auto-select first section for Merchant
  useEffect(() => {
    if (isMerchant && sections.length > 0 && !selectedSectionId) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setSelectedSectionId(String(sections[0].id));
    }
  }, [isMerchant, sections, selectedSectionId]);

  const productsQueryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("per_page", "10");

    if (isAdmin && statusFilter !== "all") {
      params.set("status", statusFilter);
    }

    if (isMerchant) {
      if (storeId) params.set("store_id", storeId);
      if (selectedSectionId) params.set("section_id", selectedSectionId);
    }

    if (searchQuery) {
      params.set("name", searchQuery);
    }

    return params;
  }, [storeId, selectedSectionId, statusFilter, searchQuery, isAdmin, isMerchant, currentPage]);

  const isProductsEnabled = isAdmin || (isMerchant && !!selectedSectionId);

  const {
    data: productsData,
    isLoading: isLoadingProducts,
  } = useGetProducts(productsQueryParams, {
    enabled: isProductsEnabled && isMounted,
  });

  const products = productsData?.data || [];
  const totalPages = Math.ceil((productsData?.recordsFiltered || 0) / 10);

  // --- Mutations ---
  const { mutate: updateStatusMutation } = useUpdateProductStatus();
  const { mutate: updateShown } = useUpdateProductShown();
  const { mutate: deleteProduct } = useDeleteProduct();

  // --- Handlers ---
  const handleAdminFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

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

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-3" />
      </div>
    );
  }

  if (isMerchant && !storeId) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-blue-4" />
          </div>
          <h2 className="text-xl font-bold mb-2">لم يتم اختيار متجر</h2>
          <p className="text-gray-500 mb-6">
            يرجى اختيار المتجر الذي تريد إدارة منتجاته من القائمة العلوية.
          </p>
        </div>
      </div>
    );
  }

  const isNoSectionsEmptyState = isMerchant && !isLoadingSections && !hasSections;
  const isNoProductsEmptyState = isMerchant && selectedSectionId && !isLoadingProducts && products.length === 0;

  const merchantSectionOptions = sections.map((s) => ({
    name: s.name,
    value: String(s.id),
  }));

  return (
    <div className="bg-gray-50 h-full lg:h-[calc(100vh-80px)] flex flex-col">
      {/* Header Updated to Match CitiesPage Style */}
      <header className="w-full bg-transparent p-6 pb-0">
        <div className="flex flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl sm:text-2xl font-bold text-brand-black-1">
              إدارة المنتجات
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              عرض وإدارة جميع المنتجات المتاحة
            </p>
          </div>
          {renderHeaderAction()}
        </div>
      </header>

      <main className="flex-1 p-6 min-h-[calc(100vh-145px)] overflow-hidden">
        {isNoSectionsEmptyState ? (
          <ProductEmptyState type="no-sections" />
        ) : (
          <div className="grid grid-cols-12 gap-4 h-full">
            <div className="col-span-12 lg:col-span-3 h-full order-1 lg:order-1 flex flex-col">
              {isAdmin ? (
                <SidebarFilterPanel
                  options={adminFilterOptions}
                  activeValue={statusFilter}
                  onValueChange={handleAdminFilterChange}
                  className="h-full border border-gray-200 rounded-lg"
                />
              ) : (
                <SidebarFilterPanel
                  options={merchantSectionOptions}
                  activeValue={selectedSectionId || ""}
                  onValueChange={handleMerchantSectionChange}
                  className="h-full border border-gray-200 rounded-lg"
                />
              )}
            </div>

            <div
              className="col-span-12 lg:col-span-9 h-full order-2 lg:order-2 overflow-y-auto"
              ref={detailsRef}
            >
              {isMerchant && !selectedSectionId ? (
                <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col items-center justify-center shadow-sm p-8">
                  <div className="h-44 mx-auto mb-2 flex items-center justify-center">
                    <img
                      src="/icons/dashboard/nostore.svg"
                      className="h-44"
                      alt="placeholder"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-2">لم يتم اختيار قسم</h3>
                  <p className="text-gray-400 text-sm">
                    قم باختيار قسم من القائمة الجانبية لعرض المنتجات الخاصة به
                  </p>
                </div>
              ) : isNoProductsEmptyState ? (
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
                  onToggleStatus={handleToggleStatus}
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
    </div>
  );
}