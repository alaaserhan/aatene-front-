// src/features/(dashboard)/categoriesAndAttributes/components/LinkAttributesView.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Category, Attribute, getCategoryAttributes, addAttributeToCategory, removeAttributeFromCategory } from "../api";
import { Input } from "@/src/components/ui/input";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { AttributeModal } from "./AttributeModal";
import { useCreateAttribute, useUpdateAttribute } from "../hooks";
import { Pagination } from "@/src/components/ui/Pagination";
import { cn } from "@/src/lib/utils";

interface LinkAttributesViewProps {
  categories: Category[];
  attributes: Attribute[];
  onSave?: (categoryId: number, attributeIds: number[], previousAttributeIds: number[]) => void;
  onAttributesChanged?: () => void;
}

// ─── Custom Toggle ─────────────────────────────────────────────────────────────
function CustomToggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      className="relative inline-flex items-center rounded-full flex-shrink-0 focus:outline-none transition-colors duration-200"
      style={{
        width: 40,
        height: 22,
        backgroundColor: checked ? '#22C55E' : '#D1D5DB',
      }}
    >
      <span
        className="inline-block rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{
          width: 18,
          height: 18,
          transform: checked ? 'translateX(20px)' : 'translateX(2px)',
        }}
      />
    </button>
  );
}

export function LinkAttributesView({
  categories,
  attributes,
  onSave,
  onAttributesChanged,
}: LinkAttributesViewProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [categorySearch, setCategorySearch] = useState("");
  const [attributeSearch, setAttributeSearch] = useState("");
  const [valueSearch, setValueSearch] = useState("");
  const [selectedAttributes, setSelectedAttributes] = useState<Set<number>>(new Set());
  const [initialAttributeIds, setInitialAttributeIds] = useState<number[]>([]);
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());
  // آخر سمة تم الضغط عليها لعرض قيمها
  const [activeAttributeId, setActiveAttributeId] = useState<number | null>(null);
  const [categoryPage, setCategoryPage] = useState(1);
  const [attributePage, setAttributePage] = useState(1);
  const [valuePage, setValuePage] = useState(1);
  const [loadingAttributes, setLoadingAttributes] = useState(false);
  // حالات الـ modals
  const [addAttributeModalOpen, setAddAttributeModalOpen] = useState(false);
  const [addValueModalOpen, setAddValueModalOpen] = useState(false);
  const itemsPerPage = 8;

  const createAttributeMutation = useCreateAttribute();
  const updateAttributeMutation = useUpdateAttribute();

  const buildCategoryBreadcrumb = (category: Category, allCats: Category[]): string[] => {
    const parts: string[] = [];
    let current: Category | undefined = category;
    while (current) {
      parts.unshift(current.name);
      if (current.parent_id) {
        current = allCats.find(c => c.id === Number(current!.parent_id));
      } else {
        break;
      }
    }
    return parts;
  };

  const flatCategories = useMemo(() => {
    const result: Array<Category & { breadcrumb: string[] }> = [];
    categories.forEach(cat => {
      const breadcrumb = buildCategoryBreadcrumb(cat, categories);
      result.push({ ...cat, breadcrumb });
    });
    return result;
  }, [categories]);

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return flatCategories;
    const searchLower = categorySearch.toLowerCase();
    return flatCategories.filter(c => c.breadcrumb.join(' ').toLowerCase().includes(searchLower));
  }, [flatCategories, categorySearch]);

  const paginatedCategories = useMemo(() => {
    const startIndex = (categoryPage - 1) * itemsPerPage;
    return filteredCategories.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCategories, categoryPage]);

  const totalCategoryPages = Math.ceil(filteredCategories.length / itemsPerPage);

  const filteredAttributes = useMemo(() => {
    if (!attributeSearch.trim()) return attributes;
    return attributes.filter(attr => attr.title.toLowerCase().includes(attributeSearch.toLowerCase()));
  }, [attributes, attributeSearch]);

  const paginatedAttributes = useMemo(() => {
    const startIndex = (attributePage - 1) * itemsPerPage;
    return filteredAttributes.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAttributes, attributePage]);

  const totalAttributePages = Math.ceil(filteredAttributes.length / itemsPerPage);

  const selectedCategory = useMemo(() =>
    flatCategories.find(cat => cat.id === selectedCategoryId),
    [flatCategories, selectedCategoryId]
  );

  // السمة النشطة التي تم النقر عليها (لعرض قيمها)
  const activeAttribute = useMemo(() =>
    attributes.find(attr => attr.id === activeAttributeId) ?? null,
    [attributes, activeAttributeId]
  );

  const filteredValues = useMemo(() => {
    if (!activeAttribute) return [];
    const opts = activeAttribute.options || [];
    if (!valueSearch.trim()) return opts;
    return opts.filter(opt => opt.title.toLowerCase().includes(valueSearch.toLowerCase()));
  }, [activeAttribute, valueSearch]);

  const paginatedValues = useMemo(() => {
    const startIndex = (valuePage - 1) * itemsPerPage;
    return filteredValues.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredValues, valuePage]);

  const totalValuePages = Math.ceil(filteredValues.length / itemsPerPage);

  useEffect(() => {
    if (selectedCategoryId) {
      setLoadingAttributes(true);
      getCategoryAttributes(selectedCategoryId)
        .then(response => {
          if (response.attributes && Array.isArray(response.attributes)) {
            const linkedIds = response.attributes.map(attr => attr.id);
            setSelectedAttributes(new Set(linkedIds));
            setInitialAttributeIds(linkedIds);
          }
        })
        .catch(error => {
          console.error('Error loading category attributes:', error);
          setSelectedAttributes(new Set());
          setInitialAttributeIds([]);
        })
        .finally(() => {
          setLoadingAttributes(false);
        });
    }
  }, [selectedCategoryId]);

  // إضافة سمة جديدة
  const handleSaveNewAttribute = (data: { title: string; options: { title: string; data?: string | null }[] }) => {
    createAttributeMutation.mutate(data, {
      onSuccess: () => {
        setAddAttributeModalOpen(false);
        onAttributesChanged?.();
      },
    });
  };

  // إضافة قيمة لسمة موجودة
  const handleSaveNewValue = (data: { title: string; options: { title: string; data?: string | null }[] }) => {
    if (!activeAttribute) return;
    
    const existingOptions = activeAttribute.options.map(o => ({
      id: String(o.id),
      title: o.title,
      data: o.data ?? null,
    }));
    // نضيف الخيارات الجديدة (بدون id)
    const newOptions = data.options
      .filter(o => !existingOptions.find(e => e.title === o.title))
      .map(o => ({ title: o.title, data: o.data ?? null }));
    const merged = [...existingOptions, ...newOptions];
    updateAttributeMutation.mutate(
      {
        id: activeAttribute.id,
        payload: {
          title: activeAttribute.title,
          options: merged,
        },
      },
      {
        onSuccess: () => {
          setAddValueModalOpen(false);
          onAttributesChanged?.();
        },
      }
    );
  };

  const PaginationControls = ({ currentPage, totalPages, onPageChange }: {
    currentPage: number; totalPages: number; onPageChange: (page: number) => void;
  }) => {
    if (totalPages <= 1) return null;
    return (
      <div className="py-2 [&_button]:w-7 [&_button]:h-7 [&_button]:text-xs [&_span]:w-7 [&_span]:h-7">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    );
  };

  return (
    <>
    <div className="grid grid-cols-12 gap-3" dir="rtl">

      {/* RIGHT Panel: Categories */}
      <div className="col-span-12 lg:col-span-4 bg-white rounded-lg border border-[#E5E7EB] flex flex-col overflow-hidden" style={{ minHeight: '580px' }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: '#F3F4F6' }}>
          <h3 className="text-sm font-bold" style={{ color: '#3D5E83' }}>الفئات الرئيسية والفرعية</h3>
          <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>فئات المتصلة بالكامل الرئيسية أو الفرعية</p>
        </div>
        <div className="px-3 py-2 relative">
          <Input type="text" value={categorySearch}
            onChange={(e) => { setCategorySearch(e.target.value); setCategoryPage(1); }}
            placeholder="ابحث باسم الفئة الرئيسية أو الفئة الفرعية"
            className="w-full px-2.5 py-1.5 ps-8 text-sm rounded-lg"
            style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }} />
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#9CA3AF' }} />
        </div>
        <ScrollArea className="flex-1 px-2.5">
          {paginatedCategories.length === 0 ? (
            <div className="text-center py-12 text-sm" style={{ color: '#9CA3AF' }}>لا توجد نتائج</div>
          ) : (
            <div className="space-y-1 py-1">
              {paginatedCategories.map(category => {
                const isSelected = category.id === selectedCategoryId;
                return (
                  <div key={category.id} onClick={() => setSelectedCategoryId(category.id)}
                    className={cn(
                      "px-3 py-2.5 rounded-lg cursor-pointer transition-all border",
                      isSelected ? "bg-blue-5 border-blue-5" : "bg-white border-[#E5E7EB]"
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-1" style={{ direction: 'rtl' }}>
                      {category.breadcrumb.map((part, idx) => (
                        <span key={`${category.id}-part-${idx}`} className="inline-flex items-center gap-1">
                          <span style={{
                            color: idx === category.breadcrumb.length - 1
                              ?  '#374151'
                              : '#6B7280',
                            fontWeight: idx === category.breadcrumb.length - 1 ? 600 : 400,
                            fontSize: '14px'
                          }}>
                            {part}
                          </span>
                          {idx < category.breadcrumb.length - 1 && (
                            <span key={`${category.id}-sep-${idx}`} style={{ color: '#9CA3AF', fontSize: '10px', margin: '0 2px' }}>›</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        <div className="px-3" style={{ borderTop: '1px solid #F3F4F6' }}>
          <PaginationControls currentPage={categoryPage} totalPages={totalCategoryPages} onPageChange={setCategoryPage} />
        </div>
      </div>

      {/* MIDDLE Panel: Attributes */}
      <div className="col-span-12 lg:col-span-4 bg-white rounded-lg border border-[#E5E7EB] flex flex-col overflow-hidden" style={{ minHeight: '580px' }}>
        <div className="px-4 py-3 border-b flex items-center justify-between gap-2" style={{ borderColor: '#F3F4F6' }}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold" style={{ color: '#3D5E83' }}>السمات</h3>
              <span className="text-sm font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#E6E6E6', color: '#697181' }}>
                {filteredAttributes.length}
              </span>
            </div>
            <p className="text-sm mt-0.5 truncate" style={{ color: '#9CA3AF' }}>
              سمات فئة : {selectedCategory ? selectedCategory.name : '—'}
            </p>
          </div>
          <button
            onClick={() => setAddAttributeModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded text-sm font-semibold flex-shrink-0 transition-opacity hover:opacity-80"
            style={{ backgroundColor: '#3D5E83', color: '#FFFFFF' }}
          >
            <Plus className="w-3 h-3" />
            إضافة سمة
          </button>
        </div>
        <div className="px-3 py-2 relative">
          <Input type="text" value={attributeSearch}
            onChange={(e) => { setAttributeSearch(e.target.value); setAttributePage(1); }}
            placeholder="ابحث باسم السمة"
            className="w-full px-2.5 py-1.5 ps-8 text-sm rounded-lg"
            style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }} />
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#9CA3AF' }} />
        </div>
        <ScrollArea className="flex-1 px-2.5">
          {loadingAttributes ? (
            <div className="text-center py-12 text-sm" style={{ color: '#9CA3AF' }}>جاري التحميل...</div>
          ) : paginatedAttributes.length === 0 ? (
            <div className="text-center py-12 text-sm" style={{ color: '#9CA3AF' }}>لا توجد سمات</div>
          ) : (
            <div className="space-y-1 py-1">
              {paginatedAttributes.map(attribute => {
                const isSelected = selectedAttributes.has(attribute.id);
                const isToggling = togglingIds.has(attribute.id);
                const isActive = attribute.id === activeAttributeId;
                return (
                  <div
                    key={attribute.id}
                    onClick={() => setActiveAttributeId(attribute.id)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-lg transition-all border cursor-pointer",
                      isToggling ? "opacity-60" : "",
                      isActive || isSelected ? "bg-blue-5 border-blue-5" : "bg-white border-[#E5E7EB]"
                    )}
                  >
                    
                    <CustomToggle
                      checked={isSelected}
                      onChange={async () => {
                        if (!selectedCategoryId || togglingIds.has(attribute.id)) return;
                        // عند النقر على أي سمة → تصبح نشطة لعرض قيمها
                        setActiveAttributeId(attribute.id);
                        setTogglingIds(prev => new Set(prev).add(attribute.id));
                        try {
                          if (isSelected) {
                            await removeAttributeFromCategory(selectedCategoryId, attribute.id);
                            setSelectedAttributes(prev => {
                              const next = new Set(prev);
                              next.delete(attribute.id);
                              return next;
                            });
                          } else {
                            await addAttributeToCategory(selectedCategoryId, attribute.id);
                            setSelectedAttributes(prev => new Set(prev).add(attribute.id));
                          }
                        } catch (err) {
                          console.error('Error toggling attribute:', err);
                        } finally {
                          setTogglingIds(prev => {
                            const next = new Set(prev);
                            next.delete(attribute.id);
                            return next;
                          });
                        }
                      }}
                    />
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: isSelected ? '#36383dff' : '#374151',
                    }}>
                      {attribute.title}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        <div className="px-3" style={{ borderTop: '1px solid #F3F4F6' }}>
          <PaginationControls currentPage={attributePage} totalPages={totalAttributePages} onPageChange={setAttributePage} />
        </div>
      </div>

      {/* LEFT Panel: Values */}
      <div className="col-span-12 lg:col-span-4 bg-white rounded-lg border border-[#E5E7EB] flex flex-col overflow-hidden" style={{ minHeight: '580px' }}>
        <div className="px-4 py-3 border-b flex items-center justify-between gap-2" style={{ borderColor: '#F3F4F6' }}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold" style={{ color: '#3D5E83' }}>القيم</h3>
              <span className="text-sm font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#E6E6E6', color: '#6B7280' }}>
                {filteredValues.length}
              </span>
            </div>
            <p className="text-sm mt-0.5 truncate" style={{ color: '#9CA3AF' }}>
              قيم سمة : {activeAttribute ? activeAttribute.title : '—'}
            </p>
          </div>
          <button
            onClick={() => { if (activeAttribute) setAddValueModalOpen(true); }}
            disabled={!activeAttribute}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded text-sm font-semibold flex-shrink-0 transition-opacity hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#3D5E83', color: '#FFFFFF' }}
          >
            <Plus className="w-3 h-3" />
            إضافة قيمة
          </button>
        </div>
        <div className="px-3 py-2 relative">
          <Input type="text" value={valueSearch}
            onChange={(e) => { setValueSearch(e.target.value); setValuePage(1); }}
            placeholder="ابحث عن القيمة"
            className="w-full px-2.5 py-1.5 ps-8 text-sm rounded-lg"
            style={{ backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }} />
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#9CA3AF' }} />
        </div>
        <ScrollArea className="flex-1 px-2.5">
          {paginatedValues.length === 0 ? (
            <div className="text-center py-12 text-sm" style={{ color: '#9CA3AF' }}>لا توجد قيم</div>
          ) : (
            <div className="space-y-1 py-1">
              {paginatedValues.map((value, idx) => (
                <div key={value.id ?? `new-${idx}-${value.title}`} className="px-3 py-2.5 rounded-lg transition-all border"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E7EB',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: 500,
                    direction: 'rtl'
                  }}>
                  {value.title}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="px-3" style={{ borderTop: '1px solid #F3F4F6' }}>
          <PaginationControls currentPage={valuePage} totalPages={totalValuePages} onPageChange={setValuePage} />
        </div>
      </div>

    </div>

    {/* Modal: إضافة سمة جديدة */}
    <AttributeModal
      isOpen={addAttributeModalOpen}
      onClose={() => setAddAttributeModalOpen(false)}
      onSave={handleSaveNewAttribute}
      mode="add"
      isLoading={createAttributeMutation.isPending}
    />

    {/* Modal: إضافة قيمة لسمة موجودة */}
    <AttributeModal
      isOpen={addValueModalOpen}
      onClose={() => setAddValueModalOpen(false)}
      onSave={handleSaveNewValue}
      mode="edit"
      attribute={activeAttribute}
      disableTitle={true}
      isLoading={updateAttributeMutation.isPending}
    />
    </>
  );
}