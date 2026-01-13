// src/features/(dashboard)/services/components/AddServiceStep1.tsx
"use client";

import { useState, useMemo, useEffect, KeyboardEvent, useRef } from "react";
import { ProductFormActions } from "../../products/components/ProductFormActions";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { ReusableDropdown, DropdownRef } from "@/src/components/ui/ReusableDropdown";
import { FormInput } from "@/src/components/ui/FormInput";
import { Label } from "@/src/components/ui/label";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { OptionTag } from "@/src/components/ui/OptionTag";
import { HelpCircle } from "lucide-react";
import { Step1ServiceData } from "../types";
import { cn } from "@/src/lib/utils";
import { useGetCategories } from "../../categoriesAndAttributes/hooks";
import { useGetSections, useCreateSection } from "../../sections/hooks"; // استيراد هوك الأقسام
import { Stepper } from "@/src/components/ui/Stepper";
import { ServicePreviewSidebar } from "./ServicePreviewSidebar";
import { useGetSingleStore } from "../../stores/hooks";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { SectionModal, SectionFormData } from "../../sections/components/SectionModal";

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

  const categoryDropdownRef = useRef<DropdownRef>(null);
  const categorySectionRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<Step1ServiceData>({
    title: initialData?.title || "",
    category_id: initialData?.category_id || "",
    section_id: initialData?.section_id || "", // تهيئة القسم
    tags: initialData?.tags?.map((t: string | { title: string }) => (typeof t === 'object' ? t.title : t)) || [],
    specialties: initialData?.specialties?.map((s: string | { title: string }) => (typeof s === 'object' ? s.title : s)) || [],
    price: initialData?.price || 0,
    description: initialData?.description || "",
    images: initialData?.images || [],
    images_previews: initialData?.images_previews || [],
    execute_count: initialData?.execute_count || 1,
    execute_type: initialData?.execute_type || "day",
  });

  const [specialtyInput, setSpecialtyInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);

  const createSection = useCreateSection();

  // --- Fetch Categories ---
  const categoriesQueryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("per_page", "1000");
    params.set("type", "service");
    params.set("only_parent", "true");
    return params;
  }, []);

  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useGetCategories(categoriesQueryParams);

  const categoryOptions = useMemo(() => {
    return (
      categoriesData?.data?.map((cat) => ({
        value: String(cat.id),
        label: cat.name,
      })) || []
    );
  }, [categoriesData]);

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

  const selectedCategoryName = useMemo(() => {
    return categoriesData?.data?.find(c => String(c.id) === String(formData.category_id))?.name || "تصنيف غير محدد";
  }, [categoriesData, formData.category_id]);

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

  const handleAddTag = () => {
    const val = tagInput.trim();
    if (!val) return;
    if (formData.tags.includes(val)) {
      toast.error("الكلمة المفتاحية مضافة بالفعل");
      return;
    }
    if (formData.tags.length >= 10) {
      toast.error("الحد الأقصى للكلمات المفتاحية هو 10");
      return;
    }
    setFormData(prev => ({ ...prev, tags: [...prev.tags, val] }));
    setTagInput("");
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const removeTag = (itemToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(i => i !== itemToRemove) }));
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
    if (!formData.section_id) newErrors.section_id = "القسم مطلوب"; // التحقق من القسم
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext(formData);
    } else {
      const firstError = Object.keys(errors)[0];
      // التمرير إلى العنصر الذي يحتوي على الخطأ أو اسم الحقل
      const element = document.getElementsByName(firstError)[0] || document.getElementById(firstError);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });

      // Fallback scroll if specific element not found (e.g. dropdowns sometimes don't have name attr on container)
      if (!element) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const scrollToCategoryAndOpen = () => {
    if (categorySectionRef.current) {
      categorySectionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        categoryDropdownRef.current?.open();
      }, 500);
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

              <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="text-sm font-medium mb-1">
                      {selectedCategoryName}
                    </h3>
                    <p className="text-xs text-gray-2">خدمات خاصة في قسم {selectedCategoryName}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={scrollToCategoryAndOpen}
                  className="text-sm cursor-pointer text-blue-4 font-bold hover:underline"
                >
                  تغيير
                </button>
              </div>

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

                {/* Category Dropdown */}
                <div className="space-y-2" ref={categorySectionRef} id="category_id">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    التصنيف الرئيسي <span className="text-red-500">*</span>
                  </Label>
                  <ReusableDropdown
                    ref={categoryDropdownRef}
                    options={categoryOptions}
                    value={formData.category_id ? String(formData.category_id) : ""}
                    onChange={(value) => setFormData({ ...formData, category_id: value })}
                    placeholder={isCategoriesLoading ? "جاري التحميل..." : "اختر التصنيف"}
                    error={errors.category_id}
                    className="h-12"
                  />
                </div>

                {/* Section Dropdown (New) */}
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

                {/* Keywords */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium ">
                      الكلمات المفتاحية
                    </Label>
                    <Tooltip
                      trigger={
                        <div className="flex items-center gap-1 text-blue-4 cursor-pointer hover:text-blue-500 transition-colors">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">ماهي الكلمات المفتاحية</span>
                        </div>
                      }
                      content={`الكلمات المفتاحية هي مصطلحات أو عبارات تصف محتوى الصفحة أو الموضوع، وتُستخدم لتحسين البحث والوصول للمحتوى بسهولة.مثل: "تعليم"، "برمجة"، "تصميم"`}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder="اضف الوسم ثم اضغط علي اضافة"
                        className="w-full px-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-300 text-sm transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddTag}
                      disabled={!tagInput.trim()}
                      className="px-6 py-3 bg-blue-4 text-white rounded-sm text-sm font-medium hover:bg-[#2c425e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      اضافة
                    </button>
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 ">
                      {formData.tags.map((tag, index) => (
                        <OptionTag
                          key={index}
                          label={tag}
                          onRemove={() => removeTag(tag)}
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
    </div>
  );
}