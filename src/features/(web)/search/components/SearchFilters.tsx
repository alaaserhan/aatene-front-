"use client";

import { useState } from "react";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { Category, City, Tag, Attribute } from "@/src/features/(web)/searchAndFilter/api";
import { cn } from "@/src/lib/utils";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { DualRangeSlider } from "@/src/components/ui/DualRangeSlider";

export type SearchType = "products" | "services" | "stores" | "users";

interface FilterState {
    category_id?: number;
    city_id?: number;
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
    className?: string;
}

// Helper to build hierarchical category structure
function buildCategoryTree(categories: Category[]) {
    const parentCategories = categories.filter((c) => !c.parent_id || c.parent_id === null);
    const childrenMap = new Map<string, Category[]>();

    categories.forEach((cat) => {
        if (cat.parent_id) {
            const children = childrenMap.get(cat.parent_id) || [];
            children.push(cat);
            childrenMap.set(cat.parent_id, children);
        }
    });

    return { parentCategories, childrenMap };
}

export default function SearchFilters({
    type,
    filters,
    onFilterChange,
    categories = [],
    cities = [],
    tags = [],
    attributes = [],
    className,
}: SearchFiltersProps) {
    const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

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

    const cityOptions = [
        { value: "", label: "الكل" },
        ...cities.map((c) => ({ value: c.id.toString(), label: c.name })),
    ];

    const { parentCategories, childrenMap } = buildCategoryTree(categories);

    const handleCategorySelect = (categoryId: number | undefined) => {
        onFilterChange({
            ...filters,
            category_id: categoryId,
        });
    };

    // Range slider values
    const minVal = filters.min_price || 0;
    const maxVal = filters.max_price || 1000; // Default max if not set

    return (
        <div className={cn("flex flex-col gap-4", className)}>
            {/* Filter Header Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#3D5E83]" />
                <h2 className="text-xl font-medium ">فلتر</h2>
            </div>

            {/* Categories Card */}
            {type !== "users" && categories.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <FilterSection title="فئات">
                        <div className="flex flex-col gap-1">
                            {parentCategories.map((parent) => {
                                const children = childrenMap.get(parent.id.toString()) || [];
                                const hasChildren = children.length > 0;
                                const isExpanded = expandedCategories.has(parent.id);

                                return (
                                    <div key={parent.id}>
                                        <div className="flex items-center gap-2">
                                            {hasChildren && (
                                                <button
                                                    onClick={() => toggleCategoryExpand(parent.id)}
                                                    className="p-1 hover:bg-gray-100 rounded cursor-pointer"
                                                >
                                                    <ChevronDown
                                                        className={cn(
                                                            "w-4 h-4 text-gray-400 transition-transform",
                                                            isExpanded && "rotate-180"
                                                        )}
                                                    />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleCategorySelect(parent.id)}
                                                className={cn(
                                                    "flex-1 text-right py-2 px-3 rounded-lg text-sm transition-colors cursor-pointer",
                                                    filters.category_id === parent.id
                                                        ? "text-[#3D5E83] font-bold"
                                                        : "text-gray-600 hover:text-[#3D5E83]"
                                                )}
                                            >
                                                {parent.name} <span className="text-gray-400 font-normal">({parent.products_count})</span>
                                            </button>
                                        </div>

                                        {hasChildren && isExpanded && (
                                            <div className="mr-6 mt-1 flex flex-col gap-1 border-r-2 border-gray-200 pr-3">
                                                {children.map((child) => (
                                                    <button
                                                        key={child.id}
                                                        onClick={() => handleCategorySelect(child.id)}
                                                        className={cn(
                                                            "text-right py-2 px-3 rounded-lg text-sm transition-colors cursor-pointer",
                                                            filters.category_id === child.id
                                                                ? "text-[#3D5E83] font-medium"
                                                                : "text-gray-500 hover:text-[#3D5E83]"
                                                        )}
                                                    >
                                                        {child.name} <span className="text-gray-400">({child.products_count})</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </FilterSection>
                </div>
            )}

            {/* City Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <FilterSection title="المدينة">
                    <ReusableDropdown
                        options={cityOptions}
                        value={filters.city_id?.toString() || ""}
                        onChange={(val) =>
                            onFilterChange({
                                ...filters,
                                city_id: val ? parseInt(val) : undefined,
                            })
                        }
                        placeholder="الكل"
                    />
                </FilterSection>
            </div>


            {/* Attributes Cards (Separate card for each attribute) */}
            {attributes && attributes.length > 0 &&
                attributes.map((attr) => {
                    const selectedOptionId = attr.options.find(opt => filters.variation_options?.includes(opt.id))?.id;
                    const options = [
                        { value: "", label: `اختر ${attr.title}` },
                        ...attr.options.map(opt => ({ value: opt.id.toString(), label: opt.title }))
                    ];

                    return (
                        <div key={attr.id} className="bg-white rounded-xl border border-gray-200 p-5">
                            <FilterSection title={attr.title}>
                                <ReusableDropdown
                                    options={options}
                                    value={selectedOptionId?.toString() || ""}
                                    onChange={(val) => handleAttributeChange(attr.id, val)}
                                    placeholder={`اختر ${attr.title}`}
                                />
                            </FilterSection>
                        </div>
                    );
                })
            }


            {/* Tags Card */}
            {tags.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <FilterSection title="العلامات">
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => {
                                const isSelected = filters.tags?.includes(tag.id);
                                return (
                                    <button
                                        key={tag.id}
                                        onClick={() => handleTagToggle(tag.id)}
                                        className={cn(
                                            "px-4 py-2 rounded-full text-sm  transition-colors cursor-pointer",
                                            isSelected
                                                ? "bg-[#3D5E83] text-white"
                                                : "bg-[#E5E7EB]  hover:bg-gray-200"
                                        )}
                                    >
                                        {tag.title}
                                    </button>
                                )
                            })}
                        </div>
                    </FilterSection>
                </div>
            )}

            {/* Price Range Card */}
            {(type === "products" || type === "services") && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <FilterSection title="النطاق السعري">
                        <div className="flex flex-col gap-6 px-1 py-4">
                            <DualRangeSlider
                                min={0}
                                max={5000}
                                step={10}
                                value={[minVal, maxVal]}
                                onValueChange={(val) =>
                                    onFilterChange({
                                        ...filters,
                                        min_price: val[0],
                                        max_price: val[1],
                                    })
                                }
                                className="w-full"
                            />
                        </div>
                    </FilterSection>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 p-5 flex-col gap-3 hidden lg:flex">
                <button
                    onClick={() => onFilterChange(filters)}
                    className="w-full py-3 bg-[#3D5E83] text-white rounded-xl font-medium hover:bg-[#2D496A] transition-colors cursor-pointer"
                >
                    تطبيق الفلتر
                </button>
                <button
                    onClick={() => onFilterChange({})}
                    className="w-full py-2 text-[#3D5E83] text-sm font-medium hover:underline cursor-pointer"
                >
                    إعادة
                </button>
            </div>
        </div>
    );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-0">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-blue-4 rounded-full" />
                <h3 className="font-medium  text-lg">{title}</h3>
            </div>
            {children}
        </div>
    );
}
