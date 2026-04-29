"use client";

import { useState, KeyboardEvent, useMemo, useEffect } from "react";
import { HelpCircle, Loader2 } from "lucide-react";
import Cookies from "js-cookie";
import { ProductPreviewSidebar } from "./ProductPreviewSidebar";
import { GuideVideoCard } from "../../user-guide/components/GuideVideoCard";
import { ProductFormActions } from "./ProductFormActions";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { OptionTag } from "@/src/components/ui/OptionTag";
import { useInfiniteGetStores } from "../../stores/hooks";
import { useGetSections, useCreateSection } from "../../sections/hooks";
import { Step1FormData, Step2FormData } from "../types";
import { toast } from "sonner";
import { Label } from "@/src/components/ui/label";
import { Stepper } from "@/src/components/ui/Stepper";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

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
  breadcrumbItems?: { label: string; href?: string }[];
  onStepClick?: (step: number) => void;
  showSaveDraft?: boolean;
  isGeneratingAI?: boolean;
  aiKeywords?: string[];
  isEditMode?: boolean;
}

export function AddProductStep2({
  previousData,
  initialData,
  onNext,
  onBack,
  onSaveDraft,
  barSteps,
  breadcrumbItems,
  onStepClick,
  showSaveDraft = true,
  isGeneratingAI = false,
  aiKeywords = [],
  isEditMode = false,
}: AddProductStep2Props) {
  const userType = Cookies.get("user_type");
  const currentStoreId = Cookies.get("current_store_id");
  const isAdmin = userType === "admin";

  const [formData, setFormData] = useState<ExtendedStep2FormData>({
    store_id: initialData?.store_id || (isAdmin ? 0 : Number(currentStoreId)),
    section_id: initialData?.section_id,
    tags: initialData?.tags || [],
  });

  // Sync tags if initialData changes (e.g. AI generation finished)
  useEffect(() => {
    if (initialData?.tags && initialData.tags.length > 0) {
      setFormData(prev => ({ ...prev, tags: initialData.tags }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialData?.tags)]);

  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [storeSearchQuery, setStoreSearchQuery] = useState("");
  const [debouncedStoreSearch, setDebouncedStoreSearch] = useState("");

  const createSection = useCreateSection();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedStoreSearch(storeSearchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [storeSearchQuery]);

  const storesQueryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("per_page", "10");
    params.set("type", "products");
    if (debouncedStoreSearch) {
      params.set("name", debouncedStoreSearch);
    }
    return params;
  }, [debouncedStoreSearch]);

  const {
    data: storesData,
    isLoading: isStoresLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteGetStores(storesQueryParams);

  const storeOptions = useMemo(() => {
    const allStores = storesData?.pages?.flatMap((page) => page.data) || [];
    return allStores.map((store) => ({
      value: String(store.id),
      label: store.name,
    }));
  }, [storesData]);

  // تم تغيير per_page إلى 1000 لجلب كل الأقسام مرة واحدة
  const sectionsQueryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("per_page", "1000");
    params.set("status", "active");
    if (formData.store_id) {
      params.set("store_id", String(formData.store_id));
    }
    return params;
  }, [formData.store_id]);

  const { data: sectionsData, isLoading: isSectionsLoading } = useGetSections(
    sectionsQueryParams,
    formData.store_id || undefined,
    { enabled: !!formData.store_id }
  );

  const [sectionSearchQuery, setSectionSearchQuery] = useState("");

  const sectionOptions = useMemo(() => {
    let filtered = sectionsData?.data || [];
    if (sectionSearchQuery) {
      filtered = filtered.filter((section) =>
        section.name.toLowerCase().includes(sectionSearchQuery.toLowerCase())
      );
    }
    return (
      filtered.map((section) => ({
        value: String(section.id),
        label: section.name,
      }))
    );
  }, [sectionsData, sectionSearchQuery]);

  const handleStoreChange = (value: string) => {
    setFormData({
      ...formData,
      store_id: Number(value),
      section_id: undefined,
    });
  };

  // --- Watch Logic: مراقبة التغييرات لحذف الأخطاء ---
  useEffect(() => {
    const newErrors = { ...errors };
    let hasChanges = false;

    if (errors.store_id && formData.store_id) {
      delete newErrors.store_id;
      hasChanges = true;
    }

    if (errors.section_id && formData.section_id && formData.section_id > 0) {
      delete newErrors.section_id;
      hasChanges = true;
    }

    if (hasChanges) {
      setErrors(newErrors);
    }
  }, [formData.store_id, formData.section_id, errors]);
  // --------------------------------------------------

  const defaultBreadcrumbItems = [
    { label: "المنتجات", href: "/admin/products" },
    { label: "انشاء منتج جديد" },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.store_id && !(isAdmin && isEditMode)) {
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
      const element = document.querySelector(`[name="${firstError}"]`);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
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
    if (aiKeywords.length > 0 && aiKeywords.includes(tagToRemove)) {
      const currentAiTagsCount = formData.tags.filter(tag => aiKeywords.includes(tag)).length;
      if (currentAiTagsCount <= 3) {
        toast.error("يجب الإبقاء على 3 كلمات مفتاحية من المولدة بالذكاء الاصطناعي على الأقل");
        return;
      }
    } else {
    
      if (aiKeywords.length === 0 && formData.tags.length <= 3) {
        toast.error("يجب الإبقاء على 3 كلمات مفتاحية على الأقل");
        return;
      }
    }

    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleAddSection = async () => {
    if (!newSectionName.trim()) return;

    try {
      await createSection.mutateAsync({
        payload: {
          name: newSectionName.trim(),
          status: "active",
          store_id: Number(formData.store_id),
        },
        storeId: formData.store_id,
      });

      setNewSectionName("");
      setIsAddSectionOpen(false);
    } catch {
      // الخطأ يُعالج في الـ hook
    }
  };

  const keywordsDescription = `الكلمات المفتاحية هي مصطلحات أو عبارات تصف محتوى الصفحة أو الموضوع. وتستخدم لتحسين البحث والوصول للمحتوى بسهولة. مثل: "موبايل", "سامسونج" ,"حذاء أحمر", "الكترونيات".`;

  return (
    <div className="overflow-hidden">
      <div className="container mx-auto py-4 px-4">
        <Breadcrumb
          items={breadcrumbItems || defaultBreadcrumbItems}
          className="mb-4"
        />
        <Stepper
          currentStep={2}
          steps={barSteps}
          onStepClick={onStepClick}
        />

        <div className="grid grid-cols-12 gap-4 mt-8">
          <div className="col-span-12 lg:col-span-9">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-bold mb-8 ">المعلومات المتقدمة</h2>

              <div className="space-y-8">
                {isAdmin && !isEditMode && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      إظهار المنتج في متجر
                      <span className="text-red-500">*</span>
                    </Label>
                    <ReusableDropdown
                      options={storeOptions}
                      value={formData.store_id ? String(formData.store_id) : ""}
                      onChange={handleStoreChange}
                      placeholder={
                        isStoresLoading ? "جاري التحميل..." : "اختر المتجر..."
                      }
                      error={errors.store_id}
                      className="h-11"
                      onSearch={setStoreSearchQuery}
                      searchPlaceholder="ابحث عن متجر..."
                      onReachEnd={() => hasNextPage && fetchNextPage()}
                      isLoadingMore={isFetchingNextPage}
                    />
                  </div>
                )}

                {formData.store_id > 0 && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      القسم
                      <span className="text-red-500">*</span>
                    </Label>
                    <ReusableDropdown
                      options={sectionOptions}
                      value={
                        formData.section_id && formData.section_id > 0 ? String(formData.section_id) : null
                      }
                      onChange={(value) =>
                        setFormData({ ...formData, section_id: Number(value) })
                      }
                      placeholder={
                        isSectionsLoading ? "جاري التحميل..." : "اختر القسم..."
                      }
                      error={errors.section_id}
                      className="h-11"
                      onAddNew={() => setIsAddSectionOpen(true)}
                      addNewLabel="إضافة قسم جديد"
                      onSearch={setSectionSearchQuery}
                      searchPlaceholder="ابحث عن قسم..."
                    />
                    {!errors.section_id && (
                      <p className="text-xs text-gray-2">
                        حدد القسم الذي ينتمي إليه هذا المنتج داخل المتجر.
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      الكلمات المفتاحية
                      {isGeneratingAI && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
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
                        placeholder={isGeneratingAI ? "جاري توليد الكلمات المفتاحية..." : "اكتب الوسم هنا..."}
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

                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag, index) => (
                        <OptionTag
                          key={index}
                          label={tag}
                          onRemove={() => handleRemoveTag(tag)}
                          showRemoveButton={formData.tags.length > 3}
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
            <GuideVideoCard location="add-product" />
          </div>
        </div>
      </div>

      <ProductFormActions
        onNext={handleNext}
        onBack={onBack}
        onSaveDraft={onSaveDraft}
        showSaveDraft={showSaveDraft}
      />

      {/* Add Section Dialog */}
      <Dialog open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen}>
        <DialogContent className="sm:max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium ">
              أضف قسم جديد
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid gap-3">
              <Label htmlFor="section-name" className="text-right font-medium ">
                اسم القسم
              </Label>
              <Input
                id="section-name"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="اكتب اسم القسم هنا"
                className="w-full px-4 py-3 border-gray-200 rounded-lg focus:border-brand-blue-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSection();
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleAddSection}
              disabled={!newSectionName.trim() || createSection.isPending}
              className="w-full px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer"
              style={{ backgroundColor: 'var(--blue-3)' }}
            >
              {createSection.isPending ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}