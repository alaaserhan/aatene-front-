"use client";

import { useEffect, useState } from "react";
import { ProductPreviewSidebar } from "./ProductPreviewSidebar";
import { GuideVideoCard } from "../../user-guide/components/GuideVideoCard";
import { ProductFormActions } from "./ProductFormActions";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Step1FormData } from "../types";
import { validateProductStep1 } from "../product-step1-validation";
import { Stepper } from "@/src/components/ui/Stepper";
import { ProductBasicInfoFields } from "./sections/ProductBasicInfoFields";

interface AddProductStep1Props {
  initialData?: Step1FormData;
  onNext: (data: Step1FormData) => void;
  onCancel: () => void;
  onSaveDraft?: () => void;
  barSteps: { number: number; label: string; completed: boolean }[];
  storeId?: string;
  breadcrumbItems?: { label: string; href?: string }[];
  onStepClick?: (step: number) => void;
  /** مزامنة بيانات الخطوة 1 مع الأب عند القفز من الـ stepper (إضافة/تعديل) */
  onStep1Sync?: (data: Step1FormData) => void;
  showSaveDraft?: boolean;
}

export function AddProductStep1({
  initialData,
  onNext,
  onCancel,
  onSaveDraft,
  barSteps,
  breadcrumbItems,
  onStepClick,
  onStep1Sync,
  showSaveDraft = true,
}: AddProductStep1Props) {
  const [formData, setFormData] = useState<Step1FormData>({
    category_id: initialData?.category_id || 0,
    category_name: initialData?.category_name || "",
    cover: initialData?.cover || "",
    cover_preview: initialData?.cover_preview || "",
    gallery: initialData?.gallery || [],
    gallery_previews: initialData?.gallery_previews || [],
    name: initialData?.name || "",
    price: initialData?.price || 0,
    ask_for_price: initialData?.ask_for_price || false,
    condition: initialData?.condition || "new",
    short_description: initialData?.short_description || "",
    description: initialData?.description || "",
  });

  /** الأخطاء تظهر بعد أول محاولة انتقال، ثم تختفي تلقائياً عند إصلاح الحقل */
  const [showErrors, setShowErrors] = useState(false);
  const errors = showErrors ? validateProductStep1(formData) : {};

  const defaultBreadcrumbItems = [
    { label: "المنتجات", href: "/dashboard/products" },
    { label: "انشاء منتج جديد" },
  ];

  // Sync with initialData if it changes (e.g. from AI)
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const scrollToFirstError = (firstKey: string) => {
    const element =
      (firstKey === "cover" ? document.getElementById("product-step1-cover") : null) ||
      document.querySelector(`[name="${firstKey}"]`) ||
      document.querySelector(".text-red-500");
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const runStep1Validation = (): Record<string, string> => {
    setShowErrors(true);
    return validateProductStep1(formData);
  };

  const handleStepperClick = (targetStep: number) => {
    if (targetStep > 1) {
      const newErrors = runStep1Validation();
      const keys = Object.keys(newErrors);
      if (keys.length > 0) {
        scrollToFirstError(keys[0]);
        return;
      }
      onStep1Sync?.(formData);
    }
    onStepClick?.(targetStep);
  };

  const handleNext = () => {
    const newErrors = runStep1Validation();
    const keys = Object.keys(newErrors);
    if (keys.length === 0) {
      onNext(formData);
      return;
    }
    scrollToFirstError(keys[0]);
  };

  return (
    <div className="overflow-hidden">
      <div className="container mx-auto py-4 px-4">
        <Breadcrumb items={breadcrumbItems || defaultBreadcrumbItems} className="mb-4" />

        <Stepper
          currentStep={1}
          steps={barSteps}
          onStepClick={onStepClick ? handleStepperClick : undefined}
        />

        <div className="grid grid-cols-12 gap-4 mt-8">
          <div className="col-span-12 lg:col-span-9">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold">المعلومات الأساسية</h2>
              </div>

              <ProductBasicInfoFields
                value={formData}
                onChange={(patch) => setFormData((prev) => ({ ...prev, ...patch }))}
                errors={errors}
              />
            </div>
          </div>

          <div className="col-span-12 lg:col-span-3">
            <div className="sticky top-6 flex flex-col gap-4">
              <ProductPreviewSidebar
                data={{
                  name: formData.name,
                  price: formData.price,
                  ask_for_price: formData.ask_for_price,
                  coverImage: formData.cover_preview,
                  galleryImages: formData.gallery_previews,
                }}
              />
              <GuideVideoCard location="add-product" />
            </div>
          </div>
        </div>
      </div>

      <ProductFormActions
        onNext={handleNext}
        onCancel={onCancel}
        onSaveDraft={onSaveDraft}
        showBack={false}
        showCancel={true}
        showSaveDraft={showSaveDraft}
      />
    </div>
  );
}
