// src/features/(dashboard)/services/components/form/ServiceForm.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { GuideVideoCard } from "@/src/features/(dashboard)/user-guide/components/GuideVideoCard";
import { useGetSingleStore } from "@/src/features/(dashboard)/stores/hooks";
import { ServicePreviewSidebar } from "../ServicePreviewSidebar";
import { ServiceFormTabs, ServiceStep } from "./ServiceFormTabs";
import { ServiceFormActions } from "./ServiceFormActions";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { AdvancedInfoStep } from "./steps/AdvancedInfoStep";
import { useServiceForm } from "./useServiceForm";
import { ServiceFormValues } from "./types";

interface ServiceFormProps {
  storeId: number | string;
  initialValues?: Partial<ServiceFormValues>;
  breadcrumbItems: { label: string; href?: string }[];
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: ServiceFormValues) => void;
  onCancel: () => void;
}

const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

export function ServiceForm({
  storeId,
  initialValues,
  breadcrumbItems,
  submitLabel,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: ServiceFormProps) {
  const { values, errors, setField, setErrors, validateBasic, focusFirstError } =
    useServiceForm(initialValues);
  const [activeStep, setActiveStep] = useState<ServiceStep>(1);

  const { data: storeData } = useGetSingleStore(storeId, { enabled: !!storeId });
  const store = storeData?.record;

  /** Blocks advancing to the advanced step while the basic step has errors; going back is always allowed */
  const goToStep = (step: ServiceStep) => {
    if (step === 2) {
      const basicErrors = validateBasic();
      if (Object.keys(basicErrors).length > 0) {
        setErrors(basicErrors);
        setActiveStep(1);
        focusFirstError(basicErrors);
        toast.error("يرجى إكمال حقول المعلومات الأساسية المطلوبة أولاً", {
          id: "service-basic-errors",
        });
        return;
      }
    }
    setActiveStep(step);
    scrollToTop();
  };

  const handleSubmit = () => {
    const basicErrors = validateBasic();
    if (Object.keys(basicErrors).length > 0) {
      setErrors(basicErrors);
      setActiveStep(1);
      focusFirstError(basicErrors);
      return;
    }
    onSubmit(values);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      <div className="container mx-auto flex-1 px-4 py-4">
        <Breadcrumb items={breadcrumbItems} className="mb-4" />

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <ServiceFormTabs activeStep={activeStep} onStepChange={goToStep} />

            {activeStep === 1 ? (
              <BasicInfoStep values={values} errors={errors} setField={setField} storeId={storeId} />
            ) : (
              <AdvancedInfoStep values={values} setField={setField} />
            )}
          </div>

          <div className="col-span-12 lg:col-span-4">
            <div className="sticky top-6 flex flex-col gap-4">
              <ServicePreviewSidebar
                data={{
                  title: values.title,
                  price: values.ask_for_price ? 0 : Number(values.price) || 0,
                  ask_for_price: values.ask_for_price,
                  coverImage: values.images_previews[0] || "",
                }}
                storeInfo={{
                  name: store ? `${store.owner?.first_name} ${store.owner?.last_name}` : "",
                  avatar: store?.owner?.avatar_url || "",
                  address: store?.address || "",
                }}
              />
              <GuideVideoCard location="add-service" />
            </div>
          </div>
        </div>
      </div>

      <ServiceFormActions
        submitLabel={submitLabel}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={onCancel}
      />
    </div>
  );
}
