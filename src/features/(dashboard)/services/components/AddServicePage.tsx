// src/features/(dashboard)/services/components/AddServicePage.tsx
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AddServiceStep1 } from "./AddServiceStep1";
import { AddServiceStep2 } from "./AddServiceStep2";
import { AddServiceStep3 } from "./AddServiceStep3";
import { AddServiceStep4 } from "./AddServiceStep4";
/** خطوة المراجعة (5) معطّلة — لإعادتها: ألغِ التعليق عن السطر التالي وعن `case 5` و`handleStepClick` وأضف الخطوة الخامسة لمصفوفة `steps`. */
// import { AddServiceStep5 } from "./AddServiceStep5";
import { useCreateService } from "../hooks";
import { ServicePayload } from "../api";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";
import {
  CompleteServiceFormData,
  Step1ServiceData,
  Step2ServiceData,
  Step3ServiceData,
  Step4ServiceData,
} from "../types";

interface AddServicePageProps {
  storeId: number | string;
}

export function AddServicePage({ storeId }: AddServicePageProps) {

  const router = useRouter();
  const toastShownRef = useRef(false);

  const createServiceMutation = useCreateService();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CompleteServiceFormData>({});

  const breadcrumbItems = useMemo(() => [
    { label: "الخدمات", href: "/admin/serviceProviders" },
    { label: "انشاء خدمة جديدة" },
  ], []);

  // ... (useEffects for draft load logic remains the same) ...

  const handleStepClick = (step: number) => {
    // Basic validation to allow jumping only if previous steps have data
    if (step === 1) setCurrentStep(1);
    else if (step === 2 && formData.step1) setCurrentStep(2);
    else if (step === 3 && formData.step1 && formData.step2) setCurrentStep(3);
    else if (step === 4 && formData.step1 && formData.step2 && formData.step3) setCurrentStep(4);
    // else if (step === 5 && formData.step1 && formData.step2 && formData.step3 && formData.step4) setCurrentStep(5);
  };

  // Step 1
  const handleStep1Next = (data: Step1ServiceData) => {
    setFormData({ ...formData, step1: data });
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleStep1Cancel = () => router.push("/admin/serviceProviders");

  // Step 2
  const handleStep2Next = (data: Step2ServiceData) => {
    setFormData({ ...formData, step2: data });
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleStep2Back = () => { setCurrentStep(1); window.scrollTo({ top: 0, behavior: "smooth" }); };

  // Step 3
  const handleStep3Next = (data: Step3ServiceData) => {
    setFormData({ ...formData, step3: data });
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleStep3Back = () => { setCurrentStep(2); window.scrollTo({ top: 0, behavior: "smooth" }); };

  // Step 4 — بعدها إرسال مباشر (خطوة المراجعة 5 معطّلة)
  const handleStep4Next = (data: Step4ServiceData) => {
    const next: CompleteServiceFormData = { ...formData, step4: data };
    setFormData(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
    void submitNewService(next);
  };
  const handleStep4Back = () => { setCurrentStep(3); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const submitNewService = async (fd: CompleteServiceFormData) => {
    if (!fd.step1 || !fd.step2 || !fd.step3 || !fd.step4) {
      toast.error("بيانات الخدمة غير مكتملة");
      return;
    }

    const payload: ServicePayload = {
      title: fd.step1.title,
      category_id: fd.step1.category_id,
      section_id: fd.step1.section_id,
      store_id: Number(storeId),
      tags: fd.step4.tags,
      specialties: fd.step1.specialties,

      price: fd.step2.price,
      ask_for_price: fd.step2.ask_for_price,
      execute_count: fd.step2.execute_count,
      execute_type: fd.step2.execute_type,
      extras: fd.step2.extras,

      images: fd.step3.images,
      description: fd.step4.description,
      questions: fd.step4.questions,

      status: "pending",
    };

    try {
      await createServiceMutation.mutateAsync({ payload, storeId });
      localStorage.removeItem("service_draft");
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error creating service:", error);
    }
  };

  /*
  const handleStep5Submit = async (_data: Step5ServiceData) => {
    await submitNewService(formData);
  };
  const handleStep5Back = () => setCurrentStep(4);
  */

  const steps = [
    { number: 1, label: "المعلومات الاساسية", completed: currentStep > 1 },
    { number: 2, label: "سعر الخدمة", completed: currentStep > 2 },
    { number: 3, label: "صور الخدمة", completed: currentStep > 3 },
    { number: 4, label: "وصف الخدمة", completed: false },
    // { number: 5, label: "مراجعة", completed: false },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <AddServiceStep1
            initialData={
              formData.step1
                ? {
                  ...formData.step1,
                  price: formData.step2?.price,
                  images_previews: formData.step3?.images_previews ?? formData.step1?.images_previews ?? []
                }
                : undefined
            }
            onNext={handleStep1Next}
            onCancel={handleStep1Cancel}
            onSaveDraft={() => { }}
            barSteps={steps}
            breadcrumbItems={breadcrumbItems}
            onStepClick={handleStepClick}
            storeId={storeId}
          />
        );
      case 2:
        if (!formData.step1) { setCurrentStep(1); return null; }
        return (
          <AddServiceStep2
            previousData={{
              ...formData.step1,
              images_previews: formData.step3?.images_previews ?? formData.step1?.images_previews ?? []
            }}
            initialData={formData.step2}
            onNext={handleStep2Next}
            onBack={handleStep2Back}
            onSaveDraft={() => { }}
            barSteps={steps}
            breadcrumbItems={breadcrumbItems}
            onStepClick={handleStepClick}
          />
        );
      case 3:
        if (!formData.step1 || !formData.step2) { setCurrentStep(2); return null; }
        return (
          <AddServiceStep3
            previousDataStep1={formData.step1}
            previousDataStep2={formData.step2}
            initialData={formData.step3}
            onNext={handleStep3Next}
            onBack={handleStep3Back}
            onSaveDraft={() => { }}
            barSteps={steps}
            breadcrumbItems={breadcrumbItems}
            onStepClick={handleStepClick}
          />
        );
      case 4:
        if (!formData.step1 || !formData.step2 || !formData.step3) { setCurrentStep(3); return null; }
        return (
          <AddServiceStep4
            previousDataStep1={formData.step1}
            previousDataStep2={formData.step2}
            previousDataStep3={formData.step3}
            initialData={formData.step4}
            onSave={handleStep4Next} // Note: Changed to Next, not Save API
            onBack={handleStep4Back}
            isSubmitting={createServiceMutation.isPending}
            barSteps={steps}
            breadcrumbItems={breadcrumbItems}
            onStepClick={handleStepClick}
          />
        );
      /*
      case 5:
        if (!formData.step1 || !formData.step2 || !formData.step3 || !formData.step4) { setCurrentStep(4); return null; }
        return (
          <AddServiceStep5
            previousDataStep1={formData.step1}
            previousDataStep2={formData.step2}
            previousDataStep3={formData.step3}
            onSave={handleStep5Submit}
            onBack={handleStep5Back}
            isSubmitting={createServiceMutation.isPending}
            barSteps={steps}
            breadcrumbItems={breadcrumbItems}
            onStepClick={handleStepClick}
          />
        );
      */
      default:
        return null;
    }
  };

  return (
    <>
      {renderStep()}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => router.push(`/admin/serviceProviders/${storeId}`)}
        title="تم رفع الخدمة بنجاح"
        message="تم رفع الخدمة بنجاح، وهي الآن قيد المراجعة من قبل الفريق المختص. سنوافيك بالرد قريباً."
        buttonText="قائمة الخدمات"
      />
    </>
  );
}