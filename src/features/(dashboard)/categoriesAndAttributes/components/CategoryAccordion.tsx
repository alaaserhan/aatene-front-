// src/features/(dashboard)/categoriesAndAttributes/components/CategoryAccordion.tsx
"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Category, Attribute, AttributeOption } from "../api";
import { useGetSubCategories } from "../hooks";

interface AttributeOptionRowProps {
  option: AttributeOption;
  onDelete: () => void;
  level: number;
}

function AttributeOptionRow({
  option,
  onDelete,
  level,
}: AttributeOptionRowProps) {
  return (
    <div
      className="flex items-center gap-1 p-2 border border-input rounded mb-2"
      style={{ marginInlineEnd: `${level * 3.5}rem` }}
    >
      <button
        onClick={onDelete}
        className="p-3 bg-[#FB37481A]  hover:bg-[#FB374830] transition-colors cursor-pointer flex-shrink-0"
      >
        <img
          src="/icons/dashboard/trash.svg"
          alt="Delete"
          className="w-4 h-4"
        />
      </button>

      <div className="flex-1 ms-4">
        <span className="text-sm font-medium pe-2 flex justify-end">
          {option.title}
        </span>
      </div>
    </div>
  );
}

type CategoryProps = {
  item: Category;
  itemType: "category";
  selectedCategories: Set<number>;
  onToggleCategory: (id: number) => void;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: number) => void;
  onAddSubCategory: (parentId: number, name: string) => void;
  onViewImages: (images: string[]) => void;
  level: number;
};

type AttributeProps = {
  item: Attribute;
  itemType: "attribute";
  onEdit: (attribute: Attribute) => void;
  onDelete: (attributeId: number) => void;
  onAddOption: (attribute: Attribute) => void;
  onDeleteOption: (optionId: number, attribute: Attribute) => void;
  level: number;
};

type AccordionProps = CategoryProps | AttributeProps;

function AttributeAccordionContent(props: AttributeProps) {
  const {
    item: attribute,
    onEdit,
    onDelete,
    onAddOption,
    onDeleteOption,
    level,
  } = props;

  const [isExpanded, setIsExpanded] = useState(false);
  const hasOptions = attribute.options.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-1 p-2 border border-input rounded mb-2"
        style={{ marginInlineEnd: `${level * 3.5}rem` }}
      >
        <button
          onClick={() => onDelete(attribute.id)}
          className="p-3 bg-[#FB37481A]  hover:bg-[#FB374830] transition-colors cursor-pointer flex-shrink-0"
        >
          <img
            src="/icons/dashboard/trash.svg"
            alt="Delete"
            className="w-4 h-4"
          />
        </button>

        <button
          onClick={() => onEdit(attribute)}
          className="p-3 bg-blue-5  hover:bg-blue-50 transition-colors cursor-pointer flex-shrink-0"
        >
          <img src="/icons/dashboard/edit3.svg" alt="Edit" className="w-4 h-4" />
        </button>

        <div className={cn("flex items-center gap-0 flex-1 ms-4 justify-end")}>
          <span className="text-sm font-medium pe-2">{attribute.title}</span>

          {hasOptions && (
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

      {hasOptions && isExpanded && (
        <div>
          {attribute.options.map((option) => (
            <AttributeOptionRow
              key={option.id}
              option={option}
              onDelete={() => onDeleteOption(option.id, attribute)}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryAccordionContent(props: CategoryProps) {
  const {
    item: category,
    selectedCategories,
    onToggleCategory,
    onEdit,
    onDelete,
    onAddSubCategory,
    onViewImages,
    level,
  } = props;

  const [isExpanded, setIsExpanded] = useState(false);

  const imageUrls = category?.images_urls || category?.images || [];
  const images = imageUrls.filter((img) => img && img.trim() !== "");

  const subCategoriesCount = Number(category.sub_categories_count || 0);
  const hasSubCategories = subCategoriesCount > 0;

  const {
    data: subCategoriesData,
    isLoading,
    isError,
  } = useGetSubCategories(
    category?.id,
    category?.type as "product" | "service",
    {
      enabled: isExpanded,
    }
  );

  return (
    <div>
      <div
        className="flex items-center gap-1 p-2 border border-input rounded mb-2"
        style={{ marginInlineEnd: level === 0 ? "0rem" : `${level * 3.5}rem` }}
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
          <img src="/icons/dashboard/edit3.svg" alt="Edit" className="w-4 h-4" />
        </button>

        <button
          onClick={() => onAddSubCategory(category.id, category?.name)}
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

        {category.type === "product" && (
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
              <div className="flex-shrink-0 w-10 h-10 rounded flex items-center justify-center text-sm font-medium text-gray-600 bg-gray-50">
                +{images.length - 4}
              </div>
            )}
          </div>
        )}

        <div
          className={cn(
            "flex items-center gap-0 flex-shrink-0",
            category.type === "service" && "flex-1 ms-4 justify-end"
          )}
        >
          <span className="text-sm font-medium pe-2">{category?.name}</span>

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
        <div>
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
                item={subCat}
                itemType="category"
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

export function CategoryAccordion(props: AccordionProps) {
  if (props.itemType === "attribute") {
    return <AttributeAccordionContent {...props} />;
  }

  if (props.itemType === "category") {
    return <CategoryAccordionContent {...props} />;
  }

  return null;
}