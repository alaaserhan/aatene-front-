// src/features/(dashboard)/stores/create/products/steps/BasicDataStep.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { FormInput } from "@/src/components/ui/FormInput";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { cn } from "@/src/lib/utils";
import { useAuthStore } from "@/src/stores/auth-store";
import { StoreIdentitySelector } from "../../../components/StoreIdentitySelector";
import { StoreBannerSelector } from "../../../components/StoreBannerSelector";
import { StepperProgress } from "../../../components/StepperProgress";
import { StoreFormActions } from "../../../components/StoreFormActions";
import { CityMultiSelect } from "../../../components/CityMultiSelect";
import { useGetCities } from "../../../../cities/hooks";
import { useGetUsers } from "../../../../users/hooks";
import { StoreBasicDataValues, WizardStep } from "../../../types";
import {
  STORE_DESCRIPTION_MIN_WORDS_FOR_AI,
  countDescriptionWords,
  getStoreDescriptionValidationError,
} from "../../../store-ai-validation";
import { STORE_WIZARD_BREADCRUMB } from "../breadcrumb";

interface BasicDataStepProps {
  initialData?: StoreBasicDataValues;
  onNext: (data: StoreBasicDataValues) => void;
  onCancel: () => void;
  steps: WizardStep[];
  currentStepNumber: number;
}

export function BasicDataStep({
  initialData,
  onNext,
  onCancel,
  steps,
  currentStepNumber,
}: BasicDataStepProps) {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.user_type === "admin";

  const [formData, setFormData] = useState<StoreBasicDataValues>({
    name: initialData?.name || "",
    logo: initialData?.logo || null,
    logo_preview: initialData?.logo_preview || null,
    cover: initialData?.cover || [],
    cover_previews: initialData?.cover_previews || [],
    description: initialData?.description || "",
    email: initialData?.email || user?.email || "",
    locationCities: initialData?.locationCities || [],
    serviceCities: [],
    address: initialData?.address || "",
    owner_id: initialData?.owner_id || 0,
    currency_id: initialData?.currency_id || 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (debouncedOwnerSearch) params.set("search", debouncedOwnerSearch);
    return params;
  }, [debouncedOwnerSearch]);

  const { data: usersData, isLoading: isUsersLoading } = useGetUsers(
    usersParams,
    { enabled: isAdmin }
  );

  const ownersOptions = useMemo(
    () =>
      (usersData?.data ?? []).map((owner) => ({
        label: `${owner.first_name} ${owner.last_name} (${owner.email})`,
        value: String(owner.id),
      })),
    [usersData]
  );

  const ownerDropdownOptions = isUsersLoading
    ? [{ value: "", label: "جاري البحث..." }]
    : ownersOptions.length > 0
      ? ownersOptions
      : [{ value: "", label: "لا يوجد مستخدمين" }];

  const { data: citiesData } = useGetCities(new URLSearchParams());
  const cities = citiesData?.data || [];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "اسم المتجر مطلوب";
    }

    const descriptionError = getStoreDescriptionValidationError(
      formData.description
    );
    if (descriptionError) {
      newErrors.description = descriptionError;
    }

    if (!formData.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email =
          "البريد الإلكتروني غير صالح (يجب أن يكون باللغة الإنجليزية)";
      }
    }

    if (formData.locationCities.length === 0) {
      newErrors.locationCities = "المدينة مطلوبة";
    }

    if (isAdmin && !formData.owner_id) {
      newErrors.owner_id = "يجب اختيار مالك المتجر";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext(formData);
      return;
    }

    document.querySelector(".text-red-500")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return (
    // No `overflow-hidden` here: it would turn this into a scroll container
    // and stop the sticky actions bar from pinning to the viewport.
    <div>
      <div className="container mx-auto py-4 px-4">
        <Breadcrumb items={STORE_WIZARD_BREADCRUMB} className="mb-4" />
        <StepperProgress currentStep={currentStepNumber} steps={steps} />

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
                  onChange={(fileName, src) =>
                    setFormData({
                      ...formData,
                      logo: fileName,
                      logo_preview: src,
                    })
                  }
                  error={errors.logo}
                />

                <StoreBannerSelector
                  value={formData.cover}
                  previews={formData.cover_previews}
                  onChange={(fileNames, srcs) =>
                    setFormData({
                      ...formData,
                      cover: fileNames,
                      cover_previews: srcs,
                    })
                  }
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
                      if (errors.description)
                        setErrors({ ...errors, description: "" });
                    }}
                    placeholder="هنا مثال لوصف المتجر"
                    maxLength={300}
                    className={cn(
                      "flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px]",
                      { "border-red-500": errors.description }
                    )}
                  />
                  {errors.description ? (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.description}
                    </p>
                  ) : countDescriptionWords(formData.description) <
                    STORE_DESCRIPTION_MIN_WORDS_FOR_AI ? (
                    <p className="text-xs text-gray-500 mt-1">
                      يجب كتابة الوصف بمقدار {STORE_DESCRIPTION_MIN_WORDS_FOR_AI}{" "}
                      كلمات على الأقل
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
                    if (errors.locationCities)
                      setErrors({ ...errors, locationCities: "" });
                  }}
                  error={errors.locationCities}
                  placeholder="اختر المدينة التي يقع فيها متجرك"
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

                {isAdmin && (
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-medium">
                      المالك <span className="text-red-500">*</span>
                    </Label>
                    <ReusableDropdown
                      placeholder="اختر المالك"
                      options={ownerDropdownOptions}
                      value={formData.owner_id ? String(formData.owner_id) : ""}
                      onChange={(value) => {
                        setFormData({
                          ...formData,
                          owner_id: value ? Number(value) : 0,
                        });
                        if (errors.owner_id)
                          setErrors({ ...errors, owner_id: "" });
                      }}
                      error={errors.owner_id}
                      className="h-11"
                      dropdownPosition="top"
                      onSearch={setOwnerSearchQuery}
                      searchPlaceholder="ابحث باسم المالك ..."
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <StoreFormActions
        sticky
        onNext={handleNext}
        onBack={onCancel}
        backLabel="إلغاء"
      />
    </div>
  );
}
