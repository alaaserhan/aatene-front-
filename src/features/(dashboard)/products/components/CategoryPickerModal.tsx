"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/src/components/ui/dialog";
import { useGetParentCategories, useGetSubCategories } from "../../categoriesAndAttributes/hooks";
import { Category, CategorySelectOption, getCategoryOptions } from "../../categoriesAndAttributes/api";
import { cn } from "@/src/lib/utils";

interface CategoryPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (categoryId: number, categoryName: string) => void;
  selectedCategoryId?: number;
  type?: "product" | "service";
}

interface NavItem {
  id: number;
  name: string;
}

export function CategoryPickerModal({ isOpen, onClose, onSelect, selectedCategoryId, type = "product" }: CategoryPickerModalProps) {
  const entityLabel = type === "service" ? "خدمة" : "منتج";
  const entityLabelWithSuffix = type === "service" ? "خدمتك" : "منتجك";

  const [navigationStack, setNavigationStack] = useState<NavItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(selectedCategoryId ?? null);
  const [selectedFullName, setSelectedFullName] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setNavigationStack([]);
      setSearchQuery("");
      setDebouncedSearch("");
      setSelectedId(selectedCategoryId ?? null);
      setSelectedFullName("");
    }
  }, [isOpen, selectedCategoryId]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const currentParentId = navigationStack.length > 0 ? navigationStack[navigationStack.length - 1].id : null;

  const isSearchMode = debouncedSearch.trim().length > 0;

  // ── Browse mode: فئات رئيسية ──
  const parentParams = useMemo(() => {
    const p = new URLSearchParams();
    p.set("type", type);
    return p;
  }, [type]);

  const { data: parentData, isLoading: isLoadingParents } = useGetParentCategories(parentParams, { enabled: isOpen && !isSearchMode && currentParentId === null });

  // ── Browse mode: فئات فرعية ──
  const { data: subData, isLoading: isLoadingSubs } = useGetSubCategories(currentParentId ?? 0, type, { enabled: isOpen && !isSearchMode && currentParentId !== null });

  // ── Search mode: /categories/select — يُرجع الفئات الورقية فقط مع full_name ──
  const searchParams = useMemo(() => {
    const p = new URLSearchParams();
    p.set("type", type);
    if (debouncedSearch) p.set("name", debouncedSearch);
    return p;
  }, [debouncedSearch, type]);

  const { data: searchData, isLoading: isLoadingSearch } = useQuery({
    queryKey: ["categories", "select", searchParams.toString()],
    queryFn: () => getCategoryOptions(searchParams),
    enabled: isOpen && isSearchMode,
  });

  // ── القائمة النشطة ──
  const isLoading = isSearchMode ? isLoadingSearch : currentParentId === null ? isLoadingParents : isLoadingSubs;

  // في Browse mode نستخدم Category[], في Search mode نستخدم CategorySelectOption[]
  const browseCategories: Category[] = useMemo(() => {
    if (isSearchMode) return [];
    if (currentParentId === null) return parentData?.data ?? [];
    return subData?.data ?? [];
  }, [isSearchMode, currentParentId, parentData, subData]);

  const searchResults: CategorySelectOption[] = useMemo(() => {
    return searchData?.categories ?? [];
  }, [searchData]);

  const handleCategoryClick = (cat: Category) => {
    const hasChildren = Number(cat.sub_categories_count ?? 0) > 0;

    if (hasChildren) {
      setNavigationStack((prev) => [...prev, { id: cat.id, name: cat.name }]);
      setSearchQuery("");
      setDebouncedSearch("");
      setSelectedId(null);
      setSelectedFullName("");
    } else {
      setSelectedId(cat.id);
      const fullPath = cat.full_name && cat.full_name !== cat.name ? cat.full_name : navigationStack.length > 0 ? [...navigationStack.map((n) => n.name), cat.name].join(" < ") : cat.name;
      setSelectedFullName(fullPath);
    }
  };

  const handleSearchResultClick = (cat: CategorySelectOption) => {
    setSelectedId(cat.id);
    // name في /categories/select هو full_name من الباك اند
    setSelectedFullName(cat.name);
  };

  const handleBack = () => {
    setNavigationStack((prev) => prev.slice(0, -1));
    setSearchQuery("");
    setDebouncedSearch("");
    setSelectedId(null);
    setSelectedFullName("");
  };

  const handleConfirm = () => {
    if (selectedId !== null) {
      onSelect(selectedId, selectedFullName);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 gap-0 rounded-2xl flex flex-col max-h-[85vh] max-w-xl" dir="rtl">
        {/* ── Header ── */}
        <div className="shrink-0 flex items-center px-5 pt-5 pb-3">
          {/* العنوان + أيقونة التنقل */}
          <div className="flex-1 flex items-center justify-start gap-2 pr-1 pl-10">
            {navigationStack.length > 0 ? (
              <button type="button" onClick={handleBack} aria-label="رجوع" className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 shrink-0">
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
            )}
            <DialogTitle className="text-base font-semibold text-gray-900">{`اختر الفئة المناسبة لل${entityLabel}`}</DialogTitle>
          </div>
        </div>

        {/* ── وصف / breadcrumb ── */}
        <div className="shrink-0 px-5 pb-3">
          {navigationStack.length === 0 ? (
            <DialogDescription className="text-xs text-gray-6 leading-5">
              {`حدد الفئة الأنسب ل${entityLabelWithSuffix} لتسهيل العثور عليها وعرضه في القسم
              المناسب وزيادة فرص البيع.
              `}
            </DialogDescription>
          ) : (
            <DialogDescription className="flex items-center gap-1 flex-wrap text-xs text-gray-500">
              {navigationStack.map((item, idx) => (
                <span key={item.id} className="flex items-center gap-1">
                  {idx > 0 && <ChevronLeft className="w-3 h-3 rotate-180 text-gray-400" />}
                  <span className={idx === navigationStack.length - 1 ? "font-medium text-gray-700" : ""}>{item.name}</span>
                </span>
              ))}
            </DialogDescription>
          )}
        </div>

        {/* ── حقل البحث ── */}
        <div className="shrink-0 px-5 mb-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="ابحث عن الفئة" className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#406896] focus:ring-1 focus:ring-[#406896]/20 transition-colors" />
          </div>
        </div>

        {/* ── قائمة الفئات (قابلة للتمرير) ── */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-3">
          {isLoading ? (
            <div className="flex justify-center items-center py-60">
              <Loader2 className="w-6 h-6 animate-spin text-[#406896]" />
            </div>
          ) : isSearchMode ? (
            /* ── Search results from /categories/select ── */
            searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Search className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">لا توجد نتائج مطابقة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((cat: CategorySelectOption) => {
                  const isSelected = selectedId === cat.id;
                  // name هو full_name من الباك اند — نأخذ آخر جزء كاسم مختصر
                  const parts = cat.name.split(" > ");
                  const shortName = parts[parts.length - 1];
                  const parentPath = parts.slice(0, -1).join(" < ");

                  return (
                    <button key={cat.id} onClick={() => handleSearchResultClick(cat)} className={cn("w-full flex items-center justify-between px-4 py-3.5 rounded-lg text-sm text-right transition-colors", isSelected ? "bg-[#EDF3FA] text-[#406896] border border-[#c8d7e8]" : "bg-white hover:bg-gray-50 text-gray-800 border border-gray-100")}>
                      <div className="flex flex-col items-start gap-0.5 min-w-0">
                        <span className="font-medium">{shortName}</span>
                        {parentPath && <span className="text-xs text-gray-400 truncate w-full">{parentPath}</span>}
                      </div>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-[#406896] flex items-center justify-center shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )
          ) : /* ── Browse mode ── */
          browseCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Search className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">لا توجد فئات</p>
            </div>
          ) : (
            <div className="space-y-3">
              {browseCategories.map((cat: Category) => {
                const hasChildren = Number(cat.sub_categories_count ?? 0) > 0;
                const isSelected = selectedId === cat.id;

                return (
                  <button key={cat.id} onClick={() => handleCategoryClick(cat)} className={cn("w-full flex items-center justify-between px-4 py-3.5 rounded-lg text-sm text-right transition-colors", isSelected ? "bg-[#EDF3FA] text-[#406896] border border-[#c8d7e8]" : "bg-white hover:bg-gray-50 text-gray-800 border border-gray-4")}>
                    <span className="font-medium">{cat.name}</span>
                    {hasChildren ? (
                      <ChevronLeft className="w-4 h-4 text-gray-400 shrink-0" />
                    ) : isSelected ? (
                      <span className="w-4 h-4 rounded-full bg-[#406896] flex items-center justify-center shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 flex gap-3 px-5 py-4 border-t border-gray-100">
          <button onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            إلغاء
          </button>

          <button onClick={handleConfirm} disabled={selectedId === null} className={cn("flex-1 py-3 rounded-xl text-sm font-semibold transition-all", selectedId !== null ? "bg-[#406896] text-white hover:bg-[#2D496A]" : "bg-gray-100 text-gray-400 cursor-not-allowed")}>
            التالي
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
