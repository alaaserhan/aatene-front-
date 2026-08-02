// src/features/(dashboard)/stores/settings/sections/SocialMediaSection.tsx
"use client";

import { useState } from "react";
import { StorePhoneField } from "../../components/StorePhoneField";
import { StoreSocialFields } from "../../components/StoreSocialFields";
import { validateStoreContact } from "../../store-contact-validation";
import { StoreContactValues } from "../../types";
import { useUpdateStoreSocialMedia } from "../hooks";
import { SettingsSection } from "./SettingsSection";

interface SocialMediaSectionProps {
  storeId: number;
  initialValues: StoreContactValues;
}

export function SocialMediaSection({
  storeId,
  initialValues,
}: SocialMediaSectionProps) {
  const [values, setValues] = useState<StoreContactValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useUpdateStoreSocialMedia(storeId);

  const clearError = (field: string) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSave = () => {
    const validationErrors = validateStoreContact(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    // Fields without an input here (whatsapp, twitter, linkedin, pinterest)
    // are sent back unchanged so saving this section never clears them.
    mutation.mutate({
      phone: values.phone,
      hide_phone: values.hide_phone === "1",
      whats_app: values.whats_app || null,
      tiktok: values.tiktok || null,
      facebook: values.facebook || null,
      instagram: values.instagram || null,
      twitter: values.twitter || null,
      youtube: values.youtube || null,
      linkedin: values.linkedin || null,
      pinterest: values.pinterest || null,
    });
  };

  return (
    <SettingsSection
      value="socialMedia"
      title="الاتصال والسوشيال ميديا"
      description="رقم الهاتف وروابط حسابات التواصل الاجتماعي"
      isSaving={mutation.isPending}
      onSave={handleSave}
    >
      <div className="space-y-6">
        <StorePhoneField
          phone={values.phone}
          hidePhone={values.hide_phone === "1"}
          error={errors.phone}
          onPhoneChange={(phone) => {
            setValues((prev) => ({ ...prev, phone }));
            clearError("phone");
          }}
          onHidePhoneChange={(hidePhone) =>
            setValues((prev) => ({
              ...prev,
              hide_phone: hidePhone ? "1" : "0",
            }))
          }
        />

        <StoreSocialFields
          values={values}
          errors={errors}
          onChange={(field, value) => {
            setValues((prev) => ({ ...prev, [field]: value }));
            clearError(field);
          }}
        />
      </div>
    </SettingsSection>
  );
}
