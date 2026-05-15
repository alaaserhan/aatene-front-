// src/features/(dashboard)/stores/components/EditStorePage.tsx
"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AddStoreStep2 } from "./AddStoreStep2";
import { AddStoreStep3 } from "./AddStoreStep3";
import { AddStoreStep4 } from "./AddStoreStep4";
import { AddStoreStep5 } from "./AddStoreStep5";
import { AddStoreStep6 } from "./AddStoreStep6";
import { AddStoreStep7 } from "./AddStoreStep7";
import { StoreType, StoreUpdatePayload, StoreManagerPayload } from "../api";
import { useUpdateStore, useGetSingleStore, useGenerateStoreAI } from "../hooks";
import {
  CompleteStoreFormData,
  Step2FormData,
  Step3FormData,
  Step4FormData,
  Step5FormData,
  Step6FormData,
  Step7FormData,
} from "../types";
import { toast } from "sonner";
import { getStoreDescriptionValidationError } from "../store-ai-validation";
import { useAuthStore } from "@/src/stores/auth-store";
import { Loader2 } from "lucide-react";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";

interface EditStorePageProps {
  storeId: number;
}

export function EditStorePage({ storeId }: EditStorePageProps) {
  const router = useRouter();
  const updateStoreMutation = useUpdateStore();
  const { data: storeData, isLoading } = useGetSingleStore(storeId);
  const { user } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(2);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState<CompleteStoreFormData | null>(null);

  const { mutateAsync: generateAI, isPending: isGeneratingAI } = useGenerateStoreAI();
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
        setFormData((prev) => {
          if (!prev) return prev;
          return { ...prev, step7: { tags: keywords } };
        });
      } else {
        toast.error("لم نتمكن من إكمال العملية. حاول توسيع وصف المتجر ثم أعد المحاولة.");
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
    } finally {
      isGeneratingRef.current = false;
    }
  }, [generateAI]);

  useEffect(() => {
    if (currentStep !== 7 || !formData?.step2) return;
    if (aiKeywords.length > 0 || (formData.step7?.tags?.length ?? 0) > 0) return;
    void handleGenerateAI(formData.step2);
  }, [currentStep, formData?.step2, formData?.step7?.tags, aiKeywords.length, handleGenerateAI]);

  const store = storeData?.record;

  if (store && !formData) {
    const managersPayload = (store.managers || []).map(
      (m) => ({
        email: m.user_email,
        title: m.title as unknown as StoreManagerPayload["title"],
        status: m.status as unknown as StoreManagerPayload["status"],
      })
    ) as StoreManagerPayload[];

    const locationCities = ((store.locationCities as unknown[]) || [])
      .map((c: unknown) => (typeof c === 'object' && c !== null && 'id' in c ? (c as { id: number }).id : c))
      .filter((id): id is number => typeof id === 'number');

    const serviceCities = (store.serviceCities || [])
      .map((c: { id?: number }) => c.id)
      .filter((id): id is number => id !== undefined);

    const initialFormData: CompleteStoreFormData = {
      type: store.type as StoreType,
      step2: {
        name: store.name,
        logo: store.logo,
        logo_preview: store.logo_url,
        cover: store.cover,
        cover_previews: store.cover_urls.filter(
          (url: string | null): url is string => url !== null
        ),
        description: store.description || "",
        email: store.email || "",
        locationCities: locationCities,
        serviceCities: serviceCities,
        address: store.address || "",
        owner_id: Number(store.owner_id),
        currency_id: Number(store.currency_id),
      },
      step3: {
        phone: store.phone || "",
        hide_phone: store.hide_phone,
        whats_app: store.whats_app || "",
        tiktok: store.tiktok || "",
        facebook: store.facebook || "",
        instagram: store.instagram || "",
        twitter: store.twitter || "",
        youtube: store.youtube || "",
        linkedin: store.linkedin || "",
        pinterest: store.pinterest || "",
      },
      step4: {
        managers: managersPayload,
      },
      step5: {
        open_status: store.open_status,
        workingtimes: (store.workingtimes || []).map((wt) => ({
          day: wt.day,
          from: wt.from,
          to: wt.to,
          open_always: wt.open_always,
          closed_always: wt.closed_always,
        })),
      },
      step6: {
        delivery_type: store.delivery_type || "shipping",
        shippingCompanies: (store.shippingCompanies || []).map((sc) => ({
          name: sc.name,
          phone: String(sc.phone),
          prices: sc.prices.map((p) => ({
            city_id: p.city_id,
            days: p.days,
            price: p.price,
          })),
        })),
      },
      step7: {
        tags: store.tags || [],
      },
    };

    setFormData(initialFormData);
  }

  const handleStep2Next = (data: Step2FormData) => {
    if (!formData) return;
    setFormData({ ...formData, step2: data });
    setCurrentStep(3);
    handleGenerateAI(data);
  };

  const handleStep2Back = () => {
    router.push("/admin/stores");
  };

  const handleStep3Next = (data: Step3FormData) => {
    if (!formData) return;
    setFormData({ ...formData, step3: data });
    setCurrentStep(5); // تم تخطي Step4 (الموظفين) - يمكن إعادته بتغيير هذا الرقم إلى 4
  };

  const handleStep3Back = () => {
    setCurrentStep(2);
  };

  /* ============================================================
   * STEP 4: موظفين المتجر - معطّل مؤقتاً (لا تحذف هذا الكومنت)
   * لإعادة تفعيله:
   *   1. أزل الكومنت عن handleStep4Next و handleStep4Back
   *   2. غيّر handleStep3Next: setCurrentStep(4)
   *   3. غيّر handleStep5Back: setCurrentStep(4)
   *   4. أزل الكومنت عن case 4 في renderStep()
   *   5. أزل الكومنت عن { number: 3, label: "موظفين المتجر" } في steps
   *   6. أزل الكومنت عن managers في payload و isMissingSteps
   * ============================================================

  const handleStep4Next = (data: Step4FormData) => {
    if (!formData) return;
    setFormData({ ...formData, step4: data });
    setCurrentStep(5);
  };

  const handleStep4Back = () => {
    setCurrentStep(3);
  };

  */

  const handleStep5Next = (data: Step5FormData) => {
    if (!formData) return;
    setFormData({ ...formData, step5: data });
    if (formData.type === "services") {
      setCurrentStep(7);
    } else {
      setCurrentStep(6);
    }
  };

  const handleStep5Back = () => {
    setCurrentStep(3); // يرجع لـ Step3 مباشرة (تخطي Step4 المعطّل)
  };

  const handleStep6Next = (data: Step6FormData) => {
    if (!formData) return;
    setFormData({ ...formData, step6: data });
    setCurrentStep(7);
  };

  const handleStep6Back = () => {
    setCurrentStep(5);
  };

  const handleStep7Save = async (data: Step7FormData) => {
    if (!formData) return;

    const updatedFormData = { ...formData, step7: data };

    const isMissingSteps =
      !updatedFormData.step2 ||
      !updatedFormData.step3 ||
      /* !updatedFormData.step4 || // Step4 (موظفين) معطّل مؤقتاً */
      !updatedFormData.step5 ||
      (updatedFormData.type === "products" && !updatedFormData.step6);

    if (isMissingSteps) {
      toast.error("يرجى إكمال جميع الخطوات المطلوبة");
      return;
    }

    const payload: StoreUpdatePayload = {
      type: formData.type,
      name: updatedFormData.step2!.name,
      logo: updatedFormData.step2!.logo || undefined,
      cover: updatedFormData.step2!.cover,
      description: updatedFormData.step2!.description,
      email: updatedFormData.step2!.email,
      address: updatedFormData.step2!.address,
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

      managers: [], /* updatedFormData.step4?.managers — Step4 (موظفين) معطّل مؤقتاً */

      open_status: updatedFormData.step5!.open_status,
      workingtimes: updatedFormData.step5!.workingtimes,

      tags: data.tags,

      locationCities: updatedFormData.step2!.locationCities,
    };

    if (updatedFormData.type === "products") {
      payload.delivery_type = updatedFormData.step6!.delivery_type;
      payload.shippingCompanies = updatedFormData.step6!.shippingCompanies;
      payload.serviceCities = [];
    } else {
      payload.serviceCities = updatedFormData.step2!.serviceCities || [];
    }

    try {
      await updateStoreMutation.mutateAsync({
        id: storeId,
        payload,
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error updating store:", error);
    }
  };

  const handleStep7Back = () => {
    if (formData?.type === "services") {
      setCurrentStep(5);
    } else {
      setCurrentStep(6);
    }
  };

  if (isLoading || !formData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-3" />
          <span>جاري تحميل البيانات...</span>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-2 mb-4">لم يتم العثور على المتجر</p>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, label: "البيانات الأساسية", completed: false },
    { number: 2, label: "الاتصال والسوشيال ميديا", completed: false },
    /* { number: 3, label: "موظفين المتجر", completed: false }, // Step4 معطّل مؤقتاً */
    { number: 3, label: "أوقات العمل و العطلات", completed: false },
    ...(formData.type === "products"
      ? [{ number: 4, label: "طريقة الشحن", completed: false }]
      : []),
    {
      number: formData.type === "products" ? 5 : 4,
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

      /* ============================================================
       * STEP 4 (الموظفين) - معطّل مؤقتاً - لا تحذف هذا الكومنت
       * ============================================================
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
      */

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
        if (formData.type === "services") {
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
            isSubmitting={updateStoreMutation.isPending}
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
        title="تم تحديث المتجر بنجاح"
        message="تم حفظ التعديلات التي أجريتها على المتجر بنجاح."
        buttonText="العودة للقائمة"
      />
    </>
  );
}