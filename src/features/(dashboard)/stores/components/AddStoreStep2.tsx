// src/features/(dashboard)/stores/components/AddStoreStep2.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { FormInput } from "@/src/components/ui/FormInput";
import { StoreIdentitySelector } from "./StoreIdentitySelector";
import { StoreBannerSelector } from "./StoreBannerSelector";
import { StepperProgress } from "./StepperProgress";
import { useGetCities } from "../../cities/hooks";
import { StoreType } from "../api";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Step2FormData } from "../types";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { useGetUsers } from "../../users/hooks";
import { cn } from "@/src/lib/utils";
import { useAuthStore } from "@/src/stores/auth-store";
import { OptionTag } from "@/src/components/ui/OptionTag";
import { CityMultiSelect } from "./CityMultiSelect";
import {
  STORE_DESCRIPTION_MIN_WORDS_FOR_AI,
  countDescriptionWords,
  getStoreDescriptionValidationError,
} from "../store-ai-validation";

interface AddStoreStep2Props {
  storeType: StoreType;
  initialData?: Step2FormData;
  onNext: (data: Step2FormData) => void;
  onBack: () => void;
  currentUserId?: number;
  barSteps: { number: number; label: string; completed: boolean }[];
}

export function AddStoreStep2({
  storeType,
  initialData,
  onNext,
  currentUserId,
  barSteps,
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
    locationCities: initialData?.locationCities
      ? (initialData.locationCities as unknown as (number | { id: number })[]).map((item) =>
        typeof item === "object" ? item.id : item
      )
      : [],

    serviceCities: initialData?.serviceCities
      ? (initialData.serviceCities as unknown as (number | { id: number })[]).map((item) =>
        typeof item === "object" ? item.id : item
      )
      : [],
    address: initialData?.address || "",
    owner_id: initialData?.owner_id || (!isAdmin && currentUserId ? currentUserId : 0),
    currency_id: initialData?.currency_id || 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Search Logic for Users ---
  const [ownerSearchQuery, setOwnerSearchQuery] = useState("");
  const [debouncedOwnerSearch, setDebouncedOwnerSearch] = useState("");

  // Debounce search input to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedOwnerSearch(ownerSearchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [ownerSearchQuery]);

  const usersParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set("per_page", "100");
    if (debouncedOwnerSearch) {
      params.set("search", debouncedOwnerSearch);
    }
    return params;
  }, [debouncedOwnerSearch]);

  const { data: usersData, isLoading: isUsersLoading } = useGetUsers(
    usersParams,
    { enabled: isAdmin }
  );

  const ownersOptions = useMemo(() => {
    return usersData?.data
      ? usersData.data.map((user) => ({
        label: `${user.first_name} ${user.last_name} (${user.email})`,
        value: String(user.id),
      }))
      : [];
  }, [usersData]);

  // Ensure options include loading state if applicable
  const ownerDropdownOptions = isUsersLoading
    ? [{ value: "", label: "جاري البحث..." }]
    : ownersOptions.length > 0
      ? ownersOptions
      : [{ value: "", label: "لا يوجد مستخدمين" }];

  // ------------------------------

  const [serviceCitySearchQuery, setServiceCitySearchQuery] = useState("");

  const { data: citiesData } = useGetCities(new URLSearchParams());
  const cities = citiesData?.data || [];

  const cityOptions = cities.map((city) => ({
    label: city.name,
    value: String(city.id),
  }));

  const steps = barSteps;

  const breadcrumbItems = [
    { label: "الرئيسية", href: "/admin/home" },
    { label: "المتاجر", href: "/admin/stores" },
    { label: "إضافة متجر" },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "اسم المتجر مطلوب";
    }

    const descriptionError = getStoreDescriptionValidationError(formData.description);
    if (descriptionError) {
      newErrors.description = descriptionError;
    }
    if (formData.email.trim() === "") {
      newErrors.email = "البريد الإلكتروني مطلوب";
    }

    if (formData.email) {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "البريد الإلكتروني غير صالح (يجب أن يكون باللغة الإنجليزية)";
      }
    }

    if (formData.locationCities.length === 0) {
      newErrors.locationCities = "المدينة مطلوبة";
    }

    if (isAdmin && !formData.owner_id) {
      newErrors.owner_id = "يجب اختيار مالك المتجر";
    }

    if (storeType === "services") {
      if (!formData.serviceCities || formData.serviceCities.length === 0) {
        newErrors.serviceCities = "يجب اختيار منطقة واحدة على الأقل";
      }
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
        const element =
          document.querySelector(`[name="${firstError}"]`) ||
          document.querySelector(".text-red-500");
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handleCancel = () => {
    router.push("/admin/stores");
  };

  const handleAddServiceCity = (cityIdStr: string) => {
    const cityId = parseInt(cityIdStr);
    const currentServiceCities = formData.serviceCities || [];

    if (!currentServiceCities.includes(cityId)) {
      setFormData({
        ...formData,
        serviceCities: [...currentServiceCities, cityId],
      });

      if (errors.serviceCities) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.serviceCities;
          return newErrors;
        });
      }
    }
  };

  const handleRemoveServiceCity = (cityId: number) => {
    const currentServiceCities = formData.serviceCities || [];
    setFormData({
      ...formData,
      serviceCities: currentServiceCities.filter((id) => id !== cityId),
    });
  };

  return (
    <div className="overflow-hidden">
      <div className="container mx-auto py-4 px-4">
        <Breadcrumb items={breadcrumbItems} className="mb-4" />
        <StepperProgress currentStep={1} steps={steps} />

        <div className="grid grid-cols-12 gap-6 mt-8">
          <div className="col-span-12">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-8">البيانات الأساسية</h2>

              <div className="space-y-6">
                <FormInput
                  label="اسم المتجر"
                  name="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  placeholder=" ادخل اسم المتجر"
                  required
                  maxLength={50}
                  showCounter
                  error={errors.name}
                />

                <StoreIdentitySelector
                  value={formData.logo}
                  previewUrl={formData.logo_preview}
                  onChange={(fileName, src) => {
                    setFormData({
                      ...formData,
                      logo: fileName,
                      logo_preview: src,
                    });
                    if (errors.logo) setErrors({ ...errors, logo: "" });
                  }}
                  error={errors.logo}
                />

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
                    className="text-start text-sm font-medium"
                  >
                    وصف المتجر <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value });
                      if (errors.description) setErrors({ ...errors, description: "" });
                    }}
                    placeholder="هنا مثال لوصف المتجر"
                    maxLength={300}
                    className={cn(
                      "flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px]",
                      { "border-red-500": errors.description }
                    )}
                  />
                  {errors.description ? (
                    <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                  ) : countDescriptionWords(formData.description) <
                    STORE_DESCRIPTION_MIN_WORDS_FOR_AI ? (
                    <p className="text-xs text-gray-500 mt-1">
                      يجب كتابة الوصف بمقدار {STORE_DESCRIPTION_MIN_WORDS_FOR_AI} كلمات على الأقل
                    </p>
                  ) : null}
                </div>

                <FormInput
                  label="البريد الإلكتروني"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  placeholder="example@info.com"
                  error={errors.email}
                  required
                />

                <CityMultiSelect
                  cities={cities}
                  selectedCityIds={formData.locationCities}
                  onChange={(ids) => {
                    setFormData({ ...formData, locationCities: ids });
                    if (errors.locationCities) setErrors({ ...errors, locationCities: "" });
                  }}
                  error={errors.locationCities}
                />

                <div className="space-y-2">
                  <Label className="text-start text-sm font-medium">
                    العنوان
                  </Label>
                  <div className="flex items-center gap-3 ps-3 border border-gray-200 rounded-sm focus-within:border-blue-3 bg-white">
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
                      className="text-[12px] border-none shadow-none px-0 py-2.5 focus-visible:ring-0 text-start"
                      placeholder="ادخل العنوان"
                    />
                  </div>
                </div>

                {storeType === "services" && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      المناطق التي يمكنك العمل بها <span className="text-red-500">*</span>
                    </Label>
                    <ReusableDropdown
                      options={cityOptions.filter(
                        (opt) =>
                          !formData.serviceCities?.includes(parseInt(opt.value)) &&
                          opt.label.toLowerCase().includes(serviceCitySearchQuery.toLowerCase())
                      )}
                      value=""
                      onChange={handleAddServiceCity}
                      placeholder="أضف مدينة جديدة"
                      error={errors.serviceCities}
                      className="h-11"
                      onSearch={(q) => setServiceCitySearchQuery(q)}
                      searchPlaceholder="ابحث باسم المدينة..."
                      triggerIcon={
                        <img
                          src="/icons/dashboard/mark.svg"
                          alt=""
                          className="w-5 h-5 opacity-50"
                        />
                      }
                    />

                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.serviceCities?.map((cityId) => {
                        const city = cities.find((c) => c.id === cityId);
                        if (!city) return null;
                        return (
                          <OptionTag
                            key={cityId}
                            label={city.name}
                            onRemove={() => handleRemoveServiceCity(cityId)}
                            showRemoveButton={true}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className={cn("grid gap-6", isAdmin ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
                  {isAdmin ? (
                    <div className="flex flex-col gap-2">
                      <Label className="text-sm font-medium">المالك <span className="text-red-500">*</span></Label>
                      <ReusableDropdown
                        placeholder="اختر المالك"
                        options={ownerDropdownOptions}
                        value={formData.owner_id ? String(formData.owner_id) : ""}
                        onChange={(value) => {
                          setFormData({
                            ...formData,
                            owner_id: value ? Number(value) : 0,
                          });
                          if (errors.owner_id) setErrors({ ...errors, owner_id: "" });
                        }}
                        error={errors.owner_id}
                        className="h-11"
                        dropdownPosition="top"
                        onSearch={(query) => setOwnerSearchQuery(query)}
                        searchPlaceholder="ابحث باسم المالك ..."
                      />
                    </div>
                  ) : (
                    <input
                      type="hidden"
                      name="owner_id"
                      value={formData.owner_id}
                    />
                  )}
                </div>
              </div>
            </div>
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
    </div >
  );
}
