// src/features/(dashboard)/stores/components/AddStorePage.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AddStoreStep2 } from "./AddStoreStep2";
import { AddStoreStep3 } from "./AddStoreStep3";
import { AddStoreStep4 } from "./AddStoreStep4";
import { AddStoreStep5 } from "./AddStoreStep5";
import { AddStoreStep6 } from "./AddStoreStep6";
import { AddStoreStep7 } from "./AddStoreStep7";
import { StoreType, StoreCreatePayload } from "../api";
import { useCreateStore } from "../hooks";
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

interface AddStorePageProps {
  storeType: StoreType;
}

export function AddStorePage({ storeType }: AddStorePageProps) {
  const router = useRouter();
  const createStoreMutation = useCreateStore();

  const [currentStep, setCurrentStep] = useState(2);
  const [formData, setFormData] = useState<CompleteStoreFormData>({
    type: storeType,
  });

  const handleStep2Next = (data: Step2FormData) => {
    setFormData({ ...formData, step2: data });
    setCurrentStep(3);
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

  // ✅ تعديل: الانتقال من الخطوة 5 (أوقات العمل)
  const handleStep5Next = (data: Step5FormData) => {
    setFormData({ ...formData, step5: data });
    // إذا كان متجر خدمات، انتقل مباشرة إلى 7 (تخطي 6: الشحن)
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

    // ✅ نستخدم (!) للتأكيد لـ TypeScript أن البيانات موجودة
    const basePayload = {
      type: updatedFormData.type,
      name: updatedFormData.step2!.name, // 👈 لاحظ علامة التعجب
      logo: updatedFormData.step2!.logo || "",
      status: "active" as const,
      cover: updatedFormData.step2!.cover,
      description: updatedFormData.step2!.description,
      email: updatedFormData.step2!.email,
      city_id: updatedFormData.step2!.city_id,
      district_id: null,
      address: updatedFormData.step2!.address,
      lng: null,
      lat: null,
      owner_id: Number(updatedFormData.step2!.owner_id),
      currency_id: Number(updatedFormData.step2!.currency_id),
      phone: updatedFormData.step3!.phone, // 👈 وكذلك هنا للخطوات الأخرى
      whats_app: updatedFormData.step3!.whats_app || null,
      tiktok: updatedFormData.step3!.tiktok || null,
      facebook: updatedFormData.step3!.facebook || null,
      instagram: updatedFormData.step3!.instagram || null,
      twitter: null,
      youtube: updatedFormData.step3!.youtube || null,
      linkedin: null,
      pinterest: null,
      managers: updatedFormData.step4!.managers,
      open_status: updatedFormData.step5!.open_status,
      workingtimes: updatedFormData.step5!.workingtimes,
      tags: data.tags,
    };

    let payload: StoreCreatePayload;
    if (updatedFormData.type === "products") {
      payload = {
        ...basePayload,
        // هنا step6 مضمونة الوجود لأننا تحققنا منها في الأعلى
        delivery_type: updatedFormData.step6!.delivery_type,
        shippingCompanies: updatedFormData.step6!.shippingCompanies,
        locationCities: updatedFormData.step2!.city_id,
        serviceCities: [],
      };
    } else {
      payload = {
        ...basePayload,
        locationCities: [],
        serviceCities: updatedFormData.step2!.city_id,
      };
    }

    try {
      await createStoreMutation.mutateAsync(payload);
      router.push("/admin/stores");
    } catch (error) {
      console.error("Error creating store:", error);
    }
  };
  const handleStep7Back = () => {
    // ✅ تعديل: العودة من الخطوة 7
    if (storeType === "services") {
      setCurrentStep(5); // عودة إلى أوقات العمل
    } else {
      setCurrentStep(6); // عودة إلى الشحن
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
    { number: storeType === "products" ? 6 : 5, label: "الكلمات المفتاحية", completed: false },
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
        // إضافة تحقق إضافي لعدم عرض هذه الخطوة للمتاجر الخدمية
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

  return <>{renderStep()}</>;
}