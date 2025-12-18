// src/features/(dashboard)/services/components/AddServicePage.tsx
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AddServiceStep1 } from "./AddServiceStep1";
import { AddServiceStep2 } from "./AddServiceStep2";
import { AddServiceStep3 } from "./AddServiceStep3";
import { AddServiceStep4 } from "./AddServiceStep4";
import { AddServiceStep5 } from "./AddServiceStep5";
import { useCreateService } from "../hooks";
import { ServicePayload } from "../api";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";
import {
  CompleteServiceFormData,
  Step1ServiceData,
  Step2ServiceData,
  Step3ServiceData,
  Step4ServiceData,
  Step5ServiceData,
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
    else if (step === 5 && formData.step1 && formData.step2 && formData.step3 && formData.step4) setCurrentStep(5);
  };

  // Step 1
  const handleStep1Next = (data: Step1ServiceData) => {
    setFormData({ ...formData, step1: data });
    setCurrentStep(2);
  };
  const handleStep1Cancel = () => router.push("/admin/serviceProviders");

  // Step 2
  const handleStep2Next = (data: Step2ServiceData) => {
    setFormData({ ...formData, step2: data });
    setCurrentStep(3);
  };
  const handleStep2Back = () => setCurrentStep(1);

  // Step 3
  const handleStep3Next = (data: Step3ServiceData) => {
    setFormData({ ...formData, step3: data });
    setCurrentStep(4);
  };
  const handleStep3Back = () => setCurrentStep(2);

  // Step 4
  const handleStep4Next = (data: Step4ServiceData) => {
    setFormData({ ...formData, step4: data });
    setCurrentStep(5); // Go to review step
  };
  const handleStep4Back = () => setCurrentStep(3);

  // Step 5 (Final Submit)
  const handleStep5Submit = async (data: Step5ServiceData) => {
    // No need to save step5 data to formData necessarily unless needed for something else
    // Construct Payload
    if (!formData.step1 || !formData.step2 || !formData.step3 || !formData.step4) {
      toast.error("بيانات الخدمة غير مكتملة");
      return;
    }

    const payload: ServicePayload = {
      title: formData.step1.title,
      category_id: formData.step1.category_id,
      section_id: formData.step1.section_id,
      store_id: Number(storeId),
      tags: formData.step1.tags,
      specialties: formData.step1.specialties,
      
      price: formData.step2.price,
      execute_count: formData.step2.execute_count,
      execute_type: formData.step2.execute_type,
      extras: formData.step2.extras,
      
      images: formData.step3.images,
      description: formData.step4.description,
      questions: formData.step4.questions,
      
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
  const handleStep5Back = () => setCurrentStep(4);

  const steps = [
    { number: 1, label: "المعلومات الاساسية", completed: currentStep > 1 },
    { number: 2, label: "سعر الخدمة", completed: currentStep > 2 },
    { number: 3, label: "صور الخدمة", completed: currentStep > 3 },
    { number: 4, label: "وصف الخدمة", completed: currentStep > 4 },
    { number: 5, label: "مراجعة", completed: false },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <AddServiceStep1
            initialData={formData.step1}
            onNext={handleStep1Next}
            onCancel={handleStep1Cancel}
            onSaveDraft={() => {}} 
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
                previousData={formData.step1}
                initialData={formData.step2}
                onNext={handleStep2Next}
                onBack={handleStep2Back}
                onSaveDraft={() => {}} 
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
                onSaveDraft={() => {}}
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
                barSteps={steps}
                breadcrumbItems={breadcrumbItems}
                onStepClick={handleStepClick}
            />
        );
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
            message="تم رفع الخدمة بنجاح، وهي الآن قيد المراجعة من قبل الفريق المختص. سنوافيك بالرد خلال 24 إلى 48 ساعة."
            buttonText="قائمة الخدمات"
        />
    </>
  );
}