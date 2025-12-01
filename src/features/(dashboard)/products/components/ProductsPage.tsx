// src/features/(dashboard)/products/components/ProductsPage.tsx
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { Plus, Loader2, Store } from "lucide-react";
import { useGetProducts, useUpdateProductStatus, useDeleteProduct } from "../hooks";
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

// خيارات الفلتر للأدمن
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

  // --- Page Mode (Products vs Services) ---
  const [pageMode, setPageMode] = useState<"product" | "service">("product");

  // --- Store ID Logic ---
  const [storeId, setStoreId] = useState<string | null>(null);

  // Initial Mount & Store Sync Logic
  useEffect(() => {
    setIsMounted(true);

    // للتاجر: جلب الـ ID من الكوكيز عند التحميل
    if (isMerchant) {
      const savedStoreId = Cookies.get("current_store_id");
      if (savedStoreId) {
        setStoreId(savedStoreId);
      }
    }
  }, [isMerchant]);

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const detailsRef = useRef<HTMLDivElement>(null);

  // --- 1. Fetch Stores (Admin Only) ---
  const { data: storesData, isLoading: isLoadingStores } = useGetStores(
    new URLSearchParams("per_page=100"),
    { enabled: isAdmin && isMounted }
  );

  const stores = storesData?.data || [];

  // --- 2. Fetch Sections (Merchant Only) ---
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

  // --- 3. Fetch Products ---
  const productsQueryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("per_page", "10");

    // منطق الأدمن: الفلترة حسب الحالة (بدون store_id)
    if (isAdmin) {
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }
    }

    // منطق التاجر: الفلترة حسب المتجر والقسم
    if (isMerchant) {
      if (storeId) {
        params.set("store_id", storeId);
      }
      if (selectedSectionId) {
        params.set("section_id", selectedSectionId);
      }
    }

    // البحث (مشترك)
    if (searchQuery) {
      params.set("name", searchQuery);
    }

    return params;
  }, [storeId, selectedSectionId, statusFilter, searchQuery, isAdmin, isMerchant, currentPage]);

  // التحكم في تفعيل جلب المنتجات
  // للأدمن: دائماً مفعل
  // للتاجر: مفعل فقط إذا اختار قسماً
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
  const { mutate: updateStatus } = useUpdateProductStatus();
  const { mutate: deleteProduct } = useDeleteProduct();

  // --- Handlers ---

  const handleAdminFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleMerchantSectionChange = (value: string) => {
    setSelectedSectionId(value);
    setCurrentPage(1);
    if (window.innerWidth < 1024) {
      detailsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleToggleStatus = (product: Product) => {
    const newStatus = product.status === "active" ? "not-active" : "active";
    updateStatus({ id: product.id, payload: { status: newStatus } });
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
    router.push(`/dashboard/products/${product.id}/edit`);
  };

  // --- Header Action Button Logic ---
  const renderHeaderAction = () => {
    if (pageMode === "service") {
      return (
        <Link
          href="/dashboard/services/add"
          className="flex items-center gap-2 px-4 py-2 bg-blue-3 rounded-sm text-white text-sm font-semibold cursor-pointer hover:bg-[#2d4460] transition-colors"
        >
          <Plus className="w-5 h-5" />
          خدمة جديدة
        </Link>
      );
    }

    // Product Mode Logic
    if (isMerchant && !isLoadingSections && !hasSections) {
      return (
        <Link
          href="/dashboard/sections"
          className="flex items-center gap-2 px-4 py-2 bg-blue-3 rounded-sm text-white text-sm font-semibold cursor-pointer hover:bg-[#2d4460] transition-colors"
        >
          <Plus className="w-5 h-5" />
          إضافة قسم
        </Link>
      );
    }

    const showAddProduct =
      isAdmin || (isMerchant && hasSections && selectedSectionId);

    if (showAddProduct) {
      const href = isAdmin
        ? "/dashboard/products/add"
        : `/dashboard/products/add?section_id=${selectedSectionId}`;

      return (
        <Link
          href={href}
          className="flex items-center gap-2 px-4 py-2 bg-blue-3 rounded-sm text-white text-sm font-semibold cursor-pointer hover:bg-[#2d4460] transition-colors"
        >
          <Plus className="w-5 h-5" />
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

  // حالة التاجر: لم يتم اختيار متجر
  if (isMerchant && !storeId) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-blue-4" />
          </div>
          <h2 className="text-xl font-bold  mb-2">
            لم يتم اختيار متجر
          </h2>
          <p className="text-gray-500 mb-6">
            يرجى اختيار المتجر الذي تريد إدارة منتجاته من القائمة العلوية.
          </p>
        </div>
      </div>
    );
  }

  // حساب الحالات الفارغة للتاجر
  const isNoSectionsEmptyState = isMerchant && !isLoadingSections && !hasSections;
  const isNoProductsEmptyState =
    isMerchant &&
    selectedSectionId &&
    !isLoadingProducts &&
    products.length === 0;

  // تحضير خيارات الفلتر للتاجر (الأقسام)
  const merchantSectionOptions = sections.map((s) => ({
    name: s.name,
    value: String(s.id),
  }));

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
        {pageMode === "service" ? (
          // --- Service Mode Placeholder ---
          <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg border border-gray-200 p-8 text-center shadow-sm">
            <div className="h-32 w-32 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Store className="h-16 w-16 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold  mb-2">
              إدارة الخدمات
            </h3>
            <p className="text-gray-500">سيتم عرض الخدمات هنا قريباً.</p>
          </div>
        ) : isNoSectionsEmptyState ? (
          // --- Merchant: No Sections ---
          <ProductEmptyState type="no-sections" />
        ) : (
          // --- Product Mode: Main Content ---
          <div className="grid grid-cols-12 gap-4 h-full">
            {/* --- SIDEBAR --- */}
            <div className="col-span-12 lg:col-span-3 h-full order-1 lg:order-1 flex flex-col">
              {isAdmin ? (
                // Admin Sidebar: Status Filter
                <SidebarFilterPanel
                  options={adminFilterOptions}
                  activeValue={statusFilter}
                  onValueChange={handleAdminFilterChange}
                  className="h-full border border-gray-200 rounded-lg"
                />
              ) : (
                // Merchant Sidebar: Sections List
                <SidebarFilterPanel
                  options={merchantSectionOptions}
                  activeValue={selectedSectionId || ""}
                  onValueChange={handleMerchantSectionChange}
                  className="h-full border border-gray-200 rounded-lg"
                />
              )}
            </div>

            {/* --- PRODUCTS TABLE --- */}
            <div
              className="col-span-12 lg:col-span-9 h-full order-2 lg:order-2 overflow-y-auto"
              ref={detailsRef}
            >
              {isMerchant && !selectedSectionId ? (
                // Merchant: No Section Selected
                <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col items-center justify-center shadow-sm p-8">
                  <div className="h-44 mx-auto mb-2 flex items-center justify-center">
                    <img
                      src="/icons/dashboard/nostore.svg"
                      className="h-44"
                      alt="placeholder"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-2 ">
                    لم يتم اختيار قسم
                  </h3>
                  <p className="text-gray-3 text-sm">
                    قم باختيار قسم من القائمة الجانبية لعرض المنتجات الخاصة به
                  </p>
                </div>
              ) : isNoProductsEmptyState ? (
                // Merchant: Section Selected but No Products
                <ProductEmptyState type="no-products" />
              ) : (
                // Display Product Table
                <ProductTable 
                  products={products}
                  isLoading={isLoadingProducts}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  onToggleStatus={handleToggleStatus}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
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