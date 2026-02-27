"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Search } from "lucide-react";
import { useLanguage } from "@/src/hooks/use-language";
import { SidebarFilterPanel } from "@/src/components/(dashboard)/SidebarFilterPanel";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { TrashTable } from "./TrashTable";
import { TrashBulkActions } from "./TrashBulkActions";
import { Input } from "@/src/components/ui/input";
import {
  useGetTrashOptions,
  useGetTrashedItems,
  useRestoreItem,
  useForceDeleteItem,
} from "../hooks";
import type { TrashedItem } from "../types";
import { toast } from "sonner";

export function TrashPage() {
  const lang = useLanguage();

  const [activeSlug, setActiveSlug] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // نوافذ التأكيد
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"delete" | "bulk-delete" | "restore" | "bulk-restore">(
    "delete"
  );
  const [targetId, setTargetId] = useState<number | null>(null);

  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  // جلب الخيارات المتاحة من الباك إند
  const { data: optionsData } = useGetTrashOptions();

  // تحويل الخيارات لتنسيق الشريط الجانبي
  const sidebarOptions = useMemo(() => {
    return (optionsData?.options || []).map((opt) => ({
      name: opt.name,
      value: opt.slug,
    }));
  }, [optionsData]);

  // تعيين الفئة النشطة الافتراضية (أول فئة من القائمة)
  React.useEffect(() => {
    if (sidebarOptions.length > 0 && !activeSlug) {
      setActiveSlug(sidebarOptions[0].value);
    }
  }, [sidebarOptions, activeSlug]);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("per_page", "15");
    params.set("order_by", "deleted_at");
    params.set("order_dir", "desc");
    if (searchQuery) {
      params.set("search", searchQuery);
    }
    return params;
  }, [searchQuery, currentPage]);

  // جلب العناصر المحذوفة حسب الفئة
  const { data: itemsData, isLoading } = useGetTrashedItems(
    activeSlug,
    queryParams,
    { 
      enabled: !!activeSlug && sidebarOptions.length > 0,
    }
  );

  const restoreMutation = useRestoreItem();
  const forceDeleteMutation = useForceDeleteItem();

  const items: TrashedItem[] = itemsData?.data || [];
  const totalPages = Math.ceil((itemsData?.recordsFiltered || 0) / 15);

  const handleSlugChange = (value: string) => {
    setActiveSlug(value);
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
    setTargetId(id);
    setConfirmAction("restore");
    setConfirmRestoreOpen(true);
  };

  const handleForceDelete = (id: number) => {
    setTargetId(id);
    setConfirmAction("delete");
    setConfirmDeleteOpen(true);
  };

  // تنفيذ الاسترجاع بعد التأكيد
  const handleConfirmRestore = async () => {
    setConfirmRestoreOpen(false);
    if (confirmAction === "restore" && targetId !== null) {
      setRestoringId(targetId);
      restoreMutation.mutate(
        { slug: activeSlug, id: targetId },
        {
          onSettled: () => {
            setRestoringId(null);
            setTargetId(null);
            setSelectedIds((prev) => prev.filter((x) => x !== targetId));
          },
        }
      );
    } else if (confirmAction === "bulk-restore") {
      setBulkLoading(true);
      let successCount = 0;
      for (const id of selectedIds) {
        try {
          await restoreMutation.mutateAsync({ slug: activeSlug, id });
          successCount++;
        } catch {
          // الخطأ يُعرض تلقائياً من الـ hook
        }
      }
      if (successCount > 0) {
        toast.success(`تم استرجاع ${successCount} عنصر بنجاح`);
      }
      setSelectedIds([]);
      setBulkLoading(false);
    }
  };

  // تنفيذ الحذف النهائي بعد التأكيد
  const handleConfirmDelete = async () => {
    setConfirmDeleteOpen(false);
    if (confirmAction === "delete" && targetId !== null) {
      setDeletingId(targetId);
      forceDeleteMutation.mutate(
        { slug: activeSlug, id: targetId },
        {
          onSettled: () => {
            setDeletingId(null);
            setTargetId(null);
            setSelectedIds((prev) => prev.filter((x) => x !== targetId));
          },
        }
      );
    } else if (confirmAction === "bulk-delete") {
      setBulkLoading(true);
      let successCount = 0;
      for (const id of selectedIds) {
        try {
          await forceDeleteMutation.mutateAsync({ slug: activeSlug, id });
          successCount++;
        } catch {
          // الخطأ يُعرض تلقائياً من الـ hook
        }
      }
      if (successCount > 0) {
        toast.success(`تم حذف ${successCount} عنصر نهائياً`);
      }
      setSelectedIds([]);
      setBulkLoading(false);
    }
  };

  const handleBulkRestore = () => {
    setConfirmAction("bulk-restore");
    setConfirmRestoreOpen(true);
  };

  const handleBulkForceDelete = () => {
    setConfirmAction("bulk-delete");
    setConfirmDeleteOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 sm:px-6 sm:py-4">
        <h1 className="text-xl font-bold text-blue-3">المحذوفات</h1>
      </header>

      <main className="flex-1 p-2 sm:p-6 h-[calc(100vh-65px)]">
        <div className="grid grid-cols-12 gap-6 h-full">
          <div className="col-span-12 lg:col-span-2 h-full">
            <SidebarFilterPanel
              options={sidebarOptions}
              activeValue={activeSlug}
              onValueChange={handleSlugChange}
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
              isRestoring={bulkLoading && confirmAction === "bulk-restore"}
              isDeleting={bulkLoading && confirmAction === "bulk-delete"}
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
              activeSlug={activeSlug}
            />
          </div>
        </div>
      </main>

      {/* مودال تأكيد الاسترجاع */}
      <ConfirmDeleteModal
        isOpen={confirmRestoreOpen}
        onClose={() => setConfirmRestoreOpen(false)}
        onConfirm={handleConfirmRestore}
        title="هل أنت متأكد من الاسترجاع؟"
        description="سيتم استرجاع العنصر وإعادته إلى مكانه الأصلي."
        confirmText="نعم، استرجاع"
        cancelText="إلغاء"
        variant="restore"
      />

      {/* مودال تأكيد الحذف النهائي */}
      <ConfirmDeleteModal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="هل أنت متأكد من الحذف النهائي؟"
        description="لن تتمكن من استرجاع هذا العنصر بعد الحذف النهائي."
        confirmText="نعم، حذف نهائي"
        cancelText="إلغاء"
        variant="delete"
      />
    </div>
  );
}
