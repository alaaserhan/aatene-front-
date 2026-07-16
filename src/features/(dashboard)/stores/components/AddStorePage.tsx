// src/features/(dashboard)/stores/components/AddStorePage.tsx
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AddStoreStep2 } from "./AddStoreStep2";
import { AddStoreStep3 } from "./AddStoreStep3";
import { AddStoreStep4 } from "./AddStoreStep4";
import { AddStoreStep5 } from "./AddStoreStep5";
import { AddStoreStep6 } from "./AddStoreStep6";
import { AddStoreStep7 } from "./AddStoreStep7";
import {
  StoreType,
  StoreCreatePayload,
  normalizeStoreCoverForApi,
  normalizeStoreLogoForApi,
} from "../api";
import { useCreateStore, useGenerateStoreAI } from "../hooks";
import {
  CompleteStoreFormData,
  Step2FormData,
  Step3FormData,
  Step4FormData,
  Step5FormData,
  Step6FormData,
  Step7FormData,
} from "../types";
import { normalizeShippingCompaniesForApi } from "../buildStoreShippingUpdatePayload";
import { toast } from "sonner";
import { useAuthStore } from "@/src/stores/auth-store";
import { getStoreDescriptionValidationError } from "../store-ai-validation";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";

interface AddStorePageProps {
  storeType: StoreType;
}

export function AddStorePage({ storeType }: AddStorePageProps) {
  const router = useRouter();
  const createStoreMutation = useCreateStore();
  const { user } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(2);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState<CompleteStoreFormData>({
    type: storeType,
  });

  const { mutateAsync: generateAI, isPending: isGeneratingAI } = useGenerateStoreAI();
  /** يُحدَّث فقط عند نجاح التوليد فعلياً — لتجنب منع إعادة المحاولة عند استجابة فارغة */
  const lastSuccessfulAiInputRef = useRef<{ name: string; description: string } | null>(null);
  const isGeneratingRef = useRef(false);
  const [aiKeywords, setAiKeywords] = useState<string[]>([]);

  const handleGenerateAI = useCallback(async (step2Data: Step2FormData) => {
    const name = step2Data.name.trim();
    const description = step2Data.description.trim();

    if (!name) return;

    const descriptionError = getStoreDescriptionValidationError(description);
    if (descriptionError) {
      toast.error(descriptionError);
      return;
    }

    const prevOk = lastSuccessfulAiInputRef.current;
    if (prevOk && prevOk.name === name && prevOk.description === description) {
      return;
    }

    if (isGeneratingRef.current) return;

    try {
      isGeneratingRef.current = true;
      const data = await generateAI({ name, description });
      const keywords = data.results?.keywords ?? [];

      if (keywords.length > 0) {
        lastSuccessfulAiInputRef.current = { name, description };
        setAiKeywords(keywords);
        setFormData((prev) => ({
          ...prev,
          step7: { tags: keywords },
        }));
      } else {
        toast.error("لم نتمكن من إكمال العملية. حاول توسيع وصف المتجر ثم أعد المحاولة.");
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
    } finally {
      isGeneratingRef.current = false;
    }
  }, [generateAI]);

  /** عند الوصول لخطوة الكلمات بدون نتيجة بعد، أعد استدعاء التوليد (مثلاً إن سبق ولم تُستخرج الكلمات من شكل الاستجابة) */
  useEffect(() => {
    if (currentStep !== 7 || !formData.step2) return;
    if (aiKeywords.length > 0 || (formData.step7?.tags?.length ?? 0) > 0) return;
    void handleGenerateAI(formData.step2);
  }, [currentStep, formData.step2, aiKeywords.length, formData.step7?.tags, handleGenerateAI]);

  const handleStep2Next = (data: Step2FormData) => {
    setFormData({ ...formData, step2: data });
    setCurrentStep(3);
    handleGenerateAI(data);
  };

  const handleStep2Back = () => {
    router.push("/admin/stores/add");
  };

  const handleStep3Next = (data: Step3FormData) => {
    setFormData({ ...formData, step3: data });
    setCurrentStep(4);
  };

  const handleStep3Back = () => {
    setCurrentStep(2);
  };

  const handleStep4Next = (data: Step4FormData) => {
    setFormData({ ...formData, step4: data });
    setCurrentStep(5);
  };

  const handleStep4Back = () => {
    setCurrentStep(3);
  };

  const handleStep5Next = (data: Step5FormData) => {
    setFormData({ ...formData, step5: data });
    if (storeType === "services") {
      setCurrentStep(7);
    } else {
      setCurrentStep(6);
    }
  };

  const handleStep5Back = () => {
    setCurrentStep(4);
  };

  const handleStep6Next = (data: Step6FormData) => {
    setFormData({ ...formData, step6: data });
    setCurrentStep(7);
  };

  const handleStep6Back = () => {
    setCurrentStep(5);
  };

  const handleStep7Save = async (data: Step7FormData) => {
    const updatedFormData = { ...formData, step7: data };

    const isMissingSteps =
      !updatedFormData.step2 ||
      !updatedFormData.step3 ||
      !updatedFormData.step4 ||
      !updatedFormData.step5 ||
      (storeType === "products" && !updatedFormData.step6);

    if (isMissingSteps) {
      toast.error("يرجى إكمال جميع الخطوات المطلوبة");
      return;
    }

    const payload: StoreCreatePayload = {
      type: updatedFormData.type,
      name: updatedFormData.step2!.name,
      logo: normalizeStoreLogoForApi(updatedFormData.step2!.logo),
      status: "approved",
      cover: normalizeStoreCoverForApi(updatedFormData.step2!.cover),
      description: updatedFormData.step2!.description,
      email: updatedFormData.step2!.email,
      address: updatedFormData.step2!.address,
      lng: null,
      lat: null,
      ...(user?.user_type !== "merchant" && {
        owner_id: updatedFormData.step2!.owner_id,
      }),
      currency_id: updatedFormData.step2!.currency_id,

      phone: updatedFormData.step3!.phone,
      hide_phone: updatedFormData.step3!.hide_phone ? "1" : "0",
      whats_app: updatedFormData.step3!.whats_app || null,
      tiktok: updatedFormData.step3!.tiktok || null,
      facebook: updatedFormData.step3!.facebook || null,
      instagram: updatedFormData.step3!.instagram || null,
      twitter: updatedFormData.step3!.twitter || null,
      youtube: updatedFormData.step3!.youtube || null,
      linkedin: updatedFormData.step3!.linkedin || null,
      pinterest: updatedFormData.step3!.pinterest || null,

      managers: updatedFormData.step4?.managers ?? [],

      open_status: updatedFormData.step5!.open_status,
      workingtimes: updatedFormData.step5!.workingtimes,

      tags: data.tags,

      locationCities: updatedFormData.step2!.locationCities,
    };

    if (updatedFormData.type === "products") {
      payload.delivery_type = updatedFormData.step6!.delivery_type;
      payload.shippingCompanies =
        updatedFormData.step6!.delivery_type === "shipping"
          ? normalizeShippingCompaniesForApi(updatedFormData.step6!.shippingCompanies)
          : [];
      payload.serviceCities = [];
    } else {
      payload.serviceCities = updatedFormData.step2!.serviceCities || [];
    }

    try {
      await createStoreMutation.mutateAsync(payload);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error creating store:", error);
    }
  };

  const handleStep7Back = () => {
    if (storeType === "services") {
      setCurrentStep(5);
    } else {
      setCurrentStep(6);
    }
  };

  const steps = [
    { number: 1, label: "البيانات الأساسية", completed: false },
    { number: 2, label: "الاتصال والسوشيال ميديا", completed: false },
    { number: 3, label: "موظفين المتجر", completed: false },
    { number: 4, label: "أوقات العمل و العطلات", completed: false },
    ...(storeType === "products"
      ? [{ number: 5, label: "طريقة الشحن", completed: false }]
      : []),
    {
      number: storeType === "products" ? 6 : 5,
      label: "الكلمات المفتاحية",
      completed: false,
    },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 2:
        return (
          <AddStoreStep2
            storeType={formData.type}
            initialData={formData.step2}
            onNext={handleStep2Next}
            onBack={handleStep2Back}
            barSteps={steps}
          />
        );

      case 3:
        if (!formData.step2) {
          setCurrentStep(2);
          return null;
        }
        return (
          <AddStoreStep3
            storeType={formData.type}
            previousData={formData.step2}
            initialData={formData.step3}
            onNext={handleStep3Next}
            onBack={handleStep3Back}
            barSteps={steps}
          />
        );

      case 4:
        if (!formData.step2) {
          setCurrentStep(2);
          return null;
        }
        return (
          <AddStoreStep4
            storeType={formData.type}
            previousData={formData.step2}
            initialData={formData.step4}
            onNext={handleStep4Next}
            onBack={handleStep4Back}
            barSteps={steps}
          />
        );

      case 5:
        if (!formData.step2) {
          setCurrentStep(2);
          return null;
        }
        return (
          <AddStoreStep5
            storeType={formData.type}
            previousData={formData.step2}
            initialData={formData.step5}
            onNext={handleStep5Next}
            onBack={handleStep5Back}
            barSteps={steps}
          />
        );

      case 6:
        if (storeType === "services") {
          setCurrentStep(7);
          return null;
        }
        if (!formData.step2) {
          setCurrentStep(2);
          return null;
        }
        return (
          <AddStoreStep6
            storeType={formData.type}
            previousData={formData.step2}
            initialData={formData.step6}
            onNext={handleStep6Next}
            onBack={handleStep6Back}
            barSteps={steps}
          />
        );

      case 7:
        if (!formData.step2) {
          setCurrentStep(2);
          return null;
        }
        return (
          <AddStoreStep7
            storeType={formData.type}
            previousData={formData.step2}
            initialData={formData.step7}
            onSave={handleStep7Save}
            onBack={handleStep7Back}
            isSubmitting={createStoreMutation.isPending}
            barSteps={steps}
            isGeneratingAI={isGeneratingAI}
            aiKeywords={aiKeywords}
          />
        );

      default:
        return (
          <AddStoreStep2
            storeType={formData.type}
            initialData={formData.step2}
            onNext={handleStep2Next}
            onBack={handleStep2Back}
            barSteps={steps}
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
          router.push("/admin/stores");
        }}
        title="تم إضافة المتجر بنجاح"
        message="تم إنشاء المتجر بنجاح ويمكنك الآن بدء إضافة منتجاتك."
        buttonText="العودة للقائمة"
      />
    </>
  );
}
