"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import { ProductPreviewSidebar } from "./ProductPreviewSidebar";
import { GuideVideoCard } from "../../user-guide/components/GuideVideoCard";
import { ProductFormActions } from "./ProductFormActions";
import { ImageGallerySelector } from "@/src/components/ui/ImageGallerySelector";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { FormInput } from "@/src/components/ui/FormInput";
import { Label } from "@/src/components/ui/label";
import { RichTextEditor } from "@/src/components/ui/RichTextEditor";
import { Step1FormData } from "../types";
import { validateProductStep1 } from "../product-step1-validation";
import { cn } from "@/src/lib/utils";
import { CategoryPickerModal } from "./CategoryPickerModal";
import { Stepper } from "@/src/components/ui/Stepper";

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

const CONDITION_OPTIONS = [
  { value: "new", label: "جديد" },
  { value: "used", label: "مستعمل" },
];

const Tooltip = ({
  trigger,
  content,
}: {
  trigger: React.ReactNode;
  content: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="cursor-pointer"
      >
        {trigger}
      </div>
      {isOpen && (
        <div className="absolute z-50 p-3 bg-white border border-gray-200 rounded-lg shadow-lg w-64 text-xs text-gray-2 leading-relaxed top-full mt-2 left-1/2 -translate-x-1/2">
          {content}
        </div>
      )}
    </div>
  );
};

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
  type PriceVisibilityMode = "show" | "hide";
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
  const [priceVisibilityMode, setPriceVisibilityMode] = useState<PriceVisibilityMode>(
    initialData?.ask_for_price ? "hide" : "show"
  );
  const [lastVisiblePrice, setLastVisiblePrice] = useState<number>(
    Number(initialData?.price || 0)
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const defaultBreadcrumbItems = [
    { label: "المنتجات", href: "/dashboard/products" },
    { label: "انشاء منتج جديد" },
  ];

  const handleCategorySelect = (categoryId: number, categoryName: string) => {
    setFormData({ ...formData, category_id: categoryId, category_name: categoryName });
    if (errors.category_id) {
      const newErrors = { ...errors };
      delete newErrors.category_id;
      setErrors(newErrors);
    }
  };

  // Sync with initialData if it changes (e.g. from AI)
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        // Preserve previews if not in initialData, unless needed
      }));
      const initialPrice = Number(initialData.price || 0);
      const shouldShowPrice = !initialData.ask_for_price;
      setPriceVisibilityMode(shouldShowPrice ? "show" : "hide");
      if (shouldShowPrice) {
        setLastVisiblePrice(initialPrice);
      }
    }
  }, [initialData]);

  // --- Watch Logic: مراقبة التغييرات لحذف الأخطاء ---
  useEffect(() => {
    const newErrors = { ...errors };
    let hasChanges = false;

    if (errors.name && formData.name.trim()) {
      delete newErrors.name;
      hasChanges = true;
    }

    if (errors.cover && formData.cover) {
      delete newErrors.cover;
      hasChanges = true;
    }

    if (errors.category_id === "الفئة مطلوبة" && formData.category_id) {
      delete newErrors.category_id;
      hasChanges = true;
    }

    if (errors.price) {
      const priceValid =
        priceVisibilityMode === "hide" ||
        formData.ask_for_price ||
        Number(formData.price) > 0;
      if (priceValid) {
        delete newErrors.price;
        hasChanges = true;
      }
    }

    if (errors.short_description && formData.short_description.trim()) {
      delete newErrors.short_description;
      hasChanges = true;
    }
    if (errors.description && formData.description.trim()) {
      delete newErrors.description;
      hasChanges = true;
    }

    if (hasChanges) {
      setErrors(newErrors);
    }
  }, [formData, errors, priceVisibilityMode]);
  // --------------------------------------------------

  const getStep1Payload = (): Step1FormData => ({
    ...formData,
    ask_for_price: priceVisibilityMode === "hide",
    price: priceVisibilityMode === "hide" ? 0 : formData.price,
  });

  const scrollToFirstError = (firstKey: string) => {
    const element =
      (firstKey === "cover"
        ? document.getElementById("product-step1-cover")
        : null) ||
      document.querySelector(`[name="${firstKey}"]`) ||
      document.querySelector(".text-red-500");
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const runStep1Validation = (): Record<string, string> => {
    const newErrors = validateProductStep1(getStep1Payload());
    setErrors(newErrors);
    return newErrors;
  };

  const handleStepperClick = (targetStep: number) => {
    if (targetStep > 1) {
      const newErrors = runStep1Validation();
      const keys = Object.keys(newErrors);
      if (keys.length > 0) {
        scrollToFirstError(keys[0]);
        return;
      }
      onStep1Sync?.(getStep1Payload());
    }
    onStepClick?.(targetStep);
  };

  const handleNext = () => {
    const newErrors = runStep1Validation();
    const keys = Object.keys(newErrors);
    if (keys.length === 0) {
      onNext(getStep1Payload());
      return;
    }
    scrollToFirstError(keys[0]);
  };

  const combinedFiles = useMemo(() => {
    return formData.cover
      ? [formData.cover, ...formData.gallery]
      : [...formData.gallery];
  }, [formData.cover, formData.gallery]);

  const combinedPreviews = useMemo(() => {
    return formData.cover_preview
      ? [formData.cover_preview, ...formData.gallery_previews]
      : [...formData.gallery_previews];
  }, [formData.cover_preview, formData.gallery_previews]);

  const handleImagesChange = (files: string[], urls: string[]) => {
    const newCover = files.length > 0 ? files[0] : "";
    const newCoverUrl = urls.length > 0 ? urls[0] : "";

    const newGallery = files.length > 1 ? files.slice(1) : [];
    const newGalleryUrls = urls.length > 1 ? urls.slice(1) : [];

    setFormData({
      ...formData,
      cover: newCover,
      cover_preview: newCoverUrl,
      gallery: newGallery,
      gallery_previews: newGalleryUrls,
    });
  };


  const scrollToCategoryDropdown = () => {
    if (categoryDropdownRef.current) {
      categoryDropdownRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

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
          onStepClick={onStepClick ? handleStepperClick : undefined}
        />

        <div className="grid grid-cols-12 gap-4 mt-8">
          <div className="col-span-12 lg:col-span-9">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold">المعلومات الأساسية</h2>
              </div>

              {formData.category_name && (
                <div className="bg-[#F8F8F8] rounded-md p-6 mb-8 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-medium ">
                      {formData.category_name}
                    </h3>
                    <p className="text-xs text-gray-3">
                      منتجات خاصة بـ {formData.category_name} ومتعلقاتها
                    </p>
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

              <div className="space-y-8">
                <div id="product-step1-cover">
                <ImageGallerySelector
                  label=" الصور"
                  subLabel="حتى 10 ملفات: صورة رئيسية واحدة (صورة فقط) + باقي المعرض يقبل صورًا وفيديو (فيديو واحد كحد أقصى)"
                  value={combinedFiles}
                  previews={combinedPreviews}
                  onChange={handleImagesChange}
                  maxFiles={10}
                  error={errors.cover}
                  showMainSelector={true}
                  mainImageLabel="الصوره الرئيسية"
                  showDragHint={true}
                  dragHintText="يمكنك سحب وإفلات الصور أو الفيديو لإعادة الترتيب"
                  emptyStateText="أضف صورة الغلاف"
                  emptyStateSubText="الموضع الأول صورة فقط؛ بعدها يمكن إضافة صور وفيديو للمعرض"
                  mainImageAllowedMediaTypes={["image"]}
                  allowedMediaTypes={["gallery", "image", "video"]}
                  required
                />
                </div>

                <FormInput
                  label="اسم المنتج"
                  name="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="ادخل اسم المنتج"
                  hint="قم بتضمين الكلمات الرئيسية التي يستخدمها المشترون للبحث عن هذا العنصر."
                  required
                  maxLength={140}
                  showCounter
                  error={errors.name}
                />

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    اختار طريقة ظهور سعر سلعتك! <span className="text-red-500">*</span>
                  </Label>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPriceVisibilityMode("show");
                        setFormData((prev) => ({
                          ...prev,
                          ask_for_price: false,
                          price: prev.price > 0 ? prev.price : lastVisiblePrice,
                        }));
                      }}
                      className={cn(
                        "w-full border rounded-sm p-3 text-right transition-colors",
                        priceVisibilityMode === "show"
                          ? "border-blue-4 bg-[#EEF3FB]"
                          : "border-gray-200 bg-[#F8F8F8]"
                      )}
                    >
                      <div className="flex items-center gap-3 text-sm">
                        <span
                          className={cn(
                            "shrink-0 w-4 h-4 rounded-full border flex items-center justify-center",
                            priceVisibilityMode === "show" ? "border-blue-4" : "border-gray-400"
                          )}
                          aria-hidden
                        >
                          {priceVisibilityMode === "show" && <span className="w-2 h-2 rounded-full bg-blue-4" />}
                        </span>
                        <span className={cn("text-right", priceVisibilityMode === "show" ? "text-blue-4" : "text-gray-700")}>
                          إظهار السعر
                        </span>
                      </div>

                      {priceVisibilityMode === "show" && (
                        <div className="mt-3">
                          <input
                            type="number"
                            min="0"
                            value={formData.price || ""}
                            onChange={(e) => {
                              const parsedPrice = Number(e.target.value);
                              setFormData({
                                ...formData,
                                price: parsedPrice,
                              });
                              if (parsedPrice > 0) {
                                setLastVisiblePrice(parsedPrice);
                              }
                            }}
                            placeholder="ادخل سعر السلعة"
                            className={cn(
                              "w-full px-4 py-2 border rounded-sm focus:outline-none text-sm bg-white",
                              errors.price ? "border-red-500" : "border-gray-200"
                            )}
                          />
                        </div>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (formData.price > 0) {
                          setLastVisiblePrice(formData.price);
                        }
                        setPriceVisibilityMode("hide");
                        setFormData({
                          ...formData,
                          ask_for_price: true,
                          price: 0,
                        });
                        if (errors.price) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.price;
                            return next;
                          });
                        }
                      }}
                      className={cn(
                        "w-full border rounded-sm p-3 text-right transition-colors",
                        priceVisibilityMode === "hide"
                          ? "border-blue-4 bg-[#EEF3FB]"
                          : "border-gray-200 bg-[#F8F8F8]"
                      )}
                    >
                      <div className="flex items-center gap-3 text-sm">
                        <span
                          className={cn(
                            "shrink-0 w-4 h-4 rounded-full border flex items-center justify-center",
                            priceVisibilityMode === "hide" ? "border-blue-4" : "border-gray-400"
                          )}
                          aria-hidden
                        >
                          {priceVisibilityMode === "hide" && <span className="w-2 h-2 rounded-full bg-blue-4" />}
                        </span>
                        <span className={cn("text-right", priceVisibilityMode === "hide" ? "text-blue-4" : "text-gray-700")}>
                          لا اريد اظهار السعر
                        </span>
                      </div>
                    </button>
                  </div>
                  {errors.price && (
                    <p className="text-xs text-red-500 mt-1">{errors.price}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2" ref={categoryDropdownRef}>
                    <Label className="text-sm font-medium flex items-center gap-1">
                      الفئات <span className="text-red-500">*</span>
                    </Label>
                    {/* زر يفتح CategoryPickerModal */}
                    <button
                      type="button"
                      name="category_id"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className={cn(
                        "w-full h-11 flex items-center justify-between px-4 border rounded-sm text-sm transition-colors focus:outline-none bg-white",
                        errors.category_id
                          ? "border-red-500"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <span className={cn("truncate text-right", formData.category_name ? "text-gray-900" : "text-gray-400")}>
                        {formData.category_name || "اختر فئة المنتج"}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ms-2" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">حالة المنتج</Label>
                    <ReusableDropdown
                      options={CONDITION_OPTIONS}
                      value={formData.condition}
                      onChange={(value) =>
                        setFormData({
                          ...formData,
                          condition: value as "new" | "used",
                        })
                      }
                      placeholder="اختر الحالة"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      الوصف الموجز
                    </Label>
                    <Tooltip
                      trigger={
                        <div className="flex items-center gap-1 text-blue-4 cursor-pointer">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">
                            ماهو الوصف الموجز
                          </span>
                        </div>
                      }
                      content="اكتب وصفًا قصيرًا يوضح الفكرة الأساسية عن المنتج (مثل النوع، الاستخدام، أو أهم ميزة). يظهر هذا الوصف في نتائج البحث وصفحات العرض السريعة، لذلك اجعله واضحًا وجذابًا في جملة أو جملتين فقط."
                    />
                  </div>
                  <textarea
                    value={formData.short_description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        short_description: e.target.value,
                      })
                    }
                    placeholder="اكتب وصفاً مختصراً..."
                    maxLength={300}
                    rows={3}
                    className={cn(
                      "w-full px-4 py-3 border  rounded-lg  text-sm resize-none placeholder:text-gray-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
                      errors.short_description
                        ? "border-red-500"
                        : "border-gray-200"
                    )}
                  />
                  {!errors.short_description && (
                    <div className="flex justify-between text-xs text-gray-3">
                      <span>عدد الكلمات المتاحة في الوصف هي 70 كلمة </span>
                      <span>{formData.short_description.length}/300 حرف</span>
                    </div>
                  )}
                  {errors.short_description && (
                    <p className="text-xs text-red-500">
                      {errors.short_description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">

                  <RichTextEditor
                    value={formData.description}
                    onChange={(val) =>
                      setFormData({ ...formData, description: val })
                    }
                    label="وصف المنتج"
                    required
                    placeholder="اكتب وصفاً تفصيلاً..."
                    helpText="ماهو وصف المنتج"
                    helpTooltip="اكتب وصفًا تفصيليًا يشرح مميزات المنتج، خامته، طريقة استخدامه، والمعلومات الإضافية التي قد تساعد العميل في اتخاذ قرار الشراء. يمكنك استخدام فقرات أو نقاط مرتبة لتوضيح التفاصيل."
                    error={errors.description}
                    className="max-h-[400px] min-h-[200px]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-3">
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

      <ProductFormActions
        onNext={handleNext}
        onCancel={onCancel}
        onSaveDraft={onSaveDraft}
        showBack={false}
        showCancel={true}
        showSaveDraft={showSaveDraft}
      />

      <CategoryPickerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSelect={handleCategorySelect}
        selectedCategoryId={formData.category_id || undefined}
      />
    </div >
  );
}