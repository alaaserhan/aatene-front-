"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { SlidersHorizontal, ChevronDown, ChevronRight } from "lucide-react";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { DualRangeSlider } from "@/src/components/ui/DualRangeSlider";
import { Checkbox } from "@/src/components/ui/checkbox";
import DiscountFilter from "@/src/components/(web)/DiscountFilter";
import { getAttributePlaceholder } from "@/src/lib/attribute-placeholder";
import { cn } from "@/src/lib/utils";
import type { Attribute, Category } from "../api";
import type { SearchFilterOptions } from "../hooks";
import { SEARCH_TYPE_META, type FilterState, type SearchType } from "../types";
import { flattenCategoryTree, buildCategoryTree } from "../utils/categoryTree";

interface SearchFiltersProps {
    type: SearchType;
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    options: SearchFilterOptions;
    className?: string;
}

// Attributes (matched by title) rendered as multi-select instead of a single dropdown.
const MULTI_SELECT_ATTRIBUTES = ["اللون"];

// Real-estate attributes that make no sense as marketplace-wide filters.
const HIDDEN_ATTRIBUTES = ["عدد الطوابق", "عدد الغرف", "صفة المعلن", "عدد الحمامات", "مفروش؟", "العمر"];

export default function SearchFilters({
    type,
    filters,
    onFilterChange,
    options,
    className,
}: SearchFiltersProps) {
    const { categories, cities, attributes, priceRange } = options;
    const supports = SEARCH_TYPE_META[type].filters;

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

    const setAttributeOptions = (attribute: Attribute, optionIds: number[]) => {
        const ownIds = new Set(attribute.options.map((o) => o.id));
        const next = [...(filters.variation_options || []).filter((id) => !ownIds.has(id)), ...optionIds];
        onFilterChange({ ...filters, variation_options: next.length > 0 ? next : undefined });
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

    // Attribute options belong to a category, so they reset with it.
    const handleCategorySelect = (categoryId: number | undefined) => {
        onFilterChange({
            ...filters,
            category_id: categoryId,
            variation_options: undefined,
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

    const categorySummary = flatCategories.find((c) => c.id === filters.category_id)?.name;
    const citySummary = summarizeLabels(
        cities.filter((c) => filters.city_id?.includes(c.id)).map((c) => c.name)
    );
    const priceSummary =
        filters.min_price !== undefined || filters.max_price !== undefined
            ? `${minVal} – ${maxVal} ₪`
            : undefined;
    const ratingSummary = filters.review_rate ? ratingLabel(filters.review_rate) : undefined;
    const attributeSummary = (attr: Attribute) =>
        summarizeLabels(
            attr.options.filter((opt) => filters.variation_options?.includes(opt.id)).map((opt) => opt.title)
        );

    const visibleAttributes = supports.attributes
        ? attributes.filter((attr) => !HIDDEN_ATTRIBUTES.includes(attr.title))
        : [];

    return (
        <div className={cn("flex flex-col gap-0 bg-white rounded-xl border border-gray-200 overflow-hidden", className)}>
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-c2-navy-600" />
                    <h2 className="text-lg font-semibold">فلتر</h2>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        setManualCategoryPath(null);
                        onFilterChange({});
                    }}
                    className="text-sm text-c2-navy-600 hover:underline cursor-pointer"
                >
                    إعادة
                </button>
            </div>

            <div className="divide-y divide-gray-100">
                {supports.categories && categories.length > 0 && (
                    <FilterSection title="الفئات" defaultOpen={false} forceOpen={!!filters.category_id} summary={categorySummary}>
                        <div className="flex flex-col gap-2">
                            {canGoBackCategory && (
                                <button
                                    type="button"
                                    onClick={handleCategoryBack}
                                    className="mb-1 inline-flex items-center gap-2 text-sm font-medium text-c2-navy-600 hover:underline"
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
                                            ? "border-c2-navy-600 bg-c2-navy-50 font-bold text-c2-navy-600"
                                            : "border-gray-200 text-gray-600 hover:border-c2-navy-600"
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
                                                    ? "bg-c2-navy-50 font-bold text-c2-navy-600"
                                                    : "text-gray-600 hover:bg-gray-50 hover:text-c2-navy-600"
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
                                    className="mt-2 text-right text-xs font-medium text-gray-400 hover:text-c2-navy-600"
                                >
                                    إلغاء اختيار الفئة
                                </button>
                            )}
                        </div>
                    </FilterSection>
                )}

                <FilterSection title="المدن" defaultOpen={false} summary={citySummary}>
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

                {visibleAttributes.map((attr) => {
                    const selectedIds = attr.options
                        .filter((opt) => filters.variation_options?.includes(opt.id))
                        .map((opt) => opt.id.toString());
                    const placeholder = getAttributePlaceholder(attr.title);

                    return (
                        <FilterSection key={attr.id} title={attr.title} defaultOpen={false} summary={attributeSummary(attr)}>
                            {MULTI_SELECT_ATTRIBUTES.includes(attr.title) ? (
                                <ReusableDropdown
                                    multiple={true}
                                    options={attr.options.map((opt) => ({ value: opt.id.toString(), label: opt.title }))}
                                    value={selectedIds}
                                    onChange={(vals: string[]) => setAttributeOptions(attr, vals.map(Number))}
                                    placeholder={placeholder}
                                />
                            ) : (
                                <ReusableDropdown
                                    options={[
                                        { value: "", label: placeholder },
                                        ...attr.options.map((opt) => ({ value: opt.id.toString(), label: opt.title })),
                                    ]}
                                    value={selectedIds[0] ?? ""}
                                    onChange={(val: string) => setAttributeOptions(attr, val ? [Number(val)] : [])}
                                    placeholder={placeholder}
                                />
                            )}
                        </FilterSection>
                    );
                })}

                {supports.price && (
                    <FilterSection title="السعر" defaultOpen={false} summary={priceSummary}>
                        <div className="flex flex-col gap-6 px-1 py-2">
                            <DualRangeSlider
                                min={sliderMin}
                                max={sliderMax}
                                step={1}
                                value={[minVal, maxVal]}
                                onValueChange={([min, max]) =>
                                    onFilterChange({
                                        ...filters,
                                        // A thumb left at its end of the range is no limit at all.
                                        min_price: min > sliderMin ? min : undefined,
                                        max_price: max < sliderMax ? max : undefined,
                                    })
                                }
                                className="w-full"
                            />
                        </div>
                    </FilterSection>
                )}

                {supports.discount && (
                    <div className="px-5 py-4">
                        <DiscountFilter
                            value={filters.has_discount}
                            onChange={(value) => onFilterChange({ ...filters, has_discount: value })}
                        />
                    </div>
                )}

                {/* Review rate - shown for every search type */}
                <FilterSection title="التقييم" defaultOpen={false} summary={ratingSummary}>
                    <div className="flex flex-col gap-3">
                        {[5, 4, 3, 2, 1].map((rate) => {
                            const checked = filters.review_rate === rate;
                            return (
                                <label key={rate} className="flex items-center gap-3 cursor-pointer">
                                    <Checkbox
                                        checked={checked}
                                        onCheckedChange={() =>
                                            onFilterChange({ ...filters, review_rate: checked ? undefined : rate })
                                        }
                                        aria-label={ratingLabel(rate)}
                                        className="ms-2 size-4 rounded-xs border-gray-300 bg-white shadow-none hover:border-gray-400 data-[state=checked]:border-blue-4 data-[state=checked]:bg-blue-5 data-[state=checked]:text-blue-4 [&_svg]:size-3.5 [&_svg]:stroke-3"
                                    />
                                    <div className="flex gap-1 items-center" dir="ltr">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className={cn("w-4 h-4", i < rate ? "text-c2-warning" : "text-gray-300")} fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </FilterSection>
            </div>

            {/* Filters apply as they change; kept as the familiar end-of-panel action. */}
            <div className="px-5 py-4 border-t border-gray-100 hidden lg:flex flex-col gap-2">
                <button
                    type="button"
                    onClick={() => onFilterChange(filters)}
                    className="w-full py-2.5 bg-c2-navy-600 text-white rounded-xl font-medium hover:bg-c2-navy-700 transition-colors cursor-pointer"
                >
                    تطبيق الفلتر ›
                </button>
            </div>
        </div>
    );
}

// Joins selected labels, collapsing anything past the first two into "+N".
function summarizeLabels(labels: string[]): string | undefined {
    if (labels.length === 0) return undefined;
    if (labels.length <= 2) return labels.join("، ");
    return `${labels.slice(0, 2).join("، ")} +${labels.length - 2}`;
}

function ratingLabel(rate: number): string {
    if (rate === 1) return "نجمة واحدة";
    if (rate === 2) return "نجمتان";
    return `${rate} نجوم`;
}

interface FilterSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    forceOpen?: boolean;
    /** Short text of the applied value; marks the section as active and shows under the title while collapsed. */
    summary?: string;
}

function FilterSection({ title, children, defaultOpen = true, forceOpen, summary }: FilterSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen || !!forceOpen);
    const prevForceOpen = useRef(forceOpen);
    const isActive = !!summary;

    useEffect(() => {
        // Only open on a false -> true transition; never force it closed.
        if (forceOpen && !prevForceOpen.current) {
            setIsOpen(true);
        }
        prevForceOpen.current = forceOpen;
    }, [forceOpen]);

    return (
        <div className={cn("px-5 py-4 transition-colors", isActive && !isOpen && "bg-c2-navy-50/60")}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                className="flex items-center justify-between gap-3 w-full cursor-pointer mb-0 text-start"
            >
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className={cn("text-base", isActive ? "font-semibold text-c2-navy-700" : "font-medium text-gray-800")}>
                            {title.trim()}
                        </h3>
                        {isActive && (
                            <span className="size-2 rounded-full bg-c2-navy-600 shrink-0" aria-label="مُطبّق" />
                        )}
                    </div>
                    {isActive && !isOpen && (
                        <p className="mt-0.5 text-xs text-c2-navy-600 truncate">{summary}</p>
                    )}
                </div>
                <ChevronDown className={cn("w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
            </button>
            {isOpen && <div className="mt-3">{children}</div>}
        </div>
    );
}
