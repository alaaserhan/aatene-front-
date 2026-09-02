// src/features/(dashboard)/products/components/sections/ProductBasicInfoFields.tsx
"use client";

import { ReactNode, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { ImageGallerySelector } from "@/src/components/ui/ImageGallerySelector";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { FormInput } from "@/src/components/ui/FormInput";
import { Label } from "@/src/components/ui/label";
import { RichTextEditor } from "@/src/components/ui/RichTextEditor";
import { cn } from "@/src/lib/utils";
import { Step1FormData } from "../../types";
import { CategoryPickerModal } from "../CategoryPickerModal";

const CONDITION_OPTIONS = [
  { value: "new", label: "جديد" },
  { value: "used", label: "مستعمل" },
];

interface ProductBasicInfoFieldsProps {
  value: Step1FormData;
  onChange: (patch: Partial<Step1FormData>) => void;
  errors: Record<string, string>;
  /**
   * Rendered beside حالة المنتج. When provided, الفئة takes a full row on its own
   * (used by the single-page create form, where القسم sits next to حالة المنتج).
   */
  sectionField?: ReactNode;
  /** Fires when focus leaves وصف المنتج (used to kick off the AI keywords generation) */
  onDescriptionBlur?: () => void;
  /** Rendered above معرض المنتج (used for اختيار المتجر in the create form) */
  headerField?: ReactNode;
  /** Rendered under وصف المنتج (used for الكلمات المفتاحية in the create form) */
  footerField?: ReactNode;
}

/** Shared basic-info fields for the product create/edit forms */
export function ProductBasicInfoFields({
  value,
  onChange,
  errors,
  sectionField,
  onDescriptionBlur,
  headerField,
  footerField,
}: ProductBasicInfoFieldsProps) {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  // Keeps the typed price around while "لا اريد اظهار السعر" is selected
  const [lastVisiblePrice, setLastVisiblePrice] = useState<number>(
    Number(value.price || 0),
  );

  const showPrice = !value.ask_for_price;

  const combinedFiles = useMemo(
    () => (value.cover ? [value.cover, ...value.gallery] : [...value.gallery]),
    [value.cover, value.gallery],
  );

  const combinedPreviews = useMemo(
    () =>
      value.cover_preview
        ? [value.cover_preview, ...value.gallery_previews]
        : [...value.gallery_previews],
    [value.cover_preview, value.gallery_previews],
  );

  const handleImagesChange = (files: string[], urls: string[]) => {
    onChange({
      cover: files[0] || "",
      cover_preview: urls[0] || "",
      gallery: files.length > 1 ? files.slice(1) : [],
      gallery_previews: urls.length > 1 ? urls.slice(1) : [],
    });
  };

  const categoryField = (
    <div className="space-y-2">
      <Label className="text-sm font-medium flex items-center gap-1">
        اختر الفئة <span className="text-red-500">*</span>
      </Label>
      <button
        type="button"
        name="category_id"
        onClick={() => setIsCategoryModalOpen(true)}
        className={cn(
          "w-full h-11 flex items-center justify-between px-4 border rounded-sm text-sm transition-colors focus:outline-none bg-white",
          errors.category_id
            ? "border-red-500"
            : "border-gray-200 hover:border-gray-300",
        )}
      >
        <span
          className={cn(
            "truncate text-right",
            value.category_name ? "text-gray-900" : "text-gray-400",
          )}
        >
          {value.category_name || "اختر فئة المنتج"}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ms-2" />
      </button>
      {errors.category_id && (
        <p className="text-xs text-red-500">{errors.category_id}</p>
      )}
    </div>
  );

  const conditionField = (
    <div className="space-y-2">
      <Label className="text-sm font-medium">حالة المنتج</Label>
      <ReusableDropdown
        options={CONDITION_OPTIONS}
        value={value.condition}
        onChange={(condition) =>
          onChange({ condition: condition as "new" | "used" })
        }
        placeholder="اختر الحالة"
        className="h-11"
      />
    </div>
  );

  return (
    <div className="space-y-8">
      {headerField}

      <FormInput
        label="اسم المنتج"
        name="name"
        value={value.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="ادخل اسم المنتج"
        hint="قم بتضمين الكلمات الرئيسية التي يستخدمها المشترون للبحث عن هذا العنصر."
        required
        maxLength={140}
        showCounter
        error={errors.name}
      />

      <div id="product-step1-cover">
        <ImageGallerySelector
          label="صور المنتج"
          subLabel="حتى 10 ملفات — العنصر الأول يُحفظ كغلاف المنتج"
          value={combinedFiles}
          previews={combinedPreviews}
          onChange={handleImagesChange}
          maxFiles={10}
          error={errors.cover}
          showMainSelector
          mainImageLabel="الصورة الأساسية"
          showDragHint
          mainImageAllowedMediaTypes={["image"]}
          allowedMediaTypes={["image", "gallery", "video"]}
          uploadPrimaryText="أضف أو اسحب صورة أو فيديو"
          uploadSecondaryText="الموضع الأول: تبويب الصور — الفيديو: تبويب المعرض"
          required
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-1">
          اختار طريقة ظهور سعر سلعتك! <span className="text-red-500">*</span>
        </Label>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() =>
              onChange({
                ask_for_price: false,
                price: value.price > 0 ? value.price : lastVisiblePrice,
              })
            }
            className={cn(
              "w-full border rounded-sm p-3 text-right transition-colors",
              showPrice
                ? "border-blue-4 bg-[#EEF3FB]"
                : "border-gray-200 bg-[#F8F8F8]",
            )}
          >
            <div className="flex items-center gap-3 text-sm">
              <span
                className={cn(
                  "shrink-0 w-4 h-4 rounded-full border flex items-center justify-center",
                  showPrice ? "border-blue-4" : "border-gray-400",
                )}
                aria-hidden
              >
                {showPrice && (
                  <span className="w-2 h-2 rounded-full bg-blue-4" />
                )}
              </span>
              <span
                className={cn(
                  "text-right",
                  showPrice ? "text-blue-4" : "text-gray-700",
                )}
              >
                إظهار السعر
              </span>
            </div>

            {showPrice && (
              <div className="mt-3">
                <input
                  type="number"
                  name="price"
                  min="0"
                  value={value.price || ""}
                  onChange={(e) => {
                    const parsedPrice = Number(e.target.value);
                    onChange({ price: parsedPrice });
                    if (parsedPrice > 0) setLastVisiblePrice(parsedPrice);
                  }}
                  placeholder="ادخل سعر السلعة"
                  className={cn(
                    "w-full px-4 py-2 border rounded-sm focus:outline-none text-sm bg-white",
                    errors.price ? "border-red-500" : "border-gray-200",
                  )}
                />
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (value.price > 0) setLastVisiblePrice(value.price);
              onChange({ ask_for_price: true, price: 0 });
            }}
            className={cn(
              "w-full border rounded-sm p-3 text-right transition-colors",
              !showPrice
                ? "border-blue-4 bg-[#EEF3FB]"
                : "border-gray-200 bg-[#F8F8F8]",
            )}
          >
            <div className="flex items-center gap-3 text-sm">
              <span
                className={cn(
                  "shrink-0 w-4 h-4 rounded-full border flex items-center justify-center",
                  !showPrice ? "border-blue-4" : "border-gray-400",
                )}
                aria-hidden
              >
                {!showPrice && (
                  <span className="w-2 h-2 rounded-full bg-blue-4" />
                )}
              </span>
              <span
                className={cn(
                  "text-right",
                  !showPrice ? "text-blue-4" : "text-gray-700",
                )}
              >
                لا اريد اظهار السعر
              </span>
            </div>
          </button>
        </div>
        {errors.price && (
          <p className="text-xs text-red-500 mt-1">{errors.price}</p>
        )}
      </div>

      {sectionField ? (
        <>
          {categoryField}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sectionField}
            {conditionField}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categoryField}
          {conditionField}
        </div>
      )}

      <div
        onBlur={(e) => {
          // نتجاهل انتقال التركيز داخل المحرر نفسه (أزرار شريط الأدوات)
          if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
          onDescriptionBlur?.();
        }}
      >
        <RichTextEditor
          value={value.description}
          onChange={(description) => onChange({ description })}
          label="وصف المنتج"
          required
          placeholder="اكتب وصفاً تفصيلاً..."
          helpText="ماهو وصف المنتج"
          helpTooltip="اكتب وصفًا تفصيليًا يشرح مميزات المنتج، خامته، طريقة استخدامه، والمعلومات الإضافية التي قد تساعد العميل في اتخاذ قرار الشراء. يمكنك استخدام فقرات أو نقاط مرتبة لتوضيح التفاصيل."
          error={errors.description}
          className="max-h-[400px] min-h-[200px]"
        />
      </div>

      {footerField}

      <CategoryPickerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSelect={(category_id, category_name) =>
          onChange({ category_id, category_name })
        }
        selectedCategoryId={value.category_id || undefined}
      />
    </div>
  );
}
