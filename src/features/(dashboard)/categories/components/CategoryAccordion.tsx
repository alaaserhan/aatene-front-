// src/features/(dashboard)/categories/components/CategoryAccordion.tsx
"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Category } from "../api";
import { useGetSubCategories } from "../hooks";

interface CategoryAccordionProps {
  category: Category;
  selectedCategories: Set<number>;
  onToggleCategory: (id: number) => void;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: number) => void;
  onAddSubCategory: (parentId: number) => void;
  onViewImages: (images: string[]) => void;
  level: number;
}

export function CategoryAccordion({
  category,
  selectedCategories,
  onToggleCategory,
  onEdit,
  onDelete,
  onAddSubCategory,
  onViewImages,
  level,
}: CategoryAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const images = category.images_urls
    ? category.images_urls.split(",")
    : category.images || [];
  const subCategoriesCount = Number(category.sub_categories_count || 0);
  const hasSubCategories = subCategoriesCount > 0;

  const {
    data: subCategoriesData,
    isLoading,
    isError,
  } = useGetSubCategories(
    category.id,
    category.type as "product" | "service"
  );

  return (
    <div
    >
      <div
        className="flex items-center gap-1 p-2 border border-input rounded mb-2"
        style={{ marginInlineEnd: level === 0 ? "1rem" : `${level * 3.5}rem` }}
      >
        <button
          onClick={() => onDelete(category.id)}
          className="p-3 bg-[#FB37481A]  hover:bg-[#FB374830] transition-colors cursor-pointer flex-shrink-0"
        >
          <img
            src="/icons/dashboard/trash.svg"
            alt="Delete"
            className="w-4 h-4"
          />
        </button>

        <button
          onClick={() => onEdit(category)}
          className="p-3 bg-blue-5  hover:bg-blue-50 transition-colors cursor-pointer flex-shrink-0"
        >
          <img src="/icons/dashboard/pin.svg" alt="Edit" className="w-4 h-4" />
        </button>

        <button
          onClick={() => onAddSubCategory(category.id)}
          className="p-3 bg-[#00D9C01A]  hover:bg-[#00D9C030] transition-colors cursor-pointer flex-shrink-0"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 3.33333V12.6667M3.33333 8H12.6667"
              stroke="#00D9C0"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="flex gap-2 flex-1 overflow-x-auto ms-4">
          {images.slice(0, 4).map((img, idx) => (
            <button
              key={idx}
              onClick={() => onViewImages(images)}
              className="flex-shrink-0 w-10 h-10 rounded overflow-hidden  hover:border-blue-3 transition-colors cursor-pointer"
            >
              <img
                src={img}
                alt={`${category.name} ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
          {images.length > 4 && (
            <div className="flex-shrink-0 w-full h-full rounded flex items-center justify-center text-sm font-medium text-gray-600">
              +{images.length - 4}
            </div>
          )}
        </div>

        <div className="flex items-center gap-0 flex-shrink-0">
          <span className="text-sm font-medium pe-2">
            {category.name}
          </span>

          {hasSubCategories && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-2" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-2" />
              )}
            </button>
          )}
        </div>
      </div>

      {hasSubCategories && isExpanded && (
        <div >
          {isLoading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-5 h-5 animate-spin text-blue-3" />
            </div>
          )}
          {isError && (
            <p className="text-sm text-red-500 text-center p-4">
              حدث خطأ في جلب الأقسام الفرعية
            </p>
          )}
          {subCategoriesData?.data &&
            subCategoriesData.data.map((subCat) => (
              <CategoryAccordion
                key={subCat.id}
                category={subCat}
                selectedCategories={selectedCategories}
                onToggleCategory={onToggleCategory}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddSubCategory={onAddSubCategory}
                onViewImages={onViewImages}
                level={level + 1}
              />
            ))}
        </div>
      )}
    </div>
  );
}