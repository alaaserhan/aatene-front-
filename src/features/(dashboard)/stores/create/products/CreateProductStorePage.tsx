// src/features/(dashboard)/stores/create/products/CreateProductStorePage.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BasicDataStep } from "./steps/BasicDataStep";
import { ContactStep } from "./steps/ContactStep";
import { WorkingHoursStep } from "./steps/WorkingHoursStep";
import { ShippingStep } from "./steps/ShippingStep";
import { KeywordsStep } from "./steps/KeywordsStep";
import {
  PRODUCT_WIZARD_STEPS,
  ProductStoreWizardData,
  ProductWizardStepId,
} from "./types";
import {
  StoreCreatePayload,
  normalizeStoreCoverForApi,
  normalizeStoreLogoForApi,
} from "../../api";
import { useCreateStore, useGenerateStoreAI } from "../../hooks";
import {
  StoreBasicDataValues,
  StoreContactValues,
  StoreKeywordsValues,
  StoreShippingValues,
  StoreWorkingHoursValues,
} from "../../types";
import { normalizeShippingCompaniesForApi } from "../../store-shipping-payload";
import { useAuthStore } from "@/src/stores/auth-store";
import { getStoreDescriptionValidationError } from "../../store-ai-validation";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";

const STORES_LIST_PATH = "/admin/stores";
const STORE_TYPE_PATH = "/admin/stores/add";

export function CreateProductStorePage() {
  const router = useRouter();
  const createStoreMutation = useCreateStore();
  const { user } = useAuthStore();

  const [currentStepId, setCurrentStepId] =
    useState<ProductWizardStepId>("basicData");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [data, setData] = useState<ProductStoreWizardData>({});

  const { mutateAsync: generateAI, isPending: isGeneratingAI } =
    useGenerateStoreAI();
  /** Only set on a real success, so an empty response doesn't block a retry. */
  const lastSuccessfulAiInputRef = useRef<{
    name: string;
    description: string;
  } | null>(null);
  const isGeneratingRef = useRef(false);
  const [aiKeywords, setAiKeywords] = useState<string[]>([]);

  const steps = useMemo(
    () =>
      PRODUCT_WIZARD_STEPS.map((step, index) => ({
        number: index + 1,
        label: step.label,
        completed: false,
      })),
    []
  );

  const currentStepNumber =
    PRODUCT_WIZARD_STEPS.findIndex((step) => step.id === currentStepId) + 1;

  const goToStep = (id: ProductWizardStepId) => setCurrentStepId(id);

  const generateKeywords = useCallback(
    async (basicData: StoreBasicDataValues) => {
      const name = basicData.name.trim();
      const description = basicData.description.trim();

      if (!name) return;

      const descriptionError = getStoreDescriptionValidationError(description);
      if (descriptionError) {
        toast.error(descriptionError);
        return;
      }

      const previous = lastSuccessfulAiInputRef.current;
      if (previous?.name === name && previous.description === description) {
        return;
      }

      if (isGeneratingRef.current) return;

      try {
        isGeneratingRef.current = true;
        const response = await generateAI({ name, description });
        const keywords = response.results?.keywords ?? [];

        if (keywords.length === 0) {
          toast.error(
            "لم نتمكن من إكمال العملية. حاول توسيع وصف المتجر ثم أعد المحاولة."
          );
          return;
        }

        lastSuccessfulAiInputRef.current = { name, description };
        setAiKeywords(keywords);
        setData((prev) => ({ ...prev, keywords: { tags: keywords } }));
      } catch (error) {
        console.error("AI Generation Error:", error);
      } finally {
        isGeneratingRef.current = false;
      }
    },
    [generateAI]
  );

  /** Retry generation on the keywords step when nothing was produced yet. */
  useEffect(() => {
    if (currentStepId !== "keywords" || !data.basicData) return;
    if (aiKeywords.length > 0 || (data.keywords?.tags.length ?? 0) > 0) return;
    void generateKeywords(data.basicData);
  }, [
    currentStepId,
    data.basicData,
    data.keywords?.tags,
    aiKeywords.length,
    generateKeywords,
  ]);

  const handleBasicDataNext = (values: StoreBasicDataValues) => {
    setData((prev) => ({ ...prev, basicData: values }));
    goToStep("contact");
    void generateKeywords(values);
  };

  const handleContactNext = (values: StoreContactValues) => {
    setData((prev) => ({ ...prev, contact: values }));
    goToStep("workingHours");
  };

  const handleWorkingHoursNext = (values: StoreWorkingHoursValues) => {
    setData((prev) => ({ ...prev, workingHours: values }));
    goToStep("shipping");
  };

  const handleShippingNext = (values: StoreShippingValues) => {
    setData((prev) => ({ ...prev, shipping: values }));
    goToStep("keywords");
  };

  const handleSave = async (values: StoreKeywordsValues) => {
    const { basicData, contact, workingHours, shipping } = data;

    if (!basicData || !contact || !workingHours || !shipping) {
      toast.error("يرجى إكمال جميع الخطوات المطلوبة");
      return;
    }

    const payload: StoreCreatePayload = {
      type: "products",
      name: basicData.name,
      logo: normalizeStoreLogoForApi(basicData.logo),
      status: "approved",
      cover: normalizeStoreCoverForApi(basicData.cover),
      description: basicData.description,
      email: basicData.email,
      address: basicData.address,
      lng: null,
      lat: null,
      ...(user?.user_type !== "merchant" && { owner_id: basicData.owner_id }),
      currency_id: basicData.currency_id,

      phone: contact.phone,
      hide_phone: contact.hide_phone === "1" ? "1" : "0",
      whats_app: contact.whats_app || null,
      tiktok: contact.tiktok || null,
      facebook: contact.facebook || null,
      instagram: contact.instagram || null,
      twitter: contact.twitter || null,
      youtube: contact.youtube || null,
      linkedin: contact.linkedin || null,
      pinterest: contact.pinterest || null,

      // Filled from `data.managers` once the disabled managers step returns.
      managers: [],

      open_status: workingHours.open_status,
      workingtimes: workingHours.workingtimes,

      tags: values.tags,

      locationCities: basicData.locationCities,
      serviceCities: [],

      delivery_type: shipping.delivery_type,
      shippingCompanies:
        shipping.delivery_type === "shipping"
          ? normalizeShippingCompaniesForApi(shipping.shippingCompanies)
          : [],
    };

    try {
      await createStoreMutation.mutateAsync(payload);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error creating store:", error);
    }
  };

  const renderStep = () => {
    switch (currentStepId) {
      case "contact":
        return (
          <ContactStep
            initialData={data.contact}
            onNext={handleContactNext}
            onBack={() => goToStep("basicData")}
            steps={steps}
            currentStepNumber={currentStepNumber}
          />
        );

      case "workingHours":
        return (
          <WorkingHoursStep
            initialData={data.workingHours}
            onNext={handleWorkingHoursNext}
            onBack={() => goToStep("contact")}
            steps={steps}
            currentStepNumber={currentStepNumber}
          />
        );

      case "shipping":
        return (
          <ShippingStep
            previousData={data.basicData!}
            initialData={data.shipping}
            onNext={handleShippingNext}
            onBack={() => goToStep("workingHours")}
            steps={steps}
            currentStepNumber={currentStepNumber}
          />
        );

      case "keywords":
        return (
          <KeywordsStep
            initialData={data.keywords}
            onSave={handleSave}
            onBack={() => goToStep("shipping")}
            isSubmitting={createStoreMutation.isPending}
            steps={steps}
            currentStepNumber={currentStepNumber}
            isGeneratingAI={isGeneratingAI}
            aiKeywords={aiKeywords}
          />
        );

      case "basicData":
      default:
        return (
          <BasicDataStep
            initialData={data.basicData}
            onNext={handleBasicDataNext}
            onCancel={() => router.push(STORE_TYPE_PATH)}
            steps={steps}
            currentStepNumber={currentStepNumber}
          />
        );
    }
  };

  return (
    <>
      {renderStep()}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push(STORES_LIST_PATH);
        }}
        title="تم إضافة المتجر بنجاح"
        message="تم إنشاء المتجر بنجاح، وهو الآن قيد المراجعة. يمكنك البدء بإضافة منتجاتك من الآن"
        buttonText="العودة للقائمة"
      />
    </>
  );
}
