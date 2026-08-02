// src/features/(dashboard)/stores/create/products/steps/ContactStep.tsx
"use client";

import { useState } from "react";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { StepperProgress } from "../../../components/StepperProgress";
import { StoreFormActions } from "../../../components/StoreFormActions";
import { StorePhoneField } from "../../../components/StorePhoneField";
import { StoreSocialFields } from "../../../components/StoreSocialFields";
import { validateStoreContact } from "../../../store-contact-validation";
import { StoreContactValues, WizardStep } from "../../../types";
import { STORE_WIZARD_BREADCRUMB } from "../breadcrumb";

interface ContactStepProps {
  initialData?: StoreContactValues;
  onNext: (data: StoreContactValues) => void;
  onBack: () => void;
  steps: WizardStep[];
  currentStepNumber: number;
}

export function ContactStep({
  initialData,
  onNext,
  onBack,
  steps,
  currentStepNumber,
}: ContactStepProps) {
  const [formData, setFormData] = useState<StoreContactValues>({
    phone: initialData?.phone || "",
    hide_phone: initialData?.hide_phone === "1" ? "1" : "0",
    whats_app: initialData?.whats_app || "",
    tiktok: initialData?.tiktok || "",
    facebook: initialData?.facebook || "",
    instagram: initialData?.instagram || "",
    twitter: initialData?.twitter || "",
    youtube: initialData?.youtube || "",
    linkedin: initialData?.linkedin || "",
    pinterest: initialData?.pinterest || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleNext = () => {
    const validationErrors = validateStoreContact(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) onNext(formData);
  };

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto pb-0 px-4">
        <Breadcrumb items={STORE_WIZARD_BREADCRUMB} className="mb-4" />
        <StepperProgress currentStep={currentStepNumber} steps={steps} />

        <div className="grid grid-cols-12 gap-6 mt-8">
          <div className="col-span-12">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-8">الاتصال والسوشيال</h2>

              <div className="space-y-6">
                <StorePhoneField
                  phone={formData.phone}
                  hidePhone={formData.hide_phone === "1"}
                  error={errors.phone}
                  onPhoneChange={(phone) => {
                    setFormData((prev) => ({ ...prev, phone }));
                    clearError("phone");
                  }}
                  onHidePhoneChange={(hidePhone) =>
                    setFormData((prev) => ({
                      ...prev,
                      hide_phone: hidePhone ? "1" : "0",
                    }))
                  }
                />

                <StoreSocialFields
                  values={formData}
                  errors={errors}
                  onChange={(field, value) => {
                    setFormData((prev) => ({ ...prev, [field]: value }));
                    clearError(field);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <StoreFormActions sticky onNext={handleNext} onBack={onBack} />
    </div>
  );
}
