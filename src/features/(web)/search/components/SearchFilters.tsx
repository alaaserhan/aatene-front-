"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { Category, City, Tag, Attribute, PriceRange } from "@/src/features/(web)/searchAndFilter/api";
import { cn } from "@/src/lib/utils";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
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

function CategoryTreeNode({
    category,
    depth,
    childrenMap,
    expandedCategories,
    toggleCategoryExpand,
    filters,
    handleCategorySelect,
    searchType,
}: {
    category: Category;
    depth: number;
    childrenMap: Map<string, Category[]>;
    expandedCategories: Set<number>;
    toggleCategoryExpand: (id: number) => void;
    filters: FilterState;
    handleCategorySelect: (id: number | undefined) => void;
    searchType: SearchType;
}) {
    const children = childrenMap.get(category.id.toString()) || [];
    const hasChildren = children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const count =
        searchType === "services" ? category.services_count : category.products_count;
    const isSelected = filters.category_id === category.id;
    const labelClass =
        depth === 0
            ? isSelected
                ? "text-[#3D5E83] font-bold"
                : "text-gray-600 hover:text-[#3D5E83]"
            : isSelected
              ? "text-[#3D5E83] font-medium"
              : "text-gray-500 hover:text-[#3D5E83]";

    return (
        <div>
            <div className="flex items-center gap-2">
                <div className="w-6 shrink-0 flex justify-center">
                    {hasChildren ? (
                        <button
                            type="button"
                            onClick={() => toggleCategoryExpand(category.id)}
                            className="p-1 hover:bg-gray-100 rounded cursor-pointer"
                        >
                            <ChevronDown
                                className={cn(
                                    "w-4 h-4 text-gray-400 transition-transform",
                                    isExpanded && "rotate-180"
                                )}
                            />
                        </button>
                    ) : null}
                </div>
                <button
                    type="button"
                    onClick={() => handleCategorySelect(category.id)}
                    className={cn(
                        "flex-1 text-right py-2 px-3 rounded-lg text-sm transition-colors cursor-pointer",
                        labelClass
                    )}
                >
                    {category.name}{" "}
                    <span className="text-gray-400 font-normal">({count})</span>
                </button>
            </div>
            {hasChildren && isExpanded && (
                <div className="mr-6 mt-1 flex flex-col gap-1 border-r-2 border-gray-200 pr-3">
                    {children.map((child) => (
                        <CategoryTreeNode
                            key={child.id}
                            category={child}
                            depth={depth + 1}
                            childrenMap={childrenMap}
                            expandedCategories={expandedCategories}
                            toggleCategoryExpand={toggleCategoryExpand}
                            filters={filters}
                            handleCategorySelect={handleCategorySelect}
                            searchType={searchType}
                        />
                    ))}
                </div>
            )}
        </div>
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
    const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
    const [citySearch, setCitySearch] = useState("");

    const flatCategories = useMemo(
        () => flattenCategoryTree(categories),
        [categories]
    );

    /** عند اختيار فئة فرعية نوسّع سلسلة الآباء حتى تبقى الفئة الظاهرة */
    useEffect(() => {
        const cid = filters.category_id;
        if (cid == null || flatCategories.length === 0) return;
        const selected = flatCategories.find((c) => c.id === cid);
        if (!selected?.parent_id) return;
        setExpandedCategories((prev) => {
            const next = new Set(prev);
            let pid: number | null = parseInt(String(selected.parent_id), 10);
            while (pid != null && !Number.isNaN(pid)) {
                next.add(pid);
                const p = flatCategories.find((c) => c.id === pid);
                pid =
                    p?.parent_id != null && String(p.parent_id) !== ""
                        ? parseInt(String(p.parent_id), 10)
                        : null;
            }
            return next;
        });
    }, [filters.category_id, flatCategories]);

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

    const toggleCategoryExpand = (categoryId: number) => {
        setExpandedCategories((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

    const cityOptions = cities
        .filter((c) => !citySearch.trim() || c.name.toLowerCase().includes(citySearch.trim().toLowerCase()))
        .map((c) => ({ value: c.id.toString(), label: c.name }));

    const { parentCategories, childrenMap } = buildCategoryTree(flatCategories);

    const handleCategorySelect = (categoryId: number | undefined) => {
        onFilterChange({
            ...filters,
            category_id: categoryId,
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
                    onClick={() => onFilterChange({})}
                    className="text-sm text-[#3D5E83] hover:underline cursor-pointer"
                >
                    إعادة
                </button>
            </div>

            <div className="divide-y divide-gray-100">
                {/* Categories */}
                {categories.length > 0 && (
                    <FilterSection title="الفئات" defaultOpen={true} forceOpen={!!filters.category_id}>
                        <div className="flex flex-col gap-1">
                            {parentCategories.map((parent) => (
                                <CategoryTreeNode
                                    key={parent.id}
                                    category={parent}
                                    depth={0}
                                    childrenMap={childrenMap}
                                    expandedCategories={expandedCategories}
                                    toggleCategoryExpand={toggleCategoryExpand}
                                    filters={filters}
                                    handleCategorySelect={handleCategorySelect}
                                    searchType={type}
                                />
                            ))}
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
                {attributes && attributes.length > 0 && attributes.map((attr) => {
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
                })}

                {/* Price Range */}
                {(type === "products" || type === "services") && (
                    <FilterSection title=" السعر" defaultOpen={false}>
                        <div className="flex flex-col gap-6 px-1 py-2">
                            <DualRangeSlider
                                min={sliderMin}
                                max={sliderMax}
                                step={10}
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
