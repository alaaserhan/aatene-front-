// src/features/(dashboard)/banners/components/BannerFormPage.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { FormInput } from "@/src/components/ui/FormInput";
import { DatePicker } from "@/src/components/ui/DatePicker";
import { ImageUploadBanner } from "./ImageUploadBanner";
import { Button } from "@/src/components/ui/button";
import { useCreateBanner, useUpdateBanner, useGetSingleBanner } from "../hooks";
import { useGetCities } from "../../cities/hooks";
import { Loader2 } from "lucide-react";
import { ToggleSwitch } from "@/src/components/ui/ToggleSwitch";
import { BannerCreatePayload, BannerUpdatePayload } from "../api";
import { FormSelect } from "@/src/components/ui/FormSelect";

interface BannerFormData {
  title: string;
  description: string;
  city_id: string;
  place: string;
  url: string;
  start_date: string;
  end_date: string;
  priority: string;
  is_active: boolean | string;
  labtop_banner: File | null;
  mobile_banner: File | null;
}

interface BannerFormPageProps {
  mode: "create" | "edit";
  bannerId?: string | number;
}

export function BannerFormPage({ mode, bannerId }: BannerFormPageProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<BannerFormData>({
    title: "",
    description: "",
    city_id: "",
    place: "",
    url: "",
    start_date: "",
    end_date: "",
    priority: "0",
    is_active: true,
    labtop_banner: null,
    mobile_banner: null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BannerFormData, string>>>({});

  // Get cities for dropdown
  const { data: citiesData } = useGetCities(new URLSearchParams());
  const cities = citiesData?.data || [];

  // Get banner data if editing
  const { data: bannerData, isLoading: isLoadingBanner } = useGetSingleBanner(
    mode === "edit" && bannerId ? bannerId : ""
  );

  // Mutations
  const createBannerMutation = useCreateBanner();
  const updateBannerMutation = useUpdateBanner();

  // Load banner data when editing
  useEffect(() => {
    if (mode === "edit" && bannerData?.record) {
      const banner = bannerData.record;
      setFormData({
        title: banner.title || "",
        description: banner.description || "",
        city_id: banner.city_id || "",
        place: banner.place || "",
        url: banner.url || "",
        start_date: banner.start_date || "",
        end_date: banner.end_date || "",
        priority: banner.priority || "0",
        is_active: banner.is_active,
        labtop_banner: null,
        mobile_banner: null,
      });
    }
  }, [mode, bannerData]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof BannerFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = "عنوان البانر مطلوب";
    }

    if (!formData.url.trim()) {
      newErrors.url = "رابط URL مطلوب";
    }

    if (!formData.start_date) {
      newErrors.start_date = "تاريخ البداية مطلوب";
    }

    if (!formData.end_date) {
      newErrors.end_date = "تاريخ الانتهاء مطلوب";
    }

    if (mode === "create") {
      if (!formData.labtop_banner) {
        newErrors.labtop_banner = "صورة الكمبيوتر مطلوبة";
      }
      if (!formData.mobile_banner) {
        newErrors.mobile_banner = "صورة الموبايل مطلوبة";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const payload: Partial<BannerFormData> = {
      title: formData.title,
      description: formData.description,
      city_id: formData.city_id || undefined,
      place: formData.place,
      url: formData.url,
      start_date: formData.start_date,
      end_date: formData.end_date,
      is_active: formData.is_active ? "1" : "0",
      priority: formData.priority,
    };

    if (formData.labtop_banner) {
      payload.labtop_banner = formData.labtop_banner;
    }

    if (formData.mobile_banner) {
      payload.mobile_banner = formData.mobile_banner;
    }

    if (mode === "create") {
      createBannerMutation.mutate(payload as BannerCreatePayload, {
        onSuccess: () => {
          router.push("/dashboard/banners");
        },
      });
    } else if (mode === "edit" && bannerId) {
      updateBannerMutation.mutate(
        { id: bannerId, payload : payload as BannerUpdatePayload },
        {
          onSuccess: () => {
            router.push("/dashboard/banners");
          },
        }
      );
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/banners");
  };

  const breadcrumbItems = [
    { label: "بنرات إعلانية", href: "/dashboard/banners" },
    { label: mode === "create" ? "إضافة إعلان جديد" : "تعديل إعلان" },
  ];

  if (mode === "edit" && isLoadingBanner) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-3" />
          <span>جاري تحميل البيانات...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} className="" />

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-blue-4 mb-8 text-right">
            {mode === "create" ? "إضافة إعلان جديد" : "تعديل إعلان"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* عنوان البانر */}
            <FormInput
              label="عنوان البانر"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="اكتب عنوان البانر"
              hint="قم بتضمين الكلمات الرئيسية التي يستخدمها المشترون للبحث عن هذا العنصر."
              maxLength={40}
              showCounter
              error={errors.title}
            />

            {/* وصف قصير */}
            <FormInput
              label="وصف قصير"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="اكتب وصف البانر"
              hint="قم بتضمين الكلمات الرئيسية التي يستخدمها المشترون للبحث عن هذا العنصر."
              maxLength={75}
              showCounter
              error={errors.description}
            />

            {/* المدينة أو الحي المراد ظهور الإعلان لسكانه */}
            <FormSelect
              label="المدينة أو الحي المراد ظهور الإعلان لسكانه"
              value={formData.city_id}
              onChange={(e) => setFormData({ ...formData, city_id: e.target.value })}
              options={[
                { value: "", label: "الكل" },
                ...cities.map((city) => ({
                  value: city.id.toString(),
                  label: city.name,
                })),
              ]}
              error={errors.city_id}
            />

            {/* مكان الإعلان */}
            <FormInput
              label="مكان الإعلان"
              value={formData.place}
              onChange={(e) => setFormData({ ...formData, place: e.target.value })}
              placeholder="ضع مكان واحد الإعلان (1,2,3,4,5,6)"
              error={errors.place}
            />

            {/* رابط URL */}
            <FormInput
              label="رابط URL"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="رابط الإعلان (يجب البدء بـhttps://)"
              error={errors.url}
            />

            {/* تاريخ بداية ونهاية الإعلان */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePicker
                label="تاريخ بداية الإعلان"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                error={errors.start_date}
              />

              <DatePicker
                label="تاريخ انتهاء الإعلان"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                error={errors.end_date}
              />
            </div>

            {/* أولوية الإعلان (ترتيب) */}
            <FormInput
              label="أولوية الإعلان (ترتيب)"
              type="number"
              min="0"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              placeholder="0"
              error={errors.priority}
            />

            {/* تفعيل/تعطيل الإعلان */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-brand-black-1 text-right">
                تفعيل/تعطيل الإعلان
              </label>
              <div className="flex items-center justify-end gap-3">
                <ToggleSwitch
                  enabled={formData.is_active}
                  onChange={(isActive) => setFormData({ ...formData, is_active: isActive })}
                />
              </div>
            </div>

            {/* رفع صورة للعرض على الكمبيوتر */}
            <ImageUploadBanner
              label="رفع صورة للعرض على الكمبيوتر"
              width={1170}
              height={300}
              value={
                mode === "edit" && bannerData?.record?.labtop_banner_url
                  ? bannerData.record.labtop_banner_url
                  : formData.labtop_banner
              }
              onChange={(file) => setFormData({ ...formData, labtop_banner: file })}
              error={errors.labtop_banner}
            />

            {/* رفع صورة للعرض على الموبايل */}
            <ImageUploadBanner
              label="رفع صورة للعرض على الموبايل"
              width={360}
              height={200}
              value={
                mode === "edit" && bannerData?.record?.mobile_banner_url
                  ? bannerData.record.mobile_banner_url
                  : formData.mobile_banner
              }
              onChange={(file) => setFormData({ ...formData, mobile_banner: file })}
              error={errors.mobile_banner}
            />

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="px-8 py-3 cursor-pointer"
              >
                إلغاء وإغلاق
              </Button>
              <Button
                type="submit"
                disabled={createBannerMutation.isPending || updateBannerMutation.isPending}
                className="px-8 py-3 cursor-pointer"
                style={{ backgroundColor: "var(--blue-3)" }}
              >
                {(createBannerMutation.isPending || updateBannerMutation.isPending) ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري الحفظ...
                  </span>
                ) : (
                  "حفظ وإضافة"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}