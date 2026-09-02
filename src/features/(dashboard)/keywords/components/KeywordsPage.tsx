// src/features/(dashboard)/keywords/components/KeywordsPage.tsx
"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus, Search } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Pagination } from "@/src/components/ui/Pagination";
import { ConfirmDeleteModal } from "@/src/components/(dashboard)/ConfirmDeleteModal";
import { useDebounce } from "@/src/hooks/use-debounce";
import { cn } from "@/src/lib/utils";
import { Keyword, KeywordType } from "../api";
import { useDeleteKeyword, useDeleteSelectedKeywords, useGetKeywords } from "../hooks";
import { KeywordCard } from "./KeywordCard";
import { AddKeywordsDialog } from "./AddKeywordsDialog";
import { EditKeywordDialog } from "./EditKeywordDialog";

const PER_PAGE = 20;

const TABS: { label: string; value: KeywordType }[] = [
  { label: "المنتجات", value: "product" },
  { label: "الخدمات", value: "service" },
  { label: "المتاجر", value: "store" },
];

type PendingDelete = { mode: "single"; keyword: Keyword } | { mode: "bulk" };

export function KeywordsPage() {
  const [activeType, setActiveType] = useState<KeywordType>("product");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<Keyword | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  const debouncedSearch = useDebounce(searchQuery.trim(), 400);

  const { data, isLoading, isError } = useGetKeywords({
    search: debouncedSearch || undefined,
    type: activeType,
    per_page: PER_PAGE,
    page: currentPage,
  });

  const deleteKeyword = useDeleteKeyword();
  const deleteSelected = useDeleteSelectedKeywords();

  const keywords = useMemo(() => data?.items ?? [], [data]);
  const totalPages = data?.pagination?.total_pages ?? 0;
  const activeTabLabel = TABS.find((tab) => tab.value === activeType)?.label ?? "";
  const allSelected = keywords.length > 0 && keywords.every((k) => selectedIds.includes(k.id));

  const resetView = () => {
    setCurrentPage(1);
    setSelectedIds([]);
  };

  const handleTypeChange = (type: KeywordType) => {
    if (type === activeType) return;
    setActiveType(type);
    resetView();
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    resetView();
  };

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
        onSuccess: () => setSelectedIds((prev) => prev.filter((item) => item !== id)),
      });
    } else {
      deleteSelected.mutate(selectedIds, { onSuccess: () => setSelectedIds([]) });
    }

    setPendingDelete(null);
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col pb-10">
      <header className="mt-6">
        <div className="heading-card flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="heading-1">الكلمات المفتاحية</h1>
            <p className="mt-1 text-sm text-c2-neutral-500">
              إدارة كلمات البحث المستخدمة في المنتجات والخدمات والمتاجر
            </p>
          </div>
        </div>
      </header>

      <div className="mt-6 flex gap-2 rounded-full bg-white p-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleTypeChange(tab.value)}
            className={cn(
              "flex-1 cursor-pointer rounded-full px-4 py-3 text-sm font-medium transition-colors",
              activeType === tab.value
                ? "bg-c2-navy-900 text-white"
                : "bg-c2-navy-50 text-c2-navy-300 hover:text-c2-primary"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="my-6">
        <div className="relative max-w-full rounded-lg border border-c2-neutral-200 bg-white">
          <Search className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-c2-neutral-500" />
          <Input
            placeholder="ابحث عن كلمة مفتاحية..."
            value={searchQuery}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="h-12 border-none pr-10 shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      <main className="flex flex-1 flex-col rounded-lg border border-c2-neutral-200 bg-white p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsAddOpen(true)}
            className="h-10 cursor-pointer gap-2 border-c2-neutral-200 bg-c2-neutral-50 text-c2-neutral-600 hover:bg-c2-neutral-200"
          >
            <Plus className="size-4" />
            إضافة للكلمات المفتاحية
          </Button>

          {selectedIds.length > 0 && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setPendingDelete({ mode: "bulk" })}
              disabled={deleteSelected.isPending}
              className="h-10 cursor-pointer"
            >
              حذف المحدد ({selectedIds.length})
            </Button>
          )}
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
              <p className="text-c2-neutral-500">لا توجد كلمات مفتاحية في {activeTabLabel}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {keywords.map((keyword) => (
                <KeywordCard
                  key={keyword.id}
                  keyword={keyword}
                  type={activeType}
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
      </main>

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
      />
    </div>
  );
}
