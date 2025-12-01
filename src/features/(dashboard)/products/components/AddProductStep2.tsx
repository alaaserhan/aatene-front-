// src/features/(dashboard)/products/components/AddProductStep2.tsx
"use client";

import { useState, KeyboardEvent } from "react";
import { HelpCircle, X } from "lucide-react";
import { ProductStepperProgress } from "./ProductStepperProgress";
import { ProductPreviewSidebar } from "./ProductPreviewSidebar";
import { ProductFormActions } from "./ProductFormActions";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { useGetStores } from "../../stores/hooks";
import { Step1FormData, Step2FormData } from "../types";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";

interface AddProductStep2Props {
  previousData: Step1FormData;
  initialData?: Step2FormData;
  onNext: (data: Step2FormData) => void;
  onBack: () => void;
  onSaveDraft?: () => void;
  barSteps: { number: number; label: string; completed: boolean }[];
}

export function AddProductStep2({
  previousData,
  initialData,
  onNext,
  onBack,
  onSaveDraft,
  barSteps,
}: AddProductStep2Props) {
  const [formData, setFormData] = useState<Step2FormData>({
    store_id: initialData?.store_id || 0,
    tags: initialData?.tags || [],
  });

  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: storesData } = useGetStores(new URLSearchParams("per_page=100"));
  const stores = storesData?.data || [];

  const storeOptions = stores.map((store) => ({
    value: String(store.id),
    label: store.name,
  }));

  const breadcrumbItems = [
    { label: "المنتجات", href: "/admin/products" },
    { label: "انشاء منتج جديد" },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.store_id) {
      newErrors.store_id = "يجب اختيار المتجر";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext(formData);
    }
  };

  const handleAddTag = () => {
    const newTag = tagInput.trim();

    if (!newTag) return;

    if (formData.tags.includes(newTag)) {
      toast.error("الكلمة المفتاحية مضافة بالفعل");
      return;
    }

    if (formData.tags.length >= 10) {
      toast.error("لا يمكن إضافة أكثر من 10 كلمات مفتاحية");
      return;
    }

    setFormData({ ...formData, tags: [...formData.tags, newTag] });
    setTagInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto py-4 px-4">
        <Breadcrumb items={breadcrumbItems} className="mb-4" />
        <ProductStepperProgress currentStep={2} steps={barSteps} />

        <div className="grid grid-cols-12 gap-6 mt-8">
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-8">المعلومات المتقدمة</h2>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    إظهار المنتج في متجر
                    <span className="text-red-500">*</span>
                  </label>
                  <ReusableDropdown
                    options={storeOptions}
                    value={formData.store_id ? String(formData.store_id) : ""}
                    onChange={(value) =>
                      setFormData({ ...formData, store_id: Number(value) })
                    }
                    placeholder="المتجر الرئيسي"
                    error={errors.store_id}
                    className="h-12"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">الكلمات المفتاحية</label>
                    <button
                      type="button"
                      className="flex items-center gap-1 text-sm text-blue-4"
                    >
                      <HelpCircle className="w-4 h-4" />
                      ماهي الكلمات المفتاحية
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="اضف الوسم ثم اضغط على اضافة"
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-3 text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-6 py-3 bg-blue-4 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors"
                    >
                      اضافة
                    </button>
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="w-4 h-4 flex items-center justify-center hover:text-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <ProductPreviewSidebar
              data={{
                name: previousData.name,
                price: previousData.price,
                coverImage: previousData.cover_preview,
                galleryImages: previousData.gallery_previews,
                rating: 4.0,
                oldPrice: previousData.price > 0 ? previousData.price * 1.15 : undefined,
              }}
            />
          </div>
        </div>
      </div>

      <ProductFormActions
        onNext={handleNext}
        onBack={onBack}
        onSaveDraft={onSaveDraft}
      />
    </div>
  );
}