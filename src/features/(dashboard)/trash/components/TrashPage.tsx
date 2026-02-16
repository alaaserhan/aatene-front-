"use client";

import { useState, useMemo, useCallback } from "react";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/src/hooks/use-language";
import { SidebarFilterPanel } from "@/src/components/(dashboard)/SidebarFilterPanel";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { TrashTable } from "./TrashTable";
import { TrashBulkActions } from "./TrashBulkActions";
import { Input } from "@/src/components/ui/input";
import {
  useGetTrashedItems,
  useRestoreItem,
  useForceDeleteItem,
  useBulkRestore,
  useBulkForceDelete,
} from "../hooks";
import { useGetAttributes } from "@/src/features/(dashboard)/categoriesAndAttributes/hooks";
import type { TrashedItem } from "../types";
import { Button } from "@/src/components/ui/button";

// للمعاينة فقط - غيّر إلى false عند توفر الباك إند
const USE_FAKE_DATA = true;

// بيانات تجريبية للعرض
const FAKE_TRASH_ITEMS: Record<string, TrashedItem[]> = {
  all: [
    { id: 1, name: "الأزياء", shown: true, category_name: "المنتجات" },
    { id: 2, name: "الإلكترونيات", shown: true, category_name: "المنتجات" },
    { id: 3, name: "المنزل والمطبخ", shown: false, category_name: "المنتجات" },
    { id: 4, name: "الرعاية والصحة", shown: true, category_name: "الخدمات" },
    { id: 5, name: "المنزل والحديقة", shown: true, category_name: "المنتجات" },
    { id: 6, name: "أحمد محمد", shown: true, category_name: "المستخدمين" },
    { id: 7, name: "الصحة والجمال", shown: true, category_name: "الخدمات" },
    { id: 8, name: "الديكور", shown: true, category_name: "المتاجر" },
    { id: 9, name: "الأثاث", shown: true, category_name: "المنتجات" },
  ],
  users: [
    { id: 6, name: "أحمد محمد", shown: true, category_name: "المستخدمين" },
    { id: 10, name: "سارة خالد", shown: true, category_name: "المستخدمين" },
    { id: 11, name: "محمد علي", shown: false, category_name: "المستخدمين" },
  ],
  stores: [
    { id: 8, name: "الديكور", shown: true, category_name: "المتاجر" },
    { id: 12, name: "متجر الأناقة", shown: true, category_name: "المتاجر" },
  ],
  products: [
    { id: 1, name: "الأزياء", shown: true, category_name: "المنتجات" },
    { id: 2, name: "الإلكترونيات", shown: true, category_name: "المنتجات" },
    { id: 3, name: "المنزل والمطبخ", shown: false, category_name: "المنتجات" },
    { id: 5, name: "المنزل والحديقة", shown: true, category_name: "المنتجات" },
    { id: 9, name: "الأثاث", shown: true, category_name: "المنتجات" },
  ],
  services: [
    { id: 4, name: "الرعاية والصحة", shown: true, category_name: "الخدمات" },
    { id: 7, name: "الصحة والجمال", shown: true, category_name: "الخدمات" },
  ],
  attributes: [
    { id: 20, name: "اللون", shown: true, category_name: "السمات" },
    { id: 21, name: "المقاس", shown: true, category_name: "السمات" },
    { id: 22, name: "الخامة", shown: false, category_name: "السمات" },
    { id: 23, name: "الوزن", shown: true, category_name: "السمات" },
  ],
};

const SIDEBAR_CATEGORIES = [
  { name: "الكل", value: "all" },
  { name: "المستخدمين", value: "users" },
  { name: "المتاجر", value: "stores" },
  { name: "المنتجات", value: "products" },
  { name: "الخدمات", value: "services" },
  { name: "السمات", value: "attributes" },
];

export function TrashPage() {
  const lang = useLanguage();

  // حالة الفلاتر والبحث
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // حالة نافذة التأكيد
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"delete" | "bulk-delete">(
    "delete"
  );
  const [targetId, setTargetId] = useState<number | null>(null);

  // تتبع حالة التحميل لكل عنصر
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("per_page", "10");
    if (activeCategory !== "all" && activeCategory !== "attributes") {
      params.set("category", activeCategory);
    }
    if (searchQuery) {
      params.set("search", searchQuery);
    }
    return params;
  }, [activeCategory, searchQuery, currentPage]);

  const isAttributesTab = activeCategory === "attributes";

  // جلب العناصر المحذوفة من API
  const { data: itemsData, isLoading: isLoadingItems } =
    useGetTrashedItems(queryParams, { enabled: !USE_FAKE_DATA && !isAttributesTab });

  // السمات لها API مختلف
  const attributesParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("per_page", "10");
    if (searchQuery) {
      params.set("search", searchQuery);
    }
    return params;
  }, [searchQuery, currentPage]);

  const { data: attributesData, isLoading: isLoadingAttributes } =
    useGetAttributes(attributesParams, { enabled: !USE_FAKE_DATA && isAttributesTab });

  const restoreMutation = useRestoreItem();
  const forceDeleteMutation = useForceDeleteItem();
  const bulkRestoreMutation = useBulkRestore();
  const bulkForceDeleteMutation = useBulkForceDelete();

  // تحديد مصدر البيانات حسب الوضع
  const items: TrashedItem[] = useMemo(() => {
    if (USE_FAKE_DATA) {
      return FAKE_TRASH_ITEMS[activeCategory] || FAKE_TRASH_ITEMS.all;
    }
    // معالجة خاصة لتبويب السمات
    if (isAttributesTab) {
      return (attributesData?.data || []).map((attr) => ({
        id: attr.id,
        name: attr.title,
        shown: attr.is_active === true || attr.is_active === "1",
        category_name: "السمات",
      }));
    }
    return itemsData?.data || [];
  }, [USE_FAKE_DATA, activeCategory, isAttributesTab, attributesData, itemsData]);

  const totalPages = USE_FAKE_DATA
    ? 1
    : isAttributesTab
      ? Math.ceil((attributesData?.recordsFiltered || 0) / 10)
      : Math.ceil((itemsData?.recordsFiltered || 0) / 10);

  const isLoading = USE_FAKE_DATA ? false : (isAttributesTab ? isLoadingAttributes : isLoadingItems);

  const handleCategoryChange = (value: string) => {
    setActiveCategory(value);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const handleToggleSelect = useCallback(
    (id: number) => {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    },
    []
  );

  const handleRestore = (id: number) => {
    setRestoringId(id);
    restoreMutation.mutate(id, {
      onSettled: () => {
        setRestoringId(null);
        setSelectedIds((prev) => prev.filter((x) => x !== id));
      },
    });
  };

  const handleForceDelete = (id: number) => {
    setTargetId(id);
    setConfirmAction("delete");
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (confirmAction === "delete" && targetId !== null) {
      setDeletingId(targetId);
      forceDeleteMutation.mutate(targetId, {
        onSettled: () => {
          setDeletingId(null);
          setTargetId(null);
          setSelectedIds((prev) => prev.filter((x) => x !== targetId));
        },
      });
    } else if (confirmAction === "bulk-delete") {
      bulkForceDeleteMutation.mutate(selectedIds, {
        onSettled: () => {
          setSelectedIds([]);
        },
      });
    }
  };

  const handleBulkRestore = () => {
    bulkRestoreMutation.mutate(selectedIds, {
      onSettled: () => setSelectedIds([]),
    });
  };

  const handleBulkForceDelete = () => {
    setConfirmAction("bulk-delete");
    setConfirmOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 sm:px-6 sm:py-4">
        <h1 className="text-xl font-bold text-blue-3">المحذوفات</h1>
        <Link href={`/${lang}/admin/categories`}>
          <Button
            size="sm"
            className="gap-1.5 bg-blue-3 hover:bg-blue-3/90 text-white cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            إضافة فئة للمحذوفات
          </Button>
        </Link>
      </header>

      <main className="flex-1 p-2 sm:p-6 h-[calc(100vh-65px)]">
        <div className="grid grid-cols-12 gap-6 h-full">
          <div className="col-span-12 lg:col-span-2 h-full">
            <SidebarFilterPanel
              options={SIDEBAR_CATEGORIES}
              activeValue={activeCategory}
              onValueChange={handleCategoryChange}
              className="h-full"
            />
          </div>

          <div className="col-span-12 lg:col-span-10 h-full flex flex-col gap-4">
            <div className="relative w-full">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="بحث"
                className="w-full px-4 py-3 ps-12 border border-gray-300 rounded-xs focus:outline-none focus:ring-2 focus:ring-blue-3 focus:border-transparent"
              />
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-2" />
            </div>

            <TrashBulkActions
              selectedCount={selectedIds.length}
              onBulkRestore={handleBulkRestore}
              onBulkForceDelete={handleBulkForceDelete}
              isRestoring={bulkRestoreMutation.isPending}
              isDeleting={bulkForceDeleteMutation.isPending}
            />

            <TrashTable
              items={items}
              isLoading={isLoading}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onRestore={handleRestore}
              onForceDelete={handleForceDelete}
              restoringId={restoringId}
              deletingId={deletingId}
            />
          </div>
        </div>
      </main>

      <ConfirmDeleteModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="هل أنت متأكد من الحذف النهائي؟"
        description="لن تتمكن من استرجاع هذا العنصر بعد الحذف النهائي."
        confirmText="نعم، حذف نهائي"
        cancelText="إلغاء"
      />
    </div>
  );
}
