"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { FormInput } from "@/src/components/ui/FormInput";
import { DatePicker } from "@/src/components/ui/DatePicker";
import { Button } from "@/src/components/ui/button";
import { useCreateBanner, useUpdateBanner, useGetSingleBanner } from "../hooks";
import { useGetCities } from "../../cities/hooks";
import { Loader2 } from "lucide-react";
import { ToggleSwitch } from "@/src/components/ui/ToggleSwitch";
import { BannerCreatePayload, BannerUpdatePayload } from "../api";
import { MediaSelectButton } from "../../mediaCenter/components/MediaSelectButton";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";

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
  mobile_banner: string | null;
  mobile_banner_preview: string | null;
  labtop_banner: string | null;
  labtop_banner_preview: string | null;
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
    mobile_banner: null,
    mobile_banner_preview: null,
    labtop_banner: null,
    labtop_banner_preview: null,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof BannerFormData, string>>
  >({});

  const { data: citiesData } = useGetCities(new URLSearchParams());
  const cities = citiesData?.data || [];

  const { data: bannerData, isLoading: isLoadingBanner } = useGetSingleBanner(
    mode === "edit" && bannerId ? bannerId : ""
  );

  const createBannerMutation = useCreateBanner();
  const updateBannerMutation = useUpdateBanner();

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
        labtop_banner: banner.labtop_banner || null,
        labtop_banner_preview: banner.labtop_banner_url || null,
        mobile_banner: banner.mobile_banner || null,
        mobile_banner_preview: banner.mobile_banner_url || null,
      });
    }
  }, [mode, bannerData]);

  useEffect(() => {
    const newErrors = { ...errors };
    let hasChanges = false;

    if (errors.title && formData.title.trim()) {
      delete newErrors.title;
      hasChanges = true;
    }

    if (errors.city_id && formData.city_id) {
      delete newErrors.city_id;
      hasChanges = true;
    }

    if (errors.url && isValidUrl(formData.url)) {
      delete newErrors.url;
      hasChanges = true;
    }

    if (errors.start_date && formData.start_date) {
      delete newErrors.start_date;
      hasChanges = true;
    }
    if (errors.end_date && formData.end_date) {
      delete newErrors.end_date;
      hasChanges = true;
    }

    if (errors.labtop_banner && formData.labtop_banner) {
      delete newErrors.labtop_banner;
      hasChanges = true;
    }
    if (errors.mobile_banner && formData.mobile_banner) {
      delete newErrors.mobile_banner;
      hasChanges = true;
    }

    if (hasChanges) {
      setErrors(newErrors);
    }
  }, [formData, errors]);

  const isValidUrl = (urlStr: string) => {
    try {
      new URL(urlStr);
      return true;
    } catch {
      return false;
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof BannerFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = "عنوان البانر مطلوب";
    }

    if (!formData.city_id) {
      newErrors.city_id = "المدينة مطلوبة";
    }

    if (!formData.url.trim()) {
      newErrors.url = "رابط URL مطلوب";
    } else if (!isValidUrl(formData.url)) {
      newErrors.url = "الرابط غير صحيح (يجب أن يبدأ بـ http:// أو https://)";
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

    const payload = {
      title: formData.title,
      description: formData.description,
      city_id: formData.city_id || undefined,
      place: formData.place,
      url: formData.url,
      start_date: formData.start_date,
      end_date: formData.end_date,
      is_active: formData.is_active ? "1" : "0",
      priority: formData.priority,
      labtop_banner: formData.labtop_banner,
      mobile_banner: formData.mobile_banner,
    };

    if (mode === "create") {
      createBannerMutation.mutate(payload as BannerCreatePayload, {
        onSuccess: () => {
          router.push("/dashboard/banners");
        },
      });
    } else if (mode === "edit" && bannerId) {
      updateBannerMutation.mutate(
        { id: bannerId, payload: payload as BannerUpdatePayload },
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
        <Breadcrumb items={breadcrumbItems} className="" />

        <div className="bg-white rounded-lg border border-gray-200 mb-4 p-6 ">
          <h1 className="text-2xl font-bold text-blue-4 mb-8 text-right">
            {mode === "create" ? "إضافة إعلان جديد" : "تعديل إعلان"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              label="عنوان البانر"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="اكتب عنوان البانر"
              hint="قم بتضمين الكلمات الرئيسية التي يستخدمها المشترون للبحث عن هذا العنصر."
              maxLength={40}
              showCounter
              error={errors.title}
            />

            <FormInput
              label="وصف قصير"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="اكتب وصف البانر"
              hint="قم بتضمين الكلمات الرئيسية التي يستخدمها المشترون للبحث عن هذا العنصر."
              maxLength={75}
              showCounter
              error={errors.description}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                المدينة المراد ظهور الإعلان لسكانه
              </label>
              <ReusableDropdown
                value={formData.city_id}
                onChange={(value) =>
                  setFormData({ ...formData, city_id: value })
                }
                options={[
                  { value: "", label: "الكل" },
                  ...cities.map((city) => ({
                    value: city.id.toString(),
                    label: city.name,
                  })),
                ]}
                error={errors.city_id}
                placeholder="اختر المدينة"
              />
            </div>

            <FormInput
              label="مكان الإعلان"
              value={formData.place}
              onChange={(e) =>
                setFormData({ ...formData, place: e.target.value })
              }
              placeholder="ضع مكان واحد الإعلان (1,2,3,4,5,6)"
              error={errors.place}
            />

            <FormInput
              label="رابط URL"
              type="url"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              placeholder="رابط الإعلان (يجب البدء بـhttps://)"
              error={errors.url}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePicker
                label="تاريخ بداية الإعلان"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                error={errors.start_date}
              />

              <DatePicker
                label="تاريخ انتهاء الإعلان"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                error={errors.end_date}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium">
                  تفعيل/تعطيل الإعلان
                </label>
                <ToggleSwitch
                  enabled={
                    formData.is_active === "1" || formData.is_active === true
                  }
                  onChange={(isActive) =>
                    setFormData({ ...formData, is_active: isActive })
                  }
                />
              </div>

              <FormInput
                label="أولوية الإعلان (ترتيب)"
                type="number"
                min="0"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                placeholder="0"
                error={errors.priority}
              />
            </div>

            <MediaSelectButton
              label="رفع صورة للعرض على الكمبيوتر"
              width={1170}
              height={300}
              value={formData.labtop_banner}
              previewUrl={formData.labtop_banner_preview}
              onChange={(fileName, src) =>
                setFormData({
                  ...formData,
                  labtop_banner: fileName,
                  labtop_banner_preview: src,
                })
              }
              error={errors.labtop_banner}
              accept="image/png,image/jpeg,image/jpg"
              primaryText="اضف ملف"
              allowedMediaTypes={["gallery", "image"]}
            />

            <MediaSelectButton
              label="رفع صورة للعرض على الموبايل"
              width={360}
              height={200}
              value={formData.mobile_banner}
              previewUrl={formData.mobile_banner_preview}
              onChange={(fileName, src) =>
                setFormData({
                  ...formData,
                  mobile_banner: fileName,
                  mobile_banner_preview: src,
                })
              }
              error={errors.mobile_banner}
              accept="image/png,image/jpeg,image/jpg"
              primaryText="أضف صورة للموبايل"
              allowedMediaTypes={["gallery", "image"]}
            />

            <div className="flex gap-4 justify-between pt-6">
              <Button
                type="submit"
                disabled={
                  createBannerMutation.isPending ||
                  updateBannerMutation.isPending
                }
                className="px-8 py-3 cursor-pointer"
                style={{ backgroundColor: "var(--blue-3)" }}
              >
                {createBannerMutation.isPending ||
                updateBannerMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري الحفظ...
                  </span>
                ) : (
                  "حفظ وإضافة"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="px-8 py-3 cursor-pointer"
              >
                إلغاء وإغلاق
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}