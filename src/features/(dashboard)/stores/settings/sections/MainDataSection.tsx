// src/features/(dashboard)/stores/settings/sections/MainDataSection.tsx
"use client";

import { useState } from "react";
import { FormInput } from "@/src/components/ui/FormInput";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { OptionTag } from "@/src/components/ui/OptionTag";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { Textarea } from "@/src/components/ui/Textarea";
import { StoreIdentitySelector } from "../../components/StoreIdentitySelector";
import { StoreBannerSelector } from "../../components/StoreBannerSelector";
import { CityMultiSelect } from "../../components/CityMultiSelect";
import { useGetCities } from "../../../cities/hooks";
import { StoreType } from "../../api";
import { mediaFileNameForApi, coverFileNamesForApi } from "../../store-payload-utils";
import { UpdateMainDataPayload } from "../api";
import { useUpdateStoreMainData } from "../hooks";
import { StoreMainDataValues } from "../types";
import { SettingsSection } from "./SettingsSection";

interface MainDataSectionProps {
  storeId: number;
  storeType: StoreType;
  initialValues: StoreMainDataValues;
}

export function MainDataSection({
  storeId,
  storeType,
  initialValues,
}: MainDataSectionProps) {
  const [values, setValues] = useState<StoreMainDataValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serviceCitySearch, setServiceCitySearch] = useState("");

  const { data: citiesData } = useGetCities(new URLSearchParams());
  const cities = citiesData?.data || [];

  const mutation = useUpdateStoreMainData(storeId);
  const isServicesStore = storeType === "services";

  const clearError = (field: string) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!values.name.trim()) newErrors.name = "اسم المتجر مطلوب";

    if (values.email.trim()) {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(values.email)) {
        newErrors.email =
          "البريد الإلكتروني غير صالح (يجب أن يكون باللغة الإنجليزية)";
      }
    }

    if (values.locationCities.length === 0) {
      newErrors.locationCities = "المدينة مطلوبة";
    }

    if (isServicesStore && values.serviceCities.length === 0) {
      newErrors.serviceCities = "يجب اختيار منطقة واحدة على الأقل";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const payload: UpdateMainDataPayload = {
      type: storeType,
      name: values.name.trim(),
      cover: coverFileNamesForApi(values.cover),
      email: values.email.trim(),
      locationCities: values.locationCities,
      serviceCities: isServicesStore ? values.serviceCities : [],
      address: values.address.trim(),
      description: values.description.trim(),
    };

    // Omitting `logo` keeps the current one; only send a freshly picked file.
    const logo = mediaFileNameForApi(values.logo);
    if (logo) payload.logo = logo;

    mutation.mutate(payload);
  };

  const availableServiceCities = cities
    .filter((city) => !values.serviceCities.includes(city.id))
    .filter((city) =>
      city.name.toLowerCase().includes(serviceCitySearch.toLowerCase())
    )
    .map((city) => ({ label: city.name, value: String(city.id) }));

  return (
    <SettingsSection
      value="mainData"
      title="البيانات الأساسية"
      description="اسم المتجر، هويته، وصفه والمدن التي يعمل بها"
      isSaving={mutation.isPending}
      onSave={handleSave}
    >
      <div className="space-y-6">
        <FormInput
          label="اسم المتجر"
          name="name"
          value={values.name}
          onChange={(e) => {
            setValues({ ...values, name: e.target.value });
            clearError("name");
          }}
          placeholder="ادخل اسم المتجر"
          required
          maxLength={50}
          showCounter
          error={errors.name}
        />

        <StoreIdentitySelector
          value={values.logo}
          previewUrl={values.logoPreview}
          onChange={(fileName, src) =>
            setValues({ ...values, logo: fileName, logoPreview: src })
          }
        />

        <StoreBannerSelector
          value={values.cover}
          previews={values.coverPreviews}
          onChange={(fileNames, srcs) =>
            setValues({ ...values, cover: fileNames, coverPreviews: srcs })
          }
          maxFiles={10}
        />

        <Textarea
          id="store-description"
          label="وصف المتجر"
          value={values.description}
          onChange={(e) => setValues({ ...values, description: e.target.value })}
          placeholder="عرّف عملاءك بمتجرك وما يميّزه"
          maxLength={300}
          showCounter
        />

        <FormInput
          label="البريد الإلكتروني"
          type="email"
          value={values.email}
          onChange={(e) => {
            setValues({ ...values, email: e.target.value });
            clearError("email");
          }}
          placeholder="example@info.com"
          error={errors.email}
        />

        <CityMultiSelect
          cities={cities}
          selectedCityIds={values.locationCities}
          onChange={(ids) => {
            setValues({ ...values, locationCities: ids });
            clearError("locationCities");
          }}
          error={errors.locationCities}
          placeholder={
            isServicesStore
              ? "اختر المدينة التي يقع فيها مكتبك"
              : "اختر المدينة التي يقع فيها متجرك"
          }
        />

        <div className="space-y-2">
          <Label className="text-start text-sm font-medium">العنوان</Label>
          <div className="flex items-center gap-3 ps-3 border border-gray-200 rounded-sm focus-within:border-blue-3 bg-white">
            <img src="/icons/dashboard/mark.svg" alt="" className="w-5 h-5" />
            <Input
              type="text"
              value={values.address}
              onChange={(e) => setValues({ ...values, address: e.target.value })}
              className="text-[12px] border-none shadow-none px-0 py-2.5 focus-visible:ring-0 text-start"
              placeholder="ادخل العنوان"
            />
          </div>
        </div>

        {isServicesStore && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              المناطق التي يمكنك تقديم خدمتك فيها{" "}
              <span className="text-red-500">*</span>
            </Label>
            <ReusableDropdown
              options={availableServiceCities}
              value=""
              onChange={(cityId) => {
                const id = Number(cityId);
                if (!Number.isFinite(id) || values.serviceCities.includes(id))
                  return;
                setValues({
                  ...values,
                  serviceCities: [...values.serviceCities, id],
                });
                clearError("serviceCities");
              }}
              placeholder="أضف مدينة جديدة"
              error={errors.serviceCities}
              className="h-11"
              onSearch={setServiceCitySearch}
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
              {values.serviceCities.map((cityId) => {
                const city = cities.find((c) => c.id === cityId);
                if (!city) return null;
                return (
                  <OptionTag
                    key={cityId}
                    label={city.name}
                    showRemoveButton
                    onRemove={() =>
                      setValues({
                        ...values,
                        serviceCities: values.serviceCities.filter(
                          (id) => id !== cityId
                        ),
                      })
                    }
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </SettingsSection>
  );
}
