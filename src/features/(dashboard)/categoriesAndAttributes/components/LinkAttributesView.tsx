// src/features/(dashboard)/categoriesAndAttributes/components/LinkAttributesView.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Category, Attribute, getCategoryAttributes } from "../api";
import { Input } from "@/src/components/ui/input";
import { ScrollArea } from "@/src/components/ui/scroll-area";

interface LinkAttributesViewProps {
  categories: Category[];
  attributes: Attribute[];
  onSave: (categoryId: number, attributeIds: number[]) => void;
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
}: LinkAttributesViewProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [categorySearch, setCategorySearch] = useState("");
  const [attributeSearch, setAttributeSearch] = useState("");
  const [valueSearch, setValueSearch] = useState("");
  const [selectedAttributes, setSelectedAttributes] = useState<Set<number>>(new Set());
  const [categoryPage, setCategoryPage] = useState(1);
  const [attributePage, setAttributePage] = useState(1);
  const [valuePage, setValuePage] = useState(1);
  const [loadingAttributes, setLoadingAttributes] = useState(false);
  const itemsPerPage = 8;

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

  const firstSelectedAttribute = useMemo(() => {
    const firstId = Array.from(selectedAttributes)[0];
    return attributes.find(attr => attr.id === firstId);
  }, [selectedAttributes, attributes]);

  const filteredValues = useMemo(() => {
    if (!firstSelectedAttribute) return [];
    const opts = firstSelectedAttribute.options || [];
    if (!valueSearch.trim()) return opts;
    return opts.filter(opt => opt.title.toLowerCase().includes(valueSearch.toLowerCase()));
  }, [firstSelectedAttribute, valueSearch]);

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
          }
        })
        .catch(error => {
          console.error('Error loading category attributes:', error);
          setSelectedAttributes(new Set());
        })
        .finally(() => {
          setLoadingAttributes(false);
        });
    }
  }, [selectedCategoryId]);

  const PaginationControls = ({ currentPage, totalPages, onPageChange }: {
    currentPage: number; totalPages: number; onPageChange: (page: number) => void;
  }) => {
    if (totalPages <= 1) return null;
    const showPages = 3;
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + showPages - 1);
    if (endPage - startPage < showPages - 1) {
      startPage = Math.max(1, endPage - showPages + 1);
    }
    const pages = [];
    for (let i = startPage; i <= endPage; i++) pages.push(i);

    return (
      <div className="flex items-center justify-center gap-1 py-2">
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}
          className="w-7 h-7 flex items-center justify-center rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
          style={{ color: '#6B7280' }}>
          <ChevronRight className="w-3 h-3" />
        </button>
        {pages.map(page => (
          <button key={page} onClick={() => onPageChange(page)}
            className="w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold transition-all"
            style={{ backgroundColor: page === currentPage ? '#1E293B' : 'transparent', color: page === currentPage ? '#FFFFFF' : '#6B7280' }}>
            {page}
          </button>
        ))}
        {endPage < totalPages && (
          <>
            <span className="text-xs text-gray-400 px-1">...</span>
            <button onClick={() => onPageChange(totalPages)}
              className="w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold transition-all hover:bg-gray-100"
              style={{ color: '#6B7280' }}>
              {totalPages}
            </button>
          </>
        )}
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}
          className="w-7 h-7 flex items-center justify-center rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
          style={{ color: '#6B7280' }}>
          <ChevronLeft className="w-3 h-3" />
        </button>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-12 gap-3" dir="rtl">

      {/* RIGHT Panel: Categories */}
      <div className="col-span-12 lg:col-span-4 bg-white rounded-lg border border-[#E5E7EB] flex flex-col overflow-hidden" style={{ minHeight: '580px' }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: '#F3F4F6' }}>
          <h3 className="text-[13px] font-bold" style={{ color: '#3D5E83' }}>الفئات الرئيسية والفرعية</h3>
          <p className="text-[11px] mt-0.5" style={{ color: '#9CA3AF' }}>فئات المتصلة بالكامل الرئيسية أو الفرعية</p>
        </div>
        <div className="px-3 py-2 relative">
          <Input type="text" value={categorySearch}
            onChange={(e) => { setCategorySearch(e.target.value); setCategoryPage(1); }}
            placeholder="ابحث باسم الفئة الرئيسية أو الفئة الفرعية"
            className="w-full px-2.5 py-1.5 ps-8 text-xs rounded-lg"
            style={{ fontSize: '12px', backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }} />
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#9CA3AF' }} />
        </div>
        <ScrollArea className="flex-1 px-2.5">
          {paginatedCategories.length === 0 ? (
            <div className="text-center py-12 text-xs" style={{ color: '#9CA3AF' }}>لا توجد نتائج</div>
          ) : (
            <div className="space-y-1 py-1">
              {paginatedCategories.map(category => {
                const isSelected = category.id === selectedCategoryId;
                return (
                  <div key={category.id} onClick={() => setSelectedCategoryId(category.id)}
                    className="px-3 py-2.5 rounded-lg cursor-pointer transition-all border"
                    style={{
                      backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                      borderColor: isSelected ? '#BFDBFE' : '#E5E7EB'
                    }}>
                    <div className="flex flex-wrap items-center gap-1" style={{ direction: 'rtl' }}>
                      {category.breadcrumb.map((part, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1">
                          <span style={{
                            color: idx === category.breadcrumb.length - 1
                              ?  '#374151'
                              : '#6B7280',
                            fontWeight: idx === category.breadcrumb.length - 1 ? 600 : 400,
                            fontSize: idx === category.breadcrumb.length - 1 ? '13px' : '11px'
                          }}>
                            {part}
                          </span>
                          {idx < category.breadcrumb.length - 1 && (
                            <span style={{ color: '#9CA3AF', fontSize: '10px', margin: '0 2px' }}>›</span>
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
        <div className="px-4 py-3 border-b flex items-start justify-between gap-2" style={{ borderColor: '#F3F4F6' }}>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-[13px] font-bold" style={{ color: '#3D5E83' }}>السمات</h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#E6E6E6', color: '#697181' }}>
                {filteredAttributes.length}
              </span>
            </div>
            <p className="text-[11px] mt-0.5" style={{ color: '#9CA3AF' }}>
              سمات فئة : {selectedCategory ? selectedCategory.name : '—'}
            </p>
          </div>
        </div>
        <div className="px-3 py-2 relative">
          <Input type="text" value={attributeSearch}
            onChange={(e) => { setAttributeSearch(e.target.value); setAttributePage(1); }}
            placeholder="ابحث باسم السمة"
            className="w-full px-2.5 py-1.5 ps-8 text-xs rounded-lg"
            style={{ fontSize: '12px', backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }} />
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#9CA3AF' }} />
        </div>
        <ScrollArea className="flex-1 px-2.5">
          {loadingAttributes ? (
            <div className="text-center py-12 text-xs" style={{ color: '#9CA3AF' }}>جاري التحميل...</div>
          ) : paginatedAttributes.length === 0 ? (
            <div className="text-center py-12 text-xs" style={{ color: '#9CA3AF' }}>لا توجد سمات</div>
          ) : (
            <div className="space-y-1 py-1">
              {paginatedAttributes.map(attribute => {
                const isSelected = selectedAttributes.has(attribute.id);
                return (
                  <div
                    key={attribute.id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg transition-all border"
                    style={{
                      
                      backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                      borderColor: isSelected ? '#BFDBFE' : '#E5E7EB',
                    }}
                  >
                    
                    <CustomToggle
                      checked={isSelected}
                      onChange={() => {
                        const newSelected = new Set(selectedAttributes);
                        isSelected ? newSelected.delete(attribute.id) : newSelected.add(attribute.id);
                        setSelectedAttributes(newSelected);
                      }}
                    />
                    <span style={{
                      fontSize: '13px',
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
        <div className="px-4 py-3 border-b flex items-start justify-between gap-2" style={{ borderColor: '#F3F4F6' }}>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-[13px] font-bold" style={{ color: '#3D5E83' }}>القيم</h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#E6E6E6', color: '#6B7280' }}>
                {filteredValues.length}
              </span>
            </div>
            <p className="text-[11px] mt-0.5" style={{ color: '#9CA3AF' }}>
              قيم سمة : {firstSelectedAttribute ? firstSelectedAttribute.title : '—'}
            </p>
          </div>
        </div>
        <div className="px-3 py-2 relative">
          <Input type="text" value={valueSearch}
            onChange={(e) => { setValueSearch(e.target.value); setValuePage(1); }}
            placeholder="ابحث عن القيمة"
            className="w-full px-2.5 py-1.5 ps-8 text-xs rounded-lg"
            style={{ fontSize: '12px', backgroundColor: '#F9FAFB', borderColor: '#E5E7EB' }} />
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#9CA3AF' }} />
        </div>
        <ScrollArea className="flex-1 px-2.5">
          {paginatedValues.length === 0 ? (
            <div className="text-center py-12 text-xs" style={{ color: '#9CA3AF' }}>لا توجد قيم</div>
          ) : (
            <div className="space-y-1 py-1">
              {paginatedValues.map(value => (
                <div key={value.id} className="px-3 py-2.5 rounded-lg transition-all border"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E7EB',
                    color: '#374151',
                    fontSize: '13px',
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
  );
}