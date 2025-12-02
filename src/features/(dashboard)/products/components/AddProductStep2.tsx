// src/features/(dashboard)/products/components/AddProductStep2.tsx
"use client";

import { useState, KeyboardEvent, useMemo, useEffect } from "react";
import { HelpCircle } from "lucide-react";
import Cookies from "js-cookie";
import { ProductStepperProgress } from "./ProductStepperProgress";
import { ProductPreviewSidebar } from "./ProductPreviewSidebar";
import { ProductFormActions } from "./ProductFormActions";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { OptionTag } from "@/src/components/ui/OptionTag";
import { useGetStores } from "../../stores/hooks";
import { useGetSections } from "../../sections/hooks";
import { Step1FormData, Step2FormData } from "../types";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";
import { Label } from "@/src/components/ui/label";

// تحديث Interface البيانات ليشمل section_id
interface ExtendedStep2FormData extends Step2FormData {
  section_id?: number;
}

interface AddProductStep2Props {
  previousData: Step1FormData;
  initialData?: ExtendedStep2FormData;
  onNext: (data: ExtendedStep2FormData) => void;
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
  const userType = Cookies.get("user_type");
  const currentStoreId = Cookies.get("current_store_id");
  const isAdmin = userType === "admin";

  const [formData, setFormData] = useState<ExtendedStep2FormData>({
    store_id: initialData?.store_id || (isAdmin ? 0 : Number(currentStoreId)),
    section_id: initialData?.section_id || 0,
    tags: initialData?.tags || [],
  });

  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // --- Stores Logic (Admin Only) ---
  const [storesPage, setStoresPage] = useState(1);
  const [allStores, setAllStores] = useState<{ id: number; name: string }[]>([]);

  const storesQueryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("per_page", "10");
    params.set("page", String(storesPage));
    return params;
  }, [storesPage]);

  const { data: storesData, isLoading: isStoresLoading } = useGetStores(
    storesQueryParams,
    { enabled: isAdmin }
  );

  useEffect(() => {
    if (isAdmin && storesData?.data) {
      if (storesPage === 1) {
        setAllStores(storesData.data);
      } else {
        setAllStores((prev) => {
          const newStores = storesData.data.filter(
            (s) => !prev.some((p) => p.id === s.id)
          );
          return [...prev, ...newStores];
        });
      }
    }
  }, [storesData, storesPage, isAdmin]);

  const handleLoadMoreStores = () => {
    if (storesData && storesPage < Math.ceil(storesData.recordsFiltered / 10)) {
      setStoresPage((prev) => prev + 1);
    }
  };

  const storeOptions = allStores.map((store) => ({
    value: String(store.id),
    label: store.name,
  }));

  // --- Sections Logic ---
  const [sectionsPage, setSectionsPage] = useState(1);
  const [allSections, setAllSections] = useState<{ id: number; name: string }[]>([]);


  const sectionsQueryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("per_page", "10");
    params.set("page", String(sectionsPage));
    params.set("status", "active");
    params.set("store_id", String(formData.store_id));
    return params;
  }, [sectionsPage, formData.store_id]);

  const { data: sectionsData, isLoading: isSectionsLoading } = useGetSections(
    sectionsQueryParams,
    formData.store_id || undefined,
    { enabled: !!formData.store_id }
  );

  useEffect(() => {
    if (sectionsData?.data) {
      if (sectionsPage === 1) {
        setAllSections(sectionsData.data);
      } else {
        setAllSections((prev) => {
          const newSections = sectionsData.data.filter(
            (s) => !prev.some((p) => p.id === s.id)
          );
          return [...prev, ...newSections];
        });
      }
    }
  }, [sectionsData, sectionsPage]);

  const handleLoadMoreSections = () => {
    if (sectionsData && sectionsPage < Math.ceil(sectionsData.recordsFiltered / 10)) {
      setSectionsPage((prev) => prev + 1);
    }
  };

  const sectionOptions = allSections.map((section) => ({
    value: String(section.id),
    label: section.name,
  }));

  // --- UI Logic ---

  // دالة جديدة للتعامل مع تغيير المتجر
  const handleStoreChange = (value: string) => {
    setFormData({
      ...formData,
      store_id: Number(value),
      section_id: 0 // تصفير القسم فقط عند تغيير المتجر يدوياً
    });
    // إعادة تعيين بيانات الأقسام
    setSectionsPage(1);
    setAllSections([]);
  };

  const breadcrumbItems = [
    { label: "المنتجات", href: "/admin/products" },
    { label: "انشاء منتج جديد" },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.store_id) {
      newErrors.store_id = "يجب اختيار المتجر";
    }
    if (!formData.section_id) {
      newErrors.section_id = "يجب اختيار القسم";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext(formData);
    } else {
      const firstError = Object.keys(errors)[0];
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

  const keywordsDescription = `الكلمات المفتاحية هي مصطلحات أو عبارات تصف محتوى الصفحة أو الموضوع. وتستخدم لتحسين البحث والوصول للمحتوى بسهولة. مثل: "موبايل", "سامسونج", "الكترونيات".`;

  return (
    <div className="overflow-hidden">
      <div className="container mx-auto py-4 px-4">
        <Breadcrumb items={breadcrumbItems} className="mb-4" />
        <ProductStepperProgress currentStep={2} steps={barSteps} />

        <div className="grid grid-cols-12 gap-4 mt-8">
          <div className="col-span-12 lg:col-span-9">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-bold mb-8 text-gray-900">
                المعلومات المتقدمة
              </h2>

              <div className="space-y-8">
                {/* Store Selection (Visible only for Admin) */}
                {isAdmin && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      إظهار المنتج في متجر
                      <span className="text-red-500">*</span>
                    </Label>
                    <ReusableDropdown
                      options={storeOptions}
                      value={formData.store_id ? String(formData.store_id) : ""}
                      onChange={handleStoreChange} // استخدام الدالة الجديدة هنا
                      placeholder="اختر المتجر..."
                      error={errors.store_id}
                      className="h-11"
                      onReachEnd={handleLoadMoreStores}
                      isLoadingMore={isStoresLoading && storesPage > 1}
                    />
                  </div>
                )}

                {/* Section Selection */}
                {(formData.store_id > 0) && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      القسم
                      <span className="text-red-500">*</span>
                    </Label>
                    <ReusableDropdown
                      options={sectionOptions}
                      value={formData.section_id ? String(formData.section_id) : ""}
                      onChange={(value) =>
                        setFormData({ ...formData, section_id: Number(value) })
                      }
                      placeholder="اختر القسم..."
                      error={errors.section_id}
                      className="h-11"
                      onReachEnd={handleLoadMoreSections}
                      isLoadingMore={isSectionsLoading && sectionsPage > 1}
                    />
                  </div>
                )}

                {/* Keywords (Tags) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      الكلمات المفتاحية
                    </Label>
                    <Tooltip
                      trigger={
                        <div className="flex items-center gap-1 text-blue-4 cursor-pointer hover:text-blue-500 transition-colors">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">
                            ماهي الكلمات المفتاحية
                          </span>
                        </div>
                      }
                      content={keywordsDescription}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="اكتب الوسم هنا..."
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:outline-none text-sm transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddTag}
                      disabled={!tagInput.trim()}
                      className="px-6 py-2.5 bg-blue-4 text-white rounded-sm text-sm font-medium hover:bg-[#2c425e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      اضافة
                    </button>
                  </div>

                  {/* Tags List */}
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag, index) => (
                        <OptionTag
                          key={index}
                          label={tag}
                          onRemove={() => handleRemoveTag(tag)}
                          showRemoveButton={true}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-3">
            <ProductPreviewSidebar
              data={{
                name: previousData.name,
                price: previousData.price,
                coverImage: previousData.cover_preview,
                galleryImages: previousData.gallery_previews,
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