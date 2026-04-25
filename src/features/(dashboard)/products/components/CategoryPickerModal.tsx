"use client";

import { useState, useMemo, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Search, Loader2 } from "lucide-react";
import { useGetCategories } from "../../categoriesAndAttributes/hooks";
import { Category } from "../../categoriesAndAttributes/api";
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

export function CategoryPickerModal({
  isOpen,
  onClose,
  onSelect,
  selectedCategoryId,
  type = "product",
}: CategoryPickerModalProps) {
  const [navigationStack, setNavigationStack] = useState<NavItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(
    selectedCategoryId ?? null
  );
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

  const currentParentId =
    navigationStack.length > 0
      ? navigationStack[navigationStack.length - 1].id
      : null;

  // عند وجود بحث: يبحث في كل الفئات (global)
  // عند غياب البحث: يعرض المستوى الحالي فقط
  const params = useMemo(() => {
    const p = new URLSearchParams();
    p.set("type", type);
    p.set("per_page", "100");
    p.set("is_active", "1");

    if (debouncedSearch) {
      // بحث عام بدون قيود المستوى
      p.set("name", debouncedSearch);
    } else if (currentParentId) {
      p.set("parent_id", String(currentParentId));
      p.set("only_sub_categories", "true");
    } else {
      p.set("only_parent", "true");
    }

    return p;
  }, [debouncedSearch, currentParentId, type]);

  const { data, isLoading } = useGetCategories(params, { enabled: isOpen });
  const categories = data?.data ?? [];

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
      // بناء المسار الكامل: من السجل أو من navigationStack + اسم الفئة
      const fullPath =
        cat.full_name && cat.full_name !== cat.name
          ? cat.full_name
          : navigationStack.length > 0
          ? [...navigationStack.map((n) => n.name), cat.name].join(" > ")
          : cat.name;
      setSelectedFullName(fullPath);
    }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl w-full max-w-[480px] shadow-2xl flex flex-col max-h-[85vh]"
        dir="rtl"
      >
        {/* ── Header ── */}
        <div className="flex-shrink-0 relative flex items-center px-5 pt-5 pb-3">
          {/* زر الإغلاق على اليسار */}
          <button
            onClick={onClose}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>

          {/* العنوان + أيقونة التنقل */}
          <div className="flex-1 flex items-center justify-end gap-2 pr-1 pl-10">
            <h2 className="text-base font-semibold text-gray-900">
              اختر الفئة المناسبة للمنتج
            </h2>
            {navigationStack.length > 0 ? (
              <button
                onClick={handleBack}
                aria-label="رجوع"
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 flex-shrink-0"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            )}
          </div>
        </div>

        {/* ── وصف / breadcrumb ── */}
        <div className="flex-shrink-0 px-5 pb-3">
          {navigationStack.length === 0 ? (
            <p className="text-xs text-gray-500 leading-5">
              حدد التصنيف الأنسب لمنتجك لتسهيل العثور عليه وعرضه في القسم
              المناسب وزيادة فرص البيع.
            </p>
          ) : (
            <div className="flex items-center gap-1 flex-wrap text-xs text-gray-500">
              {navigationStack.map((item, idx) => (
                <span key={item.id} className="flex items-center gap-1">
                  {idx > 0 && (
                    <ChevronLeft className="w-3 h-3 rotate-180 text-gray-400" />
                  )}
                  <span
                    className={
                      idx === navigationStack.length - 1
                        ? "font-medium text-gray-700"
                        : ""
                    }
                  >
                    {item.name}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── حقل البحث ── */}
        <div className="flex-shrink-0 px-5 pb-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن الفئة"
              className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#406896] focus:ring-1 focus:ring-[#406896]/20 transition-colors"
            />
          </div>
        </div>

        {/* ── قائمة الفئات (قابلة للتمرير) ── */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-3">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#406896]" />
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Search className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">لا توجد نتائج مطابقة</p>
            </div>
          ) : (
            <div className="space-y-1">
              {categories.map((cat: Category) => {
                const hasChildren = Number(cat.sub_categories_count ?? 0) > 0;
                const isSelected = selectedId === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3.5 rounded-lg text-sm text-right transition-colors",
                      isSelected
                        ? "bg-[#EDF3FA] text-[#406896] border border-[#c8d7e8]"
                        : hasChildren
                        ? "bg-white hover:bg-gray-50 text-gray-800 border border-gray-100"
                        : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-100"
                    )}
                  >
                    <div className="flex flex-col items-start gap-0.5 min-w-0">
                      <span className="font-medium">{cat.name}</span>
                      {debouncedSearch && cat.full_name && cat.full_name !== cat.name && (
                        <span className="text-xs text-gray-400 truncate w-full">
                          {cat.full_name}
                        </span>
                      )}
                    </div>
                    {/* السهم فقط للفئات التي بداخلها فروع */}
                    {hasChildren && (
                      <ChevronLeft className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 flex gap-3 px-5 py-4 border-t border-gray-100">
          <button
            onClick={handleConfirm}
            disabled={selectedId === null}
            className={cn(
              "flex-1 py-3 rounded-xl text-sm font-semibold transition-all",
              selectedId !== null
                ? "bg-[#406896] text-white hover:bg-[#2D496A]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            التالي
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
