// src/features/(dashboard)/services/components/AddServiceStep1.tsx
"use client";

import { useState, useMemo, useEffect, KeyboardEvent, useRef } from "react";
import { ProductFormActions } from "../../products/components/ProductFormActions";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { FormInput } from "@/src/components/ui/FormInput";
import { Label } from "@/src/components/ui/label";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { OptionTag } from "@/src/components/ui/OptionTag";
import { HelpCircle, ChevronDown } from "lucide-react";
import { Step1ServiceData } from "../types";
import { useGetSections, useCreateSection } from "../../sections/hooks";
import { Stepper } from "@/src/components/ui/Stepper";
import { ServicePreviewSidebar } from "./ServicePreviewSidebar";
import { GuideVideoCard } from "../../user-guide/components/GuideVideoCard";
import { useGetSingleStore } from "../../stores/hooks";
import { toast } from "sonner";
import { SectionModal, SectionFormData } from "../../sections/components/SectionModal";
import { CategoryPickerModal } from "../../products/components/CategoryPickerModal";
import { cn } from "@/src/lib/utils";

interface AddServiceStep1Props {
  initialData?: Step1ServiceData;
  onNext: (data: Step1ServiceData) => void;
  onCancel: () => void;
  onSaveDraft?: () => void;
  barSteps: { number: number; label: string; completed: boolean }[];
  breadcrumbItems?: { label: string; href?: string }[];
  onStepClick?: (step: number) => void;
  showSaveDraft?: boolean;
  storeId: number | string;
}

export function AddServiceStep1({
  initialData,
  onNext,
  onCancel,
  onSaveDraft,
  barSteps,
  breadcrumbItems,
  onStepClick,
  showSaveDraft = false,
  storeId
}: AddServiceStep1Props) {

  const { data: storeData } = useGetSingleStore(storeId, { enabled: !!storeId });
  const store = storeData?.record;

  const categorySectionRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<Step1ServiceData>({
    title: initialData?.title || "",
    category_id: initialData?.category_id || "",
    category_name: initialData?.category_name || "",
    section_id: initialData?.section_id || "",
    specialties: initialData?.specialties?.map((s: string | { title: string }) => (typeof s === 'object' ? s.title : s)) || [],
    price: initialData?.price || 0,
    description: initialData?.description || "",
    images: initialData?.images || [],
    images_previews: initialData?.images_previews || [],
    execute_count: initialData?.execute_count || 1,
    execute_type: initialData?.execute_type || "day",
  });

  const [specialtyInput, setSpecialtyInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const createSection = useCreateSection();

  const handleCategorySelect = (categoryId: number, categoryName: string) => {
    setFormData({ ...formData, category_id: String(categoryId), category_name: categoryName });
    if (errors.category_id) {
      const newErrors = { ...errors };
      delete newErrors.category_id;
      setErrors(newErrors);
    }
  };

  // --- Fetch Sections ---
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

  const sectionOptions = useMemo(() => {
    return (
      sectionsData?.data?.map((sec) => ({
        value: String(sec.id),
        label: sec.name,
      })) || []
    );
  }, [sectionsData]);

  useEffect(() => {
    const newErrors = { ...errors };
    let hasChanges = false;

    if (errors.title && formData.title.trim()) {
      delete newErrors.title;
      hasChanges = true;
    }
    if (errors.category_id && formData.category_id) {
      delete newErrors.category_id;
      hasChanges = true;
    }
    if (errors.section_id && formData.section_id) {
      delete newErrors.section_id;
      hasChanges = true;
    }

    if (hasChanges) {
      setErrors(newErrors);
    }
  }, [formData, errors]);

  const handleAddSpecialty = () => {
    const val = specialtyInput.trim();
    if (!val) return;
    if (formData.specialties.includes(val)) {
      toast.error("هذا التخصص مضاف بالفعل");
      return;
    }
    if (formData.specialties.length >= 10) {
      toast.error("الحد الأقصى للتخصصات هو 10");
      return;
    }
    setFormData(prev => ({ ...prev, specialties: [...prev.specialties, val] }));
    setSpecialtyInput("");
  };

  const handleSpecialtyKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSpecialty();
    }
  };

  const removeSpecialty = (itemToRemove: string) => {
    setFormData(prev => ({ ...prev, specialties: prev.specialties.filter(i => i !== itemToRemove) }));
  };

  const handleSaveSection = (data: SectionFormData) => {
    createSection.mutate({
      payload: {
        name: data.name,
        status: data.isActive ? "active" : "not-active",
        store_id: Number(storeId),
      },
      storeId: Number(storeId),
    }, {
      onSuccess: () => {
        setIsSectionModalOpen(false);
      }
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "عنوان الخدمة مطلوب";
    if (!formData.category_id) newErrors.category_id = "التصنيف الرئيسي مطلوب";
    if (!formData.section_id) newErrors.section_id = "القسم مطلوب";
    if (!formData.images || formData.images.length === 0) newErrors.images = "صورة الخدمة مطلوبة";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext(formData);
    } else {
      const firstError = Object.keys(errors)[0];
      const element = document.getElementsByName(firstError)[0] || document.getElementById(firstError);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (!element) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const defaultBreadcrumbItems = [
    { label: "الخدمات", href: "/admin/serviceProviders" },
    { label: "انشاء خدمة جديدة" },
  ];

  return (
    <div className="overflow-hidden">
      <div className="container mx-auto py-4 px-4">

        <Breadcrumb
          items={breadcrumbItems || defaultBreadcrumbItems}
          className="mb-4"
        />

        <Stepper
          currentStep={1}
          steps={barSteps}
          onStepClick={onStepClick}
        />

        <div className="grid grid-cols-12 gap-6 mt-8">

          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold mb-8">المعلومات الأساسية</h2>

              {formData.category_name && (
                <div className="bg-[#F8F8F8] rounded-md p-6 mb-8 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-medium">{formData.category_name}</h3>
                    <p className="text-xs text-gray-2">خدمات خاصة في قسم {formData.category_name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="text-blue-4 font-bold text-sm cursor-pointer hover:underline"
                  >
                    تغيير
                  </button>
                </div>
              )}

              <div className="space-y-6">

                {/* Title */}
                <div className="space-y-1">
                  <FormInput
                    label="عنوان الخدمة"
                    name="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="اكتب اسم الخدمة"
                    required
                    error={errors.title}
                    maxLength={140}
                  />
                  <p className="text-xs text-gray-2">
                    قم بتضمين الكلمات الرئيسية التي يستخدمها المشترون للبحث عن هذا العنصر.
                  </p>
                </div>

                {/* Category Button → opens CategoryPickerModal */}
                <div className="space-y-2" ref={categorySectionRef} id="category_id">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    التصنيف الرئيسي <span className="text-red-500">*</span>
                  </Label>
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className={cn(
                      "w-full h-12 flex items-center justify-between px-4 border rounded-sm text-sm transition-colors focus:outline-none",
                      errors.category_id
                        ? "border-red-400 bg-red-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    )}
                  >
                    <span className={cn("truncate text-right", formData.category_name ? "text-gray-900" : "text-gray-400")}>
                      {formData.category_name || "اختر التصنيف"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ms-2" />
                  </button>
                  {errors.category_id && <p className="text-xs text-red-500 mt-1">{errors.category_id}</p>}
                </div>

                {/* Section Dropdown */}
                <div className="space-y-2" id="section_id">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    القسم <span className="text-red-500">*</span>
                  </Label>
                  <ReusableDropdown
                    options={sectionOptions}
                    value={formData.section_id ? String(formData.section_id) : ""}
                    onChange={(value) => setFormData({ ...formData, section_id: value })}
                    placeholder={isSectionsLoading ? "جاري التحميل..." : "اختر القسم"}
                    error={errors.section_id}
                    className="h-12"
                    onAddNew={() => setIsSectionModalOpen(true)}
                    addNewLabel="إضافة قسم جديد"
                  />
                </div>

                {/* Specialties */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium ">
                      تخصصات أو مجالات العمل
                    </Label>
                    <Tooltip
                      trigger={
                        <div className="flex items-center gap-1 text-blue-4 cursor-pointer hover:text-blue-500 transition-colors">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">ماهي التخصصات</span>
                        </div>
                      }
                      content={`استخدِم كلمات تصف التخصصات أو مجالات العمل، مثل: "محاسبة"، "تسويق"، "هندسة"، "تصميم جرافيكي"`}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={specialtyInput}
                        onChange={(e) => setSpecialtyInput(e.target.value)}
                        onKeyDown={handleSpecialtyKeyDown}
                        placeholder="اضف التخصص ثم اضغط علي اضافة"
                        className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-300 text-sm transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSpecialty}
                      disabled={!specialtyInput.trim()}
                      className="px-6 py-3 bg-blue-4 text-white rounded-sm text-sm font-medium hover:bg-[#2c425e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      اضافة
                    </button>
                  </div>

                  {formData.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 ">
                      {formData.specialties.map((item, index) => (
                        <OptionTag
                          key={index}
                          label={item}
                          onRemove={() => removeSpecialty(item)}
                          showRemoveButton={true}
                        />
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <ServicePreviewSidebar
              data={{
                title: formData.title,
                price: formData.price || 0,
                coverImage: formData.images_previews?.[0] || ""
              }}
              storeInfo={{
                name: store ? `${store.owner?.first_name} ${store.owner?.last_name}` : "",
                avatar: store?.owner?.avatar_url || "",
                address: store?.address || ""
              }}
            />
            <GuideVideoCard location="add-service" />
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

      <SectionModal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        onSave={handleSaveSection}
        mode="add"
      />

      <CategoryPickerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSelect={handleCategorySelect}
        selectedCategoryId={formData.category_id ? Number(formData.category_id) : undefined}
        type="service"
      />
    </div>
  );
}