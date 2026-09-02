// src/features/(dashboard)/stores/settings/sections/ShippingSection.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { StoreShippingFields } from "../../components/StoreShippingFields";
import { normalizeShippingCompaniesForApi } from "../../store-shipping-payload";
import { StoreShippingValues } from "../../types";
import { useUpdateStoreShipping } from "../hooks";
import { SettingsSection } from "./SettingsSection";

interface ShippingSectionProps {
  storeId: number;
  initialValues: StoreShippingValues;
}

export function ShippingSection({
  storeId,
  initialValues,
}: ShippingSectionProps) {
  const [values, setValues] = useState<StoreShippingValues>(initialValues);

  const mutation = useUpdateStoreShipping(storeId);

  const handleSave = () => {
    const isShipping = values.delivery_type === "shipping";

    if (isShipping && values.shippingCompanies.length === 0) {
      toast.error("يجب إضافة شركة شحن واحدة على الأقل");
      return;
    }

    mutation.mutate({
      delivery_type: values.delivery_type,
      shippingCompanies: isShipping
        ? normalizeShippingCompaniesForApi(values.shippingCompanies)
        : [],
    });
  };

  return (
    <SettingsSection
      value="shipping"
      isSaving={mutation.isPending}
      onSave={handleSave}
    >
      <StoreShippingFields values={values} onChange={setValues} />
    </SettingsSection>
  );
}
