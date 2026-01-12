"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { HelpCircle } from "lucide-react";
import { ProductPreviewSidebar } from "./ProductPreviewSidebar";
import { ProductFormActions } from "./ProductFormActions";
import { ImageGallerySelector } from "@/src/components/ui/ImageGallerySelector";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { FormInput } from "@/src/components/ui/FormInput";
import { Label } from "@/src/components/ui/label";
import { RichTextEditor } from "@/src/components/ui/RichTextEditor";
import { Step1FormData } from "../types";
import { cn } from "@/src/lib/utils";
// ✅ استبدال useGetCategories بـ useGetCategoryOptions
import { useGetCategoryOptions } from "../../categoriesAndAttributes/hooks";
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
  showSaveDraft?: boolean;
}

const CONDITION_OPTIONS = [
  { value: "new", label: "جديد" },
  { value: "used", label: "مستعمل" },
  { value: "refurbished", label: "مجدد" },
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
  showSaveDraft = true,
}: AddProductStep1Props) {
  const [formData, setFormData] = useState<Step1FormData>({
    category_id: initialData?.category_id || 0,
    cover: initialData?.cover || "",
    cover_preview: initialData?.cover_preview || "",
    gallery: initialData?.gallery || [],
    gallery_previews: initialData?.gallery_previews || [],
    name: initialData?.name || "",
    price: initialData?.price || 0,
    condition: initialData?.condition || "new",
    short_description: initialData?.short_description || "",
    description: initialData?.description || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ حالة البحث عن الفئات
  const [categorySearchQuery, setCategorySearchQuery] = useState("");

  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // ✅ استخدام الهوك الجديد لجلب الخيارات
  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetCategoryOptions();

  // ✅ تصفية الخيارات بناءً على البحث
  const categoryOptions = useMemo(() => {
    const options = categoriesData?.categories?.map((cat) => ({
      value: String(cat.id),
      label: cat.name,
    })) || [];

    if (!categorySearchQuery) return options;

    return options.filter((opt) =>
      opt.label.toLowerCase().includes(categorySearchQuery.toLowerCase())
    );
  }, [categoriesData, categorySearchQuery]);

  // البحث عن الفئة المختارة لعرض اسمها (للتأكد من العرض الصحيح في الـ Info Box)
  const selectedCategory = useMemo(() => {
    return categoriesData?.categories?.find((c) => c.id === formData.category_id);
  }, [categoriesData, formData.category_id]);

  const defaultBreadcrumbItems = [
    { label: "المنتجات", href: "/dashboard/products" },
    { label: "انشاء منتج جديد" },
  ];

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

    if (errors.category_id && formData.category_id) {
      delete newErrors.category_id;
      hasChanges = true;
    }

    if (errors.price && formData.price >= 0) {
      delete newErrors.price;
      hasChanges = true;
    }

    if (errors.short_description) {
      delete newErrors.short_description;
      hasChanges = true;
    }
    if (errors.description) {
      delete newErrors.description;
      hasChanges = true;
    }

    if (hasChanges) {
      setErrors(newErrors);
    }
  }, [formData, errors]);
  // --------------------------------------------------

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "اسم المنتج مطلوب";
    }

    if (!formData.cover) {
      newErrors.cover = "صورة المنتج مطلوبة (يجب إضافة صورة واحدة على الأقل)";
    }

    if (!formData.category_id) {
      newErrors.category_id = "الفئة مطلوبة";
    }

    if (formData.price < 0) {
      newErrors.price = "لا يمكن أن يكون السعر أقل من صفر";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext(formData);
    } else {
      const firstError = Object.keys(errors)[0];
      const element =
        document.querySelector(`[name="${firstError}"]`) ||
        document.querySelector(".text-red-500");
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
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
          onStepClick={onStepClick}
        />

        <div className="grid grid-cols-12 gap-4 mt-8">
          <div className="col-span-12 lg:col-span-9">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold">المعلومات الأساسية</h2>
              </div>

              {selectedCategory && (
                <div className="bg-[#F8F8F8] rounded-md p-6 mb-8 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-medium ">
                      {selectedCategory.name}
                    </h3>
                    <p className="text-xs text-gray-3">
                      منتجات خاصة بـ {selectedCategory.name} ومتعلقاتها
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={scrollToCategoryDropdown}
                    className="text-blue-4 font-bold text-sm cursor-pointer hover:underline"
                  >
                    تغيير
                  </button>
                </div>
              )}

              <div className="space-y-8">
                <ImageGallerySelector
                  label=" الصور"
                  subLabel="يمكنك إضافة حتى (10) صور و (١) فيديو "
                  value={combinedFiles}
                  previews={combinedPreviews}
                  onChange={handleImagesChange}
                  maxFiles={10}
                  error={errors.cover}
                  showMainSelector={true}
                  mainImageLabel="الصوره الرئيسية"
                  showDragHint={true}
                  allowedMediaTypes={["image", "gallery"]}
                />

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
                    السعر
                  </Label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={formData.price || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: Number(e.target.value),
                        })
                      }
                      placeholder="ادخل سعر المنتج"
                      className={cn(
                        "w-full px-4 py-3 border rounded-sm focus:outline-none  text-sm ",
                        errors.price ? "border-red-500" : "border-gray-200"
                      )}
                    />
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
                    {/* ✅ تفعيل البحث في القائمة المنسدلة */}
                    <ReusableDropdown
                      options={categoryOptions}
                      value={
                        formData.category_id
                          ? String(formData.category_id)
                          : ""
                      }
                      onChange={(value) =>
                        setFormData({ ...formData, category_id: Number(value) })
                      }
                      placeholder={
                        isCategoriesLoading ? "جاري التحميل..." : "ابحث عن اسم الفئة"
                      }
                      error={errors.category_id}
                      className="h-11"
                      onSearch={(val) => setCategorySearchQuery(val)} // تفعيل البحث
                      searchPlaceholder="ابحث عن الفئة..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">حالة المنتج</Label>
                    <ReusableDropdown
                      options={CONDITION_OPTIONS}
                      value={formData.condition}
                      onChange={(value) =>
                        setFormData({
                          ...formData,
                          condition: value as "new" | "used" | "refurbished",
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
                      "w-full px-4 py-3 border rounded-lg focus:outline-none  text-sm resize-none placeholder:text-gray-2",
                      errors.short_description
                        ? "border-red-500"
                        : "border-gray-200"
                    )}
                  />
                  {!errors.short_description && (
                    <div className="flex justify-between text-xs text-gray-3">
                      <span>عدد الكلمات المتاحة في الوصف هي 70 كلمة </span>
                      <span>{formData.short_description.length}/300</span>
                    </div>
                  )}
                  {errors.short_description && (
                    <p className="text-xs text-red-500">
                      {errors.short_description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label className="text-sm font-medium">وصف المنتج</Label>
                  </div>

                  <RichTextEditor
                    maxLength={300}
                    maxWords={70}
                    value={formData.description}
                    onChange={(val) =>
                      setFormData({ ...formData, description: val })
                    }
                    label=""
                    placeholder="...نص المحتوى"
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
                coverImage: formData.cover_preview,
                galleryImages: formData.gallery_previews,
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
    </div>
  );
}