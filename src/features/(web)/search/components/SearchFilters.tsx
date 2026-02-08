"use client";

import { useState } from "react";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { Category, City, Tag } from "@/src/features/(web)/searchAndFilter/api";
import { cn } from "@/src/lib/utils";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

export type SearchType = "products" | "services" | "stores" | "users";

interface FilterState {
    category_id?: number;
    city_id?: number;
    tags?: number[];
    min_price?: number;
    max_price?: number;
    review_rate?: number;
}

interface SearchFiltersProps {
    type: SearchType;
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    categories?: Category[];
    cities?: City[];
    tags?: Tag[];
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

    return (
        <div className={cn("bg-white rounded-xl border border-gray-100 p-5", className)}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                <SlidersHorizontal className="w-5 h-5 text-[#3D5E83]" />
                <h2 className="text-lg font-bold text-[#1F2A37]">فلتر</h2>
            </div>

            {/* Categories - for products, services, stores */}
            {type !== "users" && categories.length > 0 && (
                <FilterSection title="فئات">
                    <div className="flex flex-col gap-1">
                        {parentCategories.map((parent) => {
                            const children = childrenMap.get(parent.id.toString()) || [];
                            const hasChildren = children.length > 0;
                            const isExpanded = expandedCategories.has(parent.id);

                            return (
                                <div key={parent.id}>
                                    {/* Parent Category */}
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
                                                    ? "bg-blue-50 text-[#3D5E83] font-medium"
                                                    : "text-gray-600 hover:bg-gray-50"
                                            )}
                                        >
                                            {parent.name} ({parent.products_count})
                                        </button>
                                    </div>

                                    {/* Child Categories */}
                                    {hasChildren && isExpanded && (
                                        <div className="mr-6 mt-1 flex flex-col gap-1 border-r-2 border-gray-100 pr-3">
                                            {children.map((child) => (
                                                <button
                                                    key={child.id}
                                                    onClick={() => handleCategorySelect(child.id)}
                                                    className={cn(
                                                        "text-right py-2 px-3 rounded-lg text-sm transition-colors cursor-pointer",
                                                        filters.category_id === child.id
                                                            ? "bg-blue-50 text-[#3D5E83] font-medium"
                                                            : "text-gray-500 hover:bg-gray-50"
                                                    )}
                                                >
                                                    {child.name} ({child.products_count})
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </FilterSection>
            )}

            {/* City */}
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

            {/* Tags - shown for all types */}
            {tags.length > 0 && (
                <FilterSection title="العلامات">
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <button
                                key={tag.id}
                                onClick={() => handleTagToggle(tag.id)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-sm border transition-colors cursor-pointer",
                                    filters.tags?.includes(tag.id)
                                        ? "bg-[#3D5E83] text-white border-[#3D5E83]"
                                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                )}
                            >
                                {tag.title}
                            </button>
                        ))}
                    </div>
                </FilterSection>
            )}

            {/* Price Range - for products and services */}
            {(type === "products" || type === "services") && (
                <FilterSection title="النطاق السعري">
                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            placeholder="$50"
                            value={filters.min_price || ""}
                            onChange={(e) =>
                                onFilterChange({
                                    ...filters,
                                    min_price: e.target.value ? parseInt(e.target.value) : undefined,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-3"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="number"
                            placeholder="$200"
                            value={filters.max_price || ""}
                            onChange={(e) =>
                                onFilterChange({
                                    ...filters,
                                    max_price: e.target.value ? parseInt(e.target.value) : undefined,
                                })
                            }
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-3"
                        />
                    </div>
                </FilterSection>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mt-6 pt-4 border-t border-gray-100">
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
        <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 bg-[#3D5E83] rounded-full" />
                <h3 className="font-semibold text-[#1F2A37]">{title}</h3>
            </div>
            {children}
        </div>
    );
}
