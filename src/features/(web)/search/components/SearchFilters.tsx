"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { Category, City, Tag, Attribute, PriceRange } from "@/src/features/(web)/searchAndFilter/api";
import { cn } from "@/src/lib/utils";
import { SlidersHorizontal, ChevronDown, ChevronRight } from "lucide-react";
import { DualRangeSlider } from "@/src/components/ui/DualRangeSlider";
import {
    flattenCategoryTree,
    buildCategoryTree,
} from "@/src/features/(web)/search/utils/categoryTree";

export type SearchType = "products" | "services" | "stores" | "users";

export interface FilterState {
    category_id?: number;
    city_id?: number[];
    tags?: number[];
    min_price?: number;
    max_price?: number;
    review_rate?: number;
    variation_options?: number[];
}

interface SearchFiltersProps {
    type: SearchType;
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    categories?: Category[];
    cities?: City[];
    tags?: Tag[];
    attributes?: Attribute[];
    priceRange?: PriceRange;
    className?: string;
}

// ─── Custom Checkbox Rating UI ─────────────────────────────────────────────
interface CustomRatingCheckboxProps {
    isActive: boolean;
    onChange: () => void;
}

function CustomRatingCheckbox({ isActive, onChange }: CustomRatingCheckboxProps) {
    return (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault();
                onChange();
            }}
            className={cn(
                "w-4 h-4 rounded-xs border transition-colors flex items-center justify-center ms-2 shrink-0",
                "cursor-pointer",
                isActive
                    ? "bg-blue-5 border-blue-4"
                    : "bg-white border-gray-300 hover:border-gray-400"
            )}
            aria-checked={isActive}
            role="checkbox"
        >
            {isActive && (
                <svg
                    className="w-3.5 h-3.5 text-blue-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                    />
                </svg>
            )}
        </button>
    );
}

export default function SearchFilters({
    type,
    filters,
    onFilterChange,
    categories = [],
    cities = [],
    tags = [],
    attributes = [],
    priceRange,
    className,
}: SearchFiltersProps) {
    const [manualCategoryPath, setManualCategoryPath] = useState<{
        categoryId?: number;
        path: Category[];
    } | null>(null);
    const [citySearch, setCitySearch] = useState("");

    const flatCategories = useMemo(
        () => flattenCategoryTree(categories),
        [categories]
    );

    const { parentCategories, childrenMap } = useMemo(
        () => buildCategoryTree(flatCategories),
        [flatCategories]
    );

    const derivedCategoryPath = useMemo(() => {
        const cid = filters.category_id;
        if (cid == null || flatCategories.length === 0) return [];

        const byId = new Map(flatCategories.map((category) => [category.id, category]));
        const selected = byId.get(cid);
        if (!selected) return [];

        const fullPath: Category[] = [];
        let cursor: Category | undefined = selected;
        while (cursor) {
            fullPath.unshift(cursor);
            const parentId: number =
                cursor.parent_id != null && cursor.parent_id !== ""
                    ? Number(cursor.parent_id)
                    : NaN;
            cursor = Number.isFinite(parentId) ? byId.get(parentId) : undefined;
        }

        const selectedHasChildren = (childrenMap.get(selected.id.toString()) || []).length > 0;
        return selectedHasChildren ? fullPath : fullPath.slice(0, -1);
    }, [childrenMap, filters.category_id, flatCategories]);

    const handleTagToggle = (tagId: number) => {
        const currentTags = filters.tags || [];
        const newTags = currentTags.includes(tagId)
            ? currentTags.filter((id) => id !== tagId)
            : [...currentTags, tagId];
        onFilterChange({ ...filters, tags: newTags });
    };

    const handleAttributeChange = (attributeId: number, optionId: string) => {
        const selectedOptionId = parseInt(optionId);
        if (isNaN(selectedOptionId)) {
            const attribute = attributes.find(a => a.id === attributeId);
            if (attribute) {
                const optionIdsToRemove = attribute.options.map(o => o.id);
                const newOptions = (filters.variation_options || []).filter(id => !optionIdsToRemove.includes(id));
                onFilterChange({ ...filters, variation_options: newOptions });
            }
            return;
        }

        const attribute = attributes.find(a => a.id === attributeId);
        if (!attribute) return;

        const optionIdsToRemove = attribute.options.map(o => o.id);
        const currentOptions = filters.variation_options || [];
        const newOptions = [
            ...currentOptions.filter(id => !optionIdsToRemove.includes(id)),
            selectedOptionId
        ];

        onFilterChange({ ...filters, variation_options: newOptions });
    };

    const cityOptions = cities
        .filter((c) => !citySearch.trim() || c.name.toLowerCase().includes(citySearch.trim().toLowerCase()))
        .map((c) => ({ value: c.id.toString(), label: c.name }));

    const categoryPath =
        manualCategoryPath !== null && manualCategoryPath.categoryId === filters.category_id
            ? manualCategoryPath.path
            : derivedCategoryPath;
    const activeCategory = categoryPath[categoryPath.length - 1];
    const visibleCategories = activeCategory
        ? childrenMap.get(activeCategory.id.toString()) || []
        : parentCategories;
    const canGoBackCategory = categoryPath.length > 0;

    const handleCategorySelect = (categoryId: number | undefined) => {
        onFilterChange({
            ...filters,
            category_id: categoryId,
        });
    };

    const handleCategoryClear = () => {
        setManualCategoryPath(null);
        handleCategorySelect(undefined);
    };

    const handleCategoryDrilldown = (category: Category) => {
        const children = childrenMap.get(category.id.toString()) || [];
        const nextPath = children.length > 0 ? [...categoryPath, category] : categoryPath;
        setManualCategoryPath({ categoryId: category.id, path: nextPath });
        handleCategorySelect(category.id);
    };

    const handleCategoryBack = () => {
        setManualCategoryPath({
            categoryId: filters.category_id,
            path: categoryPath.slice(0, -1),
        });
    };

    // Dynamic price range from API (products/services search-page)
    const sliderMin = useMemo(() => {
        const parsed = Number(priceRange?.min);
        return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
    }, [priceRange?.min]);
    const sliderMax = useMemo(() => {
        const parsed = Number(priceRange?.max);
        if (!Number.isFinite(parsed)) return 5000;
        return Math.max(sliderMin, Math.ceil(parsed));
    }, [priceRange?.max, sliderMin]);

    const minVal = filters.min_price ?? sliderMin;
    const maxVal = filters.max_price ?? sliderMax;

    return (
        <div className={cn("flex flex-col gap-0 bg-white rounded-xl border border-gray-200 overflow-hidden", className)}>
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-[#3D5E83]" />
                    <h2 className="text-lg font-semibold">فلتر</h2>
                </div>
                <button
                    onClick={() => {
                        setManualCategoryPath(null);
                        onFilterChange({});
                    }}
                    className="text-sm text-[#3D5E83] hover:underline cursor-pointer"
                >
                    إعادة
                </button>
            </div>

            <div className="divide-y divide-gray-100">
                {/* Categories */}
                {type !== "stores" && categories.length > 0 && (
                    <FilterSection title="الفئات" defaultOpen={false} forceOpen={!!filters.category_id}>
                        <div className="flex flex-col gap-2">
                            {canGoBackCategory && (
                                <button
                                    type="button"
                                    onClick={handleCategoryBack}
                                    className="mb-1 inline-flex items-center gap-2 text-sm font-medium text-[#3D5E83] hover:underline"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                    رجوع
                                </button>
                            )}

                            {activeCategory && (
                                <button
                                    type="button"
                                    onClick={() => handleCategorySelect(activeCategory.id)}
                                    className={cn(
                                        "w-full rounded-lg border px-3 py-2 text-right text-sm transition-colors",
                                        filters.category_id === activeCategory.id
                                            ? "border-[#3D5E83] bg-[#EEF3FB] font-bold text-[#3D5E83]"
                                            : "border-gray-200 text-gray-600 hover:border-[#3D5E83]"
                                    )}
                                >
                                    {activeCategory.name}
                                </button>
                            )}

                            <div className="flex flex-col gap-1">
                                {visibleCategories.map((category) => {
                                    const children = childrenMap.get(category.id.toString()) || [];
                                    const hasChildren = children.length > 0;
                                    const count =
                                        type === "services" ? category.services_count : category.products_count;
                                    const isSelected = filters.category_id === category.id;

                                    return (
                                        <button
                                            key={category.id}
                                            type="button"
                                            onClick={() => handleCategoryDrilldown(category)}
                                            className={cn(
                                                "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                                                isSelected
                                                    ? "bg-[#EEF3FB] font-bold text-[#3D5E83]"
                                                    : "text-gray-600 hover:bg-gray-50 hover:text-[#3D5E83]"
                                            )}
                                        >
                                            <span className="min-w-0 flex-1 truncate text-right">
                                                {category.name}{" "}
                                                <span className="font-normal text-gray-400">({count})</span>
                                            </span>
                                            {hasChildren && <ChevronRight className="h-4 w-4 shrink-0 rotate-180 text-gray-400" />}
                                        </button>
                                    );
                                })}
                            </div>

                            {filters.category_id && (
                                <button
                                    type="button"
                                    onClick={handleCategoryClear}
                                    className="mt-2 text-right text-xs font-medium text-gray-400 hover:text-[#3D5E83]"
                                >
                                    إلغاء اختيار الفئة
                                </button>
                            )}
                        </div>
                    </FilterSection>
                )}
                {/* City */}
                <FilterSection title="المدن" defaultOpen={false}>
                    <ReusableDropdown
                        multiple={true}
                        options={cityOptions}
                        value={filters.city_id?.map(String) || []}
                        onChange={(vals: string[]) =>
                            onFilterChange({ ...filters, city_id: vals.length > 0 ? vals.map(Number) : undefined })
                        }
                        placeholder="الكل"
                        onSearch={(q) => setCitySearch(q)}
                        searchPlaceholder="ابحث عن مدينة..."
                    />
                </FilterSection>

                {/* Attributes */}
                {attributes && attributes.length > 0 && (
                    attributes
                    .filter(attr => !["عدد الطوابق", "عدد الغرف", "صفة المعلن", "عدد الحمامات", "مفروش؟", "العمر"].includes(attr.title))
                    .map((attr) => {
                    const selectedOptionId = attr.options.find(opt => filters.variation_options?.includes(opt.id))?.id;
                    const options = [
                        { value: "", label: `اختر ${attr.title}` },
                        ...attr.options.map(opt => ({ value: opt.id.toString(), label: opt.title }))
                    ];
                    return (
                        <FilterSection key={attr.id} title={attr.title} defaultOpen={false}>
                            <ReusableDropdown
                                options={options}
                                value={selectedOptionId?.toString() || ""}
                                onChange={(val: string) => handleAttributeChange(attr.id, val)}
                                placeholder={`اختر ${attr.title}`}
                            />
                        </FilterSection>
                    );
                    })
                )}

                {/* Price Range */}
                {(type === "products" || type === "services") && (
                    <FilterSection title=" السعر" defaultOpen={false}>
                        <div className="flex flex-col gap-6 px-1 py-2">
                            <DualRangeSlider
                                min={sliderMin}
                                max={sliderMax}
                                step={1}
                                value={[minVal, maxVal]}
                                onValueChange={(val) =>
                                    onFilterChange({ ...filters, min_price: val[0], max_price: val[1] })
                                }
                                className="w-full"
                            />
                        </div>
                    </FilterSection>
                )}

                {/* Review Rate - يظهر لجميع الأنواع */}
                <FilterSection title="التقييم" defaultOpen={false}>
                    <div className="flex flex-col gap-3">
                        {[5, 4, 3, 2, 1].map((rate) => (
                            <div key={rate} className="flex items-center gap-3">
                                <CustomRatingCheckbox
                                    isActive={filters.review_rate === rate}
                                    onChange={() =>
                                        onFilterChange({ ...filters, review_rate: filters.review_rate === rate ? undefined : rate })
                                    }
                                />
                                <div className="flex gap-1 items-center" dir="ltr">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className={cn("w-4 h-4", i < rate ? "text-[#FDB022]" : "text-gray-300")} fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </FilterSection>
            </div>

            {/* Apply Button */}
            <div className="px-5 py-4 border-t border-gray-100 hidden lg:flex flex-col gap-2">
                <button
                    onClick={() => onFilterChange(filters)}
                    className="w-full py-2.5 bg-[#3D5E83] text-white rounded-xl font-medium hover:bg-[#2D496A] transition-colors cursor-pointer"
                >
                    تطبيق الفلتر ›
                </button>
            </div>
        </div>
    );
}

function FilterSection({ title, children, defaultOpen = true, forceOpen }: { title: string; children: React.ReactNode; defaultOpen?: boolean; forceOpen?: boolean }) {
    const [isOpen, setIsOpen] = useState(defaultOpen || !!forceOpen);
    const prevForceOpen = useRef(forceOpen);

    useEffect(() => {
        // فقط لو forceOpen تغيّر من false → true نفتح، وليس العكس
        if (forceOpen && !prevForceOpen.current) {
            setIsOpen(true);
        }
        prevForceOpen.current = forceOpen;
    }, [forceOpen]);

    return (
        <div className="px-5 py-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full cursor-pointer mb-0"
            >
                <h3 className="font-medium text-base text-gray-800">{title}</h3>
                <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform duration-200", isOpen && "rotate-180")} />
            </button>
            {isOpen && <div className="mt-3">{children}</div>}
        </div>
    );
}
