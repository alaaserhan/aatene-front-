// src/features/(dashboard)/stores/components/AddStoreStep2.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { FormInput } from "@/src/components/ui/FormInput";
import { FormSelect } from "@/src/components/ui/FormSelect";
import { MediaSelectButton } from "../../mediaCenter/components/MediaSelectButton";
import { MediaMultiSelect } from "@/src/components/ui/MediaMultiSelect";
import { StepperProgress } from "./StepperProgress";
import { StorePreviewSidebar } from "./StorePreviewSidebar";
import { useGetCities } from "../../cities/hooks";
import { StoreType } from "../api";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Step2FormData } from "../types";

interface AddStoreStep2Props {
  storeType: StoreType;
  initialData?: Step2FormData;
  onNext: (data: Step2FormData) => void;
  onBack: () => void;
}

export function AddStoreStep2({
  storeType,
  initialData,
  onNext,
  onBack,
}: AddStoreStep2Props) {
  const router = useRouter();
  const [formData, setFormData] = useState<Step2FormData>({
    name: initialData?.name || "",
    logo: initialData?.logo || null,
    logo_preview: initialData?.logo_preview || null,
    cover: initialData?.cover || [],
    cover_previews: initialData?.cover_previews || [],
    description: initialData?.description || "",
    email: initialData?.email || "",
    city_id: initialData?.city_id || "",
    address: initialData?.address || "",
    owner_id: initialData?.owner_id || "",
    currency_id: initialData?.currency_id || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: citiesData } = useGetCities(new URLSearchParams());
  const cities = citiesData?.data || [];

  const steps = [
    { number: 1, label: "البيانات الأساسية", completed: false },
    { number: 2, label: "الاتصال والسوشيال ميديا", completed: false },
    { number: 3, label: "موظفين المتجر", completed: false },
    { number: 4, label: "أوقات العمل و العطلات", completed: false },
    { number: 5, label: "طريقة الشحن", completed: false },
    { number: 6, label: "الكلمات المفتاحية", completed: false },
  ];

  const breadcrumbItems = [
    { label: "الرئيسية", href: "/admin" },
    { label: "المتاجر", href: "/admin/stores" },
    { label: "إضافة متجر" },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "اسم المتجر مطلوب";
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "البريد الإلكتروني غير صالح";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      setIsSubmitting(true);
      try {
        onNext(formData);
      } catch (error) {
        console.error(error);
        setIsSubmitting(false);
      }
    } else {
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const element = document.querySelector(`[name="${firstError}"]`);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handleCancel = () => {
    router.push("/admin/stores");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-4 px-4">
        <Breadcrumb items={breadcrumbItems} className="mb-4" />
        <StepperProgress currentStep={1} steps={steps} />

        <div className="grid grid-cols-12 gap-6 mt-8">
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-8">
                البيانات الأساسية
              </h2>

              <div className="space-y-6">
                <FormInput
                  label="اسم المتجر"
                  name="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="متجر الأفضل"
                  required
                  maxLength={50}
                  showCounter
                  error={errors.name}
                />

                <MediaSelectButton
                  label="هوية متجرك"
                  width={200}
                  height={200}
                  value={formData.logo}
                  previewUrl={formData.logo_preview}
                  onChange={(fileName, src) => {
                    setFormData({
                      ...formData,
                      logo: fileName,
                      logo_preview: src,
                    });
                  }}
                  accept="image/png,image/jpeg,image/jpg"
                  primaryText="رفع صورة"
                  allowedMediaTypes={["avatar", "image"]}
                  error={errors.logo}
                />

                <div className="space-y-2">
                  <Label className="block text-sm font-medium text-gray-900">
                    بنر المتجر (يمكنك إضافة حتى 10 بنرات)
                  </Label>
                  <MediaMultiSelect
                    value={formData.cover}
                    previewUrls={formData.cover_previews}
                    onChange={(fileNames, srcs) => {
                      setFormData({
                        ...formData,
                        cover: fileNames,
                        cover_previews: srcs,
                      });
                    }}
                    maxFiles={10}
                    allowedMediaTypes={["image", "gallery"]}
                    infoText={["المقاسات المناسبة لرفع الصورة 680 × 180 بكسل"]}
                  />
                  {errors.cover && (
                    <p className="text-xs text-red-500">{errors.cover}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-start text-sm font-medium text-gray-900"
                  >
                    وصف المتجر
                  </Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="هنا مثال لوصف المتجر"
                    maxLength={300}
                    className="flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px]"
                  />
                </div>

                <FormInput
                  label="البريد الإلكتروني"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="example@info.com"
                  error={errors.email}
                />

                <FormSelect
                  label="المدينة"
                  value={formData.city_id}
                  onChange={(e) =>
                    setFormData({ ...formData, city_id: e.target.value })
                  }
                  options={[
                    { value: "", label: "اختر المدينة" },
                    ...cities.map((city) => ({
                      value: city.id.toString(),
                      label: city.name,
                    })),
                  ]}
                />

                <div className="space-y-2">
                  <Label className="text-start text-sm font-medium text-gray-900">
                    العنوان
                  </Label>
                  <div className="flex items-center gap-3 ps-3 border border-gray-300 rounded-lg focus-within:border-blue-3 bg-white">
                    <img
                      src="/icons/dashboard/mark.svg"
                      alt=""
                      className="w-5 h-5"
                    />
                    <Input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="h-11 border-none shadow-none px-0 focus-visible:ring-0 text-start"
                      placeholder="شارع الخالد، مصر الجديدة..."
                    />
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 px-3 py-0 mx-0.5 text-xs whitespace-nowrap"
                    >
                      تحديد من الخريطة
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormSelect
                    label="المالك"
                    value={formData.owner_id}
                    onChange={(e) =>
                      setFormData({ ...formData, owner_id: e.target.value })
                    }
                    options={[
                      { value: "", label: "اختر المالك" },
                      { value: "1", label: "كرلس عادل" },
                    ]}
                  />

                  <FormSelect
                    label="العملة"
                    value={formData.currency_id}
                    onChange={(e) =>
                      setFormData({ ...formData, currency_id: e.target.value })
                    }
                    options={[
                      { value: "", label: "اختر العملة" },
                      { value: "1", label: "شيكل" },
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <StorePreviewSidebar
              data={{
                logo: formData.logo_preview,
                name: formData.name,
                description: formData.description,
                coverImages: formData.cover_previews,
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 justify-between mt-6 bg-white shadow-2xl p-6">
        <Button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting}
          className="px-12 py-5 cursor-pointer rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "var(--blue-3)" }}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              جاري الحفظ...
            </span>
          ) : (
            "حفظ والتالي"
          )}
        </Button>
        <Button
          type="button"
          onClick={handleCancel}
          variant="outline"
          disabled={isSubmitting}
          className="px-12 py-5 bg-gray-4 border-none cursor-pointer rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          إلغاء
        </Button>
      </div>
    </div>
  );
}