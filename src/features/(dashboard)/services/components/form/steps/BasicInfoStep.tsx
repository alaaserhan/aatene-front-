// src/features/(dashboard)/services/components/form/steps/BasicInfoStep.tsx
"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { FormInput } from "@/src/components/ui/FormInput";
import { Label } from "@/src/components/ui/label";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { ImageGallerySelector } from "@/src/components/ui/ImageGallerySelector";
import { RichTextEditor } from "@/src/components/ui/RichTextEditor";
import { CharCounter } from "@/src/components/ui/CharCounter";
import { cn } from "@/src/lib/utils";
import { CategoryPickerModal } from "@/src/features/(dashboard)/products/components/CategoryPickerModal";
import { SectionModal, SectionFormData } from "@/src/features/(dashboard)/sections/components/SectionModal";
import { useGetSections, useCreateSection } from "@/src/features/(dashboard)/sections/hooks";
import { PriceVisibilityField } from "../fields/PriceVisibilityField";
import { MAX_IMAGES, TITLE_MAX_LENGTH } from "../constants";
import { ServiceFormErrors, ServiceFormValues } from "../types";

interface BasicInfoStepProps {
  values: ServiceFormValues;
  errors: ServiceFormErrors;
  setField: <K extends keyof ServiceFormValues>(key: K, value: ServiceFormValues[K]) => void;
  storeId: number | string;
}

export function BasicInfoStep({ values, errors, setField, storeId }: BasicInfoStepProps) {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);

  const createSection = useCreateSection();

  const sectionsQueryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("per_page", "1000");
    params.set("store_id", String(storeId));
    return params;
  }, [storeId]);

  const { data: sectionsData, isLoading: isSectionsLoading } = useGetSections(
    sectionsQueryParams,
    storeId,
    { enabled: !!storeId }
  );

  const sectionOptions = useMemo(
    () => sectionsData?.data?.map((sec) => ({ value: String(sec.id), label: sec.name })) || [],
    [sectionsData]
  );

  const handleCreateSection = (data: SectionFormData) => {
    createSection.mutate(
      {
        payload: {
          name: data.name,
          status: data.isActive ? "active" : "not-active",
          store_id: Number(storeId),
        },
        storeId: Number(storeId),
      },
      { onSuccess: () => setIsSectionModalOpen(false) }
    );
  };

  return (
    <div className="bg-white rounded-xl p-6 pb-10 border border-gray-200 shadow-sm">
      <h2 className="text-xl font-semibold mb-8">المعلومات الأساسية</h2>

      <div className="space-y-6">
        {/* 1. Service title */}
        <div className="space-y-1" id="title">
          <FormInput
            label="عنوان الخدمة"
            name="title"
            value={values.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="اكتب اسم الخدمة"
            required
            error={errors.title}
            maxLength={TITLE_MAX_LENGTH}
          />
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs text-gray-6">
              قم بتضمين الكلمات الرئيسية التي يستخدمها المشترون للبحث عن هذا العنصر.
            </p>
            <CharCounter value={values.title} maxLength={TITLE_MAX_LENGTH} />
          </div>
        </div>

        {/* 2. Service image */}
        <div id="images">
          <ImageGallerySelector
            label="صورة الخدمة"
            subLabel="حتى 10 ملفات: الموضع الأول صورة فقط — باقي المواضع صور أو فيديو من المعرض"
            value={values.images}
            previews={values.images_previews}
            onChange={(files, urls) => {
              setField("images", files);
              setField("images_previews", urls);
            }}
            maxFiles={MAX_IMAGES}
            error={errors.images}
            showMainSelector
            mainImageLabel="الصورة الاساسية"
            showDragHint
            mainImageAllowedMediaTypes={["image"]}
            allowedMediaTypes={["image", "gallery", "video"]}
            uploadPrimaryText="أضف أو اسحب صورة أو فيديو"
            uploadSecondaryText="الموضع الأول: تبويب الصور — الفيديو: تبويب المعرض"
          />
        </div>

        {/* 3. Category */}
        <div className="space-y-2" id="category_id">
          <Label className="text-sm font-medium flex items-center gap-1">
            اختر الفئة <span className="text-red-500">*</span>
          </Label>
          <button
            type="button"
            onClick={() => setIsCategoryModalOpen(true)}
            className={cn(
              "w-full h-10 flex items-center justify-between px-4 border rounded-sm text-sm transition-colors focus:outline-none",
              errors.category_id
                ? "border-red-500"
                : "border-gray-200 hover:border-gray-300 bg-white"
            )}
          >
            <span className={cn("truncate text-right", values.category_name ? "text-gray-900" : "text-gray-400")}>
              {values.category_name || "اختر الفئة"}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ms-2" />
          </button>
          {errors.category_id && <p className="text-xs text-red-500 mt-1">{errors.category_id}</p>}
        </div>

        {/* 4. Section */}
        <div className="space-y-2" id="section_id">
          <Label className="text-sm font-medium flex items-center gap-1">
            اختر القسم <span className="text-red-500">*</span>
          </Label>
          <ReusableDropdown
            options={sectionOptions}
            value={values.section_id ? String(values.section_id) : ""}
            onChange={(value) => setField("section_id", value)}
            placeholder={isSectionsLoading ? "جاري التحميل..." : "اختر القسم"}
            error={errors.section_id}
            className="h-12"
            onAddNew={() => setIsSectionModalOpen(true)}
            addNewLabel="إضافة قسم جديد"
          />
        </div>

        {/* 5. Price visibility */}
        <PriceVisibilityField
          askForPrice={values.ask_for_price}
          price={values.price}
          error={errors.price}
          onAskForPriceChange={(next) => setField("ask_for_price", next)}
          onPriceChange={(price) => setField("price", price)}
        />

        {/* 6. Description (optional) */}
        <RichTextEditor
          value={values.description}
          onChange={(val) => setField("description", val)}
          label="وصف الخدمة (اختياري)"
          placeholder="نص المحتوى..."
          helpText="ما هو وصف الخدمة"
          className="min-h-55"
          helpTooltip={`اشرح باختصار ما تقدمه في هذه الخدمة، مثل: "تصميم شعارات احترافية للشركات الصغيرة تشمل 3 نماذج أولية وتعديلات غير محدودة".`}
        />
      </div>

      <CategoryPickerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSelect={(categoryId, categoryName) => {
          setField("category_id", String(categoryId));
          setField("category_name", categoryName);
        }}
        selectedCategoryId={values.category_id ? Number(values.category_id) : undefined}
        type="service"
      />

      <SectionModal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        onSave={handleCreateSection}
        mode="add"
      />
    </div>
  );
}
