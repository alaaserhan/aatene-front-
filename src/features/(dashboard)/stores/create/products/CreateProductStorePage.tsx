// src/features/(dashboard)/stores/create/products/CreateProductStorePage.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { FormInput } from "@/src/components/ui/FormInput";
import { Label } from "@/src/components/ui/label";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";
import { useAuthStore } from "@/src/stores/auth-store";
import { StoreIdentitySelector } from "../../components/StoreIdentitySelector";
import { StoreSubmitBar } from "../../components/StoreSubmitBar";
import { CityMultiSelect } from "../../components/CityMultiSelect";
import { useGetCities } from "../../../cities/hooks";
import { useGetUsers } from "../../../users/hooks";
import { useCreateStore } from "../hooks";
import { ProductStoreFormValues } from "./types";

const breadcrumbItems = [
  { label: "الرئيسية", href: "/admin/home" },
  { label: "المتاجر", href: "/admin/stores" },
  { label: "إضافة متجر منتجات" },
];

/** Shown in the "under review" modal so the merchant knows what to expect next. */
const NEXT_STEPS = [
  "سنُعلمك فور اعتماد المتجر ليظهر للعملاء.",
  "يمكنك إضافة منتجاتك من الآن، وستُنشر مع اعتماد المتجر.",
  "يمكنك إكمال باقي البيانات من إعدادات المتجر في أي وقت.",
];

const EMPTY_FORM: ProductStoreFormValues = {
  name: "",
  logo: null,
  logoPreview: null,
  locationCities: [],
  owner_id: 0,
};

/**
 * Single-step creation of a products store. Only the essentials are asked for
 * here — contact details, working hours, shipping and keywords are filled in
 * later from the store settings page.
 */
export function CreateProductStorePage() {
  const router = useRouter();
  const routeParams = useParams<{ locale?: string; type?: string }>();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.user_type === "admin";

  // Keeps the current locale/dashboard segments (e.g. /ar/admin) when navigating
  const dashboardBase =
    routeParams?.locale && routeParams?.type
      ? `/${routeParams.locale}/${routeParams.type}`
      : isAdmin
        ? "/admin"
        : "/merchant";

  const createStoreMutation = useCreateStore();

  const [values, setValues] = useState<ProductStoreFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdStoreId, setCreatedStoreId] = useState<number | null>(null);

  const { data: citiesData } = useGetCities(new URLSearchParams());
  const cities = citiesData?.data || [];

  const [ownerSearch, setOwnerSearch] = useState("");
  const [debouncedOwnerSearch, setDebouncedOwnerSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedOwnerSearch(ownerSearch), 500);
    return () => clearTimeout(timer);
  }, [ownerSearch]);

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

  const ownerOptions = useMemo(() => {
    if (isUsersLoading) return [{ value: "", label: "جاري البحث..." }];
    const options = (usersData?.data ?? []).map((owner) => ({
      label: `${owner.first_name} ${owner.last_name} (${owner.email})`,
      value: String(owner.id),
    }));
    return options.length > 0
      ? options
      : [{ value: "", label: "لا يوجد مستخدمين" }];
  }, [usersData, isUsersLoading]);

  const clearError = (field: string) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!values.name.trim()) newErrors.name = "اسم المتجر مطلوب";
    if (values.locationCities.length === 0)
      newErrors.locationCities = "المدينة مطلوبة";
    if (isAdmin && !values.owner_id)
      newErrors.owner_id = "يجب اختيار مالك المتجر";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const response = await createStoreMutation.mutateAsync({
        type: "products",
        name: values.name.trim(),
        logo: values.logo,
        locationCities: values.locationCities,
        serviceCities: [],
        ...(isAdmin && values.owner_id ? { owner_id: values.owner_id } : {}),
      });

      setCreatedStoreId(response.record?.id ?? null);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error creating store:", error);
    }
  };

  // Both success actions fall back to the list if the response carried no store id
  const handleAddProduct = () => {
    router.push(
      createdStoreId
        ? `${dashboardBase}/products/add?store_id=${createdStoreId}`
        : `${dashboardBase}/stores`
    );
  };

  const handleCompleteStoreData = () => {
    router.push(
      createdStoreId
        ? `${dashboardBase}/stores/${createdStoreId}/edit`
        : `${dashboardBase}/stores`
    );
  };

  return (
    // Filling the viewport keeps the submit bar at the bottom of the screen on
    // a short form, while it still flows after the content on a long one.
    <div className="flex min-h-[calc(100vh-5rem)] flex-col">
      <div className="container mx-auto flex-1 py-4 px-4">
        <Breadcrumb items={breadcrumbItems} withContainer />

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="mb-8 text-xl font-semibold">البيانات الأساسية</h1>

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
              required
            />

            <CityMultiSelect
              label="مدينة المتجر"
              cities={cities}
              selectedCityIds={values.locationCities}
              onChange={(ids) => {
                setValues({ ...values, locationCities: ids });
                clearError("locationCities");
              }}
              error={errors.locationCities}
              placeholder="اختر المدينة التي يقع فيها متجرك"
              tooltip="اختر المدينة التي يقع فيها المتجر فعليًا. وإذا كان لديك عدة فروع في مدن مختلفة، يمكنك اختيار أكثر من مدينة."
            />

            {isAdmin && (
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">
                  المالك <span className="text-red-500">*</span>
                </Label>
                <ReusableDropdown
                  placeholder="اختر المالك"
                  options={ownerOptions}
                  value={values.owner_id ? String(values.owner_id) : ""}
                  onChange={(value) => {
                    setValues({
                      ...values,
                      owner_id: value ? Number(value) : 0,
                    });
                    clearError("owner_id");
                  }}
                  error={errors.owner_id}
                  className="h-11"
                  dropdownPosition="top"
                  onSearch={setOwnerSearch}
                  searchPlaceholder="ابحث باسم المالك ..."
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <StoreSubmitBar
        submitLabel="إنشاء المتجر"
        loadingLabel="جاري الإنشاء..."
        isSubmitting={createStoreMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`${dashboardBase}/stores`)}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCompleteStoreData}
        variant="pending"
        badgeText="تم إنشاء المتجر بنجاح"
        badgeTone="success"
        title="المتجر قيد المراجعة"
        message="متجرك الآن قيد المراجعة من فريق أعطيني، وسيظهر للعملاء فور اعتماده."
        messageClassName="font-normal"
        buttonText="إضافة منتج"
        onButtonClick={handleAddProduct}
        secondaryButtonText="إكمال بيانات المتجر"
        onSecondaryButtonClick={handleCompleteStoreData}
      >
        <div className="rounded-xl border border-[#FFD87D]/60 bg-[#FFFBF0] p-4">
          <p className="text-sm font-semibold text-[#8A6000]">ماذا بعد؟</p>
          <ul className="mt-2 space-y-2 text-sm leading-relaxed text-[#6B4A00]">
            {NEXT_STEPS.map((step) => (
              <li key={step} className="flex items-start gap-2">
                <span className="mt-[0.4rem] w-1.5 h-1.5 shrink-0 rounded-full bg-[#C48A00]" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </SuccessModal>
    </div>
  );
}
