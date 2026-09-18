// src/features/(dashboard)/keywords/components/KeywordsPanel.tsx
"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Pagination } from "@/src/components/ui/Pagination";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { Keyword, KeywordType } from "../api";
import { useDeleteKeyword, useDeleteSelectedKeywords, useGetKeywords } from "../hooks";
import { KeywordCard } from "./KeywordCard";
import { AddKeywordsDialog } from "./AddKeywordsDialog";
import { EditKeywordDialog } from "./EditKeywordDialog";

const PER_PAGE = 20;

type PendingDelete = { mode: "single"; keyword: Keyword } | { mode: "bulk" };

interface KeywordsPanelProps {
  type: KeywordType;
  /** Already debounced by the page shell */
  search: string;
  /** Label of the active entity tab, used in the empty state and the panel title */
  typeLabel: string;
}

export function KeywordsPanel({ type, search, typeLabel }: KeywordsPanelProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  // A new filter invalidates both the page cursor and whatever was ticked on it.
  // Adjusting during render (rather than in an effect) keeps the request that
  // this very render fires on page 1 instead of refetching twice.
  const [appliedFilters, setAppliedFilters] = useState({ type, search });
  if (appliedFilters.type !== type || appliedFilters.search !== search) {
    setAppliedFilters({ type, search });
    setCurrentPage(1);
    setSelectedIds([]);
  }

  const { data, isLoading, isError } = useGetKeywords({
    search: search || undefined,
    type,
    per_page: PER_PAGE,
    page: currentPage,
  });

  const deleteKeyword = useDeleteKeyword();
  const deleteSelected = useDeleteSelectedKeywords();

  const keywords = useMemo(() => data?.items ?? [], [data]);
  const totalPages = data?.pagination?.total_pages ?? 0;
  const allSelected = keywords.length > 0 && keywords.every((k) => selectedIds.includes(k.id));
  const isDeleting = deleteKeyword.isPending || deleteSelected.isPending;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedIds([]);
  };

  const toggleSelected = (id: number, selected: boolean) => {
    setSelectedIds((prev) => (selected ? [...prev, id] : prev.filter((item) => item !== id)));
  };

  const toggleSelectAll = (selected: boolean) => {
    setSelectedIds(selected ? keywords.map((keyword) => keyword.id) : []);
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;

    if (pendingDelete.mode === "single") {
      const { id } = pendingDelete.keyword;
      deleteKeyword.mutate(id, {
        onSuccess: () => {
          setSelectedIds((prev) => prev.filter((item) => item !== id));
          setPendingDelete(null);
        },
      });
      return;
    }

    deleteSelected.mutate(selectedIds, {
      onSuccess: () => {
        setSelectedIds([]);
        setPendingDelete(null);
      },
    });
  };

  return (
    <main className="flex flex-1 flex-col rounded-lg border border-c2-neutral-200 bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-c2-primary">
          عرض جميع الكلمات المفتاحية في {typeLabel}
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setPendingDelete({ mode: "bulk" })}
              disabled={isDeleting}
              className="h-10 cursor-pointer"
            >
              حذف المحدد ({selectedIds.length})
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => setIsAddOpen(true)}
            className="h-10 cursor-pointer gap-2 border-c2-neutral-200 bg-c2-neutral-50 text-c2-neutral-600 hover:bg-c2-neutral-200"
          >
            <Plus className="size-4" />
            إضافة كلمات مفتاحية
          </Button>
        </div>
      </div>

      {keywords.length > 0 && (
        <label className="mt-4 flex w-fit cursor-pointer items-center gap-2 text-sm text-c2-neutral-600">
          <Checkbox
            checked={allSelected}
            onCheckedChange={(value) => toggleSelectAll(value === true)}
            className="size-4 border-c2-navy-300 data-[state=checked]:border-c2-primary data-[state=checked]:bg-c2-primary"
          />
          تحديد الكل
        </label>
      )}

      <div className="mt-4 flex flex-1 flex-col">
        {isLoading ? (
          <div className="flex min-h-[300px] flex-1 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-c2-primary" />
          </div>
        ) : isError ? (
          <div className="flex min-h-[300px] flex-1 items-center justify-center">
            <p className="text-c2-danger">حدث خطأ أثناء جلب البيانات</p>
          </div>
        ) : keywords.length === 0 ? (
          <div className="flex min-h-[300px] flex-1 items-center justify-center">
            <p className="text-c2-neutral-500">لا توجد كلمات مفتاحية في {typeLabel}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {keywords.map((keyword) => (
              <KeywordCard
                key={keyword.id}
                keyword={keyword}
                type={type}
                selected={selectedIds.includes(keyword.id)}
                onSelectedChange={(selected) => toggleSelected(keyword.id, selected)}
                onEdit={() => setEditingKeyword(keyword)}
                onDelete={() => setPendingDelete({ mode: "single", keyword })}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-auto border-t border-c2-neutral-200 pt-4">
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      <AddKeywordsDialog open={isAddOpen} onOpenChange={setIsAddOpen} />

      <EditKeywordDialog keyword={editingKeyword} onClose={() => setEditingKeyword(null)} />

      <ConfirmDeleteModal
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        title={
          pendingDelete?.mode === "bulk"
            ? `هل أنت متأكد من حذف ${selectedIds.length} كلمة مفتاحية؟`
            : "هل أنت متأكد من حذف الكلمة المفتاحية؟"
        }
        description="لا يمكن استرجاع الكلمات المفتاحية بعد حذفها"
        confirmText="نعم، قم بالحذف"
        cancelText="إلغاء"
        confirmPosition="start"
        isLoading={isDeleting}
        autoCloseOnConfirm={false}
      />
    </main>
  );
}
