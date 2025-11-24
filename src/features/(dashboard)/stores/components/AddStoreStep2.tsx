// src/features/(dashboard)/stores/components/AddStoreStep2.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { FormInput } from "@/src/components/ui/FormInput";
import { FormSelect } from "@/src/components/ui/FormSelect"; // سيتم إزالة استخدامه
import { StoreIdentitySelector } from "./StoreIdentitySelector";
import { StoreBannerSelector } from "./StoreBannerSelector";
import { StepperProgress } from "./StepperProgress";
import { StorePreviewSidebar } from "./StorePreviewSidebar";
import { useGetCities } from "../../cities/hooks";
import { StoreType } from "../api";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Step2FormData } from "../types";
import { CityMultiSelect } from "./CityMultiSelect";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown"; // يجب استدعاء المكون الجديد
import { useGetUsers } from "../../users/hooks"; // استدعاء Hook لجلب المستخدمين
import { cn } from "@/src/lib/utils"; // لدمج الكلاسات (حسب القاعدة 1)
import { useAuthStore } from "@/src/stores/auth-store";

interface AddStoreStep2Props {
  storeType: StoreType;
  initialData?: Step2FormData;
  onNext: (data: Step2FormData) => void;
  onBack: () => void;
  currentUserId?: string;
  barSteps: { number: number; label: string; completed: boolean }[];
}

export function AddStoreStep2({
  storeType,
  initialData,
  onNext,
  onBack,
  currentUserId,
  barSteps
}: AddStoreStep2Props) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const userType = user?.user_type;
  const isAdmin = userType === "admin";
  const [formData, setFormData] = useState<Step2FormData>({
    name: initialData?.name || "",
    logo: initialData?.logo || null,
    logo_preview: initialData?.logo_preview || null,
    cover: initialData?.cover || [],
    cover_previews: initialData?.cover_previews || [],
    description: initialData?.description || "",
    email: initialData?.email || "",
    city_id: initialData?.city_id || [],
    address: initialData?.address || "",
    // تحديد owner_id تلقائيًا في حالة Merchant إذا لم يتم تعيينه مسبقًا
    owner_id: initialData?.owner_id || (!isAdmin && currentUserId ? currentUserId : ""),
    currency_id: initialData?.currency_id || "",
  });

  console.log(isAdmin);


  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. جلب بيانات المستخدمين فقط إذا كان المستخدم Admin
  const { data: usersData, isLoading: isUsersLoading } = useGetUsers(
    new URLSearchParams("per_page=100") // جلب قائمة كبيرة من المستخدمين لتكون خيارات
    , { enabled: isAdmin }); // تفعيل الجلب فقط لـ Admin

  const ownersOptions = usersData?.data
    ? usersData.data.map((user) => ({
      label: `${user.first_name} ${user.last_name} (${user.email})`,
      value: String(user.id),
    }))
    : [];

  // إضافة خيار افتراضي في البداية
  const ownerDropdownOptions = [
    { value: "", label: isUsersLoading ? "جاري التحميل..." : "اختر المالك" },
    ...ownersOptions,
  ];

  const { data: citiesData } = useGetCities(new URLSearchParams());
  const cities = citiesData?.data || [];

  const steps = barSteps

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

    // إضافة تحقق من الصورة إذا كانت مطلوبة
    if (!formData.logo) {
      newErrors.logo = "شعار المتجر مطلوب";
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "البريد الإلكتروني غير صالح";
    }

    // في حالة Admin، يجب التحقق من اختيار المالك
    if (isAdmin && !formData.owner_id) {
      newErrors.owner_id = "يجب اختيار مالك المتجر";
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
        // Scroll logic slightly adjusted to handle custom components better if needed
        const element = document.querySelector(`[name="${firstError}"]`) || document.querySelector(".text-red-500");
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handleCancel = () => {
    router.push("/admin/stores");
  };

  return (
    <div className="overflow-hidden">
      <div className="container mx-auto py-4 px-4">
        <Breadcrumb items={breadcrumbItems} className="mb-4" />
        <StepperProgress currentStep={1} steps={steps} />

        <div className="grid grid-cols-12 gap-6 mt-8">
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold  mb-8">
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

                {/* المكون الجديد لهوية المتجر */}
                <StoreIdentitySelector
                  value={formData.logo}
                  previewUrl={formData.logo_preview}
                  onChange={(fileName, src) => {
                    setFormData({
                      ...formData,
                      logo: fileName,
                      logo_preview: src,
                    });
                  }}
                  error={errors.logo}
                />

                {/* مكون البنرات الجديد */}
                <StoreBannerSelector
                  value={formData.cover}
                  previews={formData.cover_previews}
                  onChange={(fileNames, srcs) => {
                    setFormData({
                      ...formData,
                      cover: fileNames,
                      cover_previews: srcs,
                    });
                  }}
                  maxFiles={10}
                  error={errors.cover}
                />

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-start text-sm font-medium "
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
                    className={cn(
                      "flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px]",
                      { "border-red-500": errors.description } // إضافة حالة الخطأ
                    )}
                  />
                  {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
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

                <CityMultiSelect
                  cities={cities}
                  selectedCityIds={formData.city_id}
                  onChange={(ids) => setFormData({ ...formData, city_id: ids })}
                  error={errors.city_id}
                />

                <div className="space-y-2">
                  <Label className="text-start text-sm font-medium ">
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
                      className="h-10 border-none shadow-none px-0 focus-visible:ring-0 text-start"
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
                  {/* 3. تطبيق المنطق: إذا كان Admin، اعرض قائمة منسدلة قابلة للاختيار */}
                  {isAdmin ? (
                    <div className="flex flex-col">
                      <label htmlFor="" className="mb-3 text-sm font-medium">المالك</label>
                      <ReusableDropdown
                        placeholder={isUsersLoading ? "جاري جلب المالكين..." : "اختر المالك"}
                        options={ownerDropdownOptions}
                        value={formData.owner_id}
                        onChange={(value) =>
                          setFormData({ ...formData, owner_id: String(value) })
                        }
                        error={errors.owner_id}
                        className="h-11"
                        dropdownPosition="top"
                      />
                    </div>
                  ) : (
                    // 4. في حالة Merchant، إخفاء الحقل وتعيين المالك مسبقًا
                    <input type="hidden" name="owner_id" value={formData.owner_id} />
                    // يمكن إضافة عرض للمالك الحالي بطريقة غير قابلة للتعديل إذا لزم الأمر
                  )}


                  {/* تم ترك حقل العملة كما هو باستخدام FormSelect مؤقتاً لحين تعديله إلى ReusableDropdown */}
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