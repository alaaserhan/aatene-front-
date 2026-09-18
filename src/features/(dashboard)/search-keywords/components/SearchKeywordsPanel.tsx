// src/features/(dashboard)/search-keywords/components/SearchKeywordsPanel.tsx
"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Pagination } from "@/src/components/ui/Pagination";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { SearchKeyword, SearchKeywordType } from "../api";
import {
  useConvertSearchKeywordsToTags,
  useDeleteSearchKeyword,
  useDeleteSelectedSearchKeywords,
  useGetSearchKeywords,
} from "../hooks";
import { SearchKeywordCard } from "./SearchKeywordCard";

const PER_PAGE = 20;

type PendingDelete = { mode: "single"; searchKeyword: SearchKeyword } | { mode: "bulk" };

interface SearchKeywordsPanelProps {
  type: SearchKeywordType;
  /** Already debounced by the page shell */
  search: string;
  /** Label of the active entity tab, used in the empty state and the panel title */
  typeLabel: string;
}

export function SearchKeywordsPanel({ type, search, typeLabel }: SearchKeywordsPanelProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
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

  const { data, isLoading, isError } = useGetSearchKeywords({
    keyword: search || undefined,
    type,
    order_by: "count_desc",
    per_page: PER_PAGE,
    page: currentPage,
  });

  const deleteSearchKeyword = useDeleteSearchKeyword();
  const deleteSelected = useDeleteSelectedSearchKeywords();
  const convertToTags = useConvertSearchKeywordsToTags();

  const searchKeywords = useMemo(() => data?.items ?? [], [data]);
  const totalPages = data?.pagination?.total_pages ?? 0;
  const allSelected =
    searchKeywords.length > 0 && searchKeywords.every((item) => selectedIds.includes(item.id));
  const isDeleting = deleteSearchKeyword.isPending || deleteSelected.isPending;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedIds([]);
  };

  const toggleSelected = (id: number, selected: boolean) => {
    setSelectedIds((prev) => (selected ? [...prev, id] : prev.filter((item) => item !== id)));
  };

  const toggleSelectAll = (selected: boolean) => {
    setSelectedIds(selected ? searchKeywords.map((item) => item.id) : []);
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;

    if (pendingDelete.mode === "single") {
      const { id } = pendingDelete.searchKeyword;
      deleteSearchKeyword.mutate(id, {
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

  const handleConvertToTags = () => {
    if (selectedIds.length === 0) return;
    convertToTags.mutate(selectedIds, { onSuccess: () => setSelectedIds([]) });
  };

  return (
    <main className="flex flex-1 flex-col rounded-lg border border-c2-neutral-200 bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-c2-primary">
          عرض جميع كلمات البحث في {typeLabel}
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setPendingDelete({ mode: "bulk" })}
              disabled={isDeleting || convertToTags.isPending}
              className="h-10 cursor-pointer"
            >
              حذف المحدد ({selectedIds.length})
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={handleConvertToTags}
            disabled={selectedIds.length === 0 || convertToTags.isPending || isDeleting}
            className="h-10 cursor-pointer gap-2 border-c2-neutral-200 bg-c2-neutral-50 text-c2-neutral-600 hover:bg-c2-neutral-200"
          >
            {convertToTags.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            إضافة للكلمات المفتاحية
          </Button>
        </div>
      </div>

      {searchKeywords.length > 0 && (
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
        ) : searchKeywords.length === 0 ? (
          <div className="flex min-h-[300px] flex-1 items-center justify-center">
            <p className="text-c2-neutral-500">لا توجد كلمات بحث في {typeLabel}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {searchKeywords.map((searchKeyword) => (
              <SearchKeywordCard
                key={searchKeyword.id}
                searchKeyword={searchKeyword}
                selected={selectedIds.includes(searchKeyword.id)}
                onSelectedChange={(selected) => toggleSelected(searchKeyword.id, selected)}
                onDelete={() => setPendingDelete({ mode: "single", searchKeyword })}
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

      <ConfirmDeleteModal
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        title={
          pendingDelete?.mode === "bulk"
            ? `هل أنت متأكد من حذف ${selectedIds.length} كلمة بحث؟`
            : "هل أنت متأكد من حذف كلمة البحث؟"
        }
        description="لا يمكن استرجاع كلمات البحث بعد حذفها"
        confirmText="نعم، قم بالحذف"
        cancelText="إلغاء"
        confirmPosition="start"
        isLoading={isDeleting}
        autoCloseOnConfirm={false}
      />
    </main>
  );
}
