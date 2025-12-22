// src/features/(dashboard)/services/components/EditServicePage.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { AddServiceStep1 } from "./AddServiceStep1";
import { AddServiceStep2 } from "./AddServiceStep2";
import { AddServiceStep3 } from "./AddServiceStep3";
import { AddServiceStep4 } from "./AddServiceStep4";
import { AddServiceStep5 } from "./AddServiceStep5";
import { useUpdateService, useGetService } from "../hooks";
import { ServicePayload } from "../api";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";
import { Button } from "@/src/components/ui/button";
import {
  CompleteServiceFormData,
  Step1ServiceData,
  Step2ServiceData,
  Step3ServiceData,
  Step4ServiceData,
  Step5ServiceData
} from "../types";

interface EditServicePageProps {
  serviceId: number | string;
  storeId: number | string;
}

export function EditServicePage({ serviceId, storeId }: EditServicePageProps) {
  const router = useRouter();
  const updateServiceMutation = useUpdateService();
  const { data: serviceResponse, isLoading, isError } = useGetService(serviceId, storeId);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CompleteServiceFormData | null>(null);

  useEffect(() => {
    const service = serviceResponse?.data;

    if (service && !formData) {
      try {
        // ✅ منطق معالجة الصور لضمان أنها مصفوفة دائماً
        let imagesPreviews: string[] = [];
        if (Array.isArray(service.images_urls)) {
            imagesPreviews = service.images_urls;
        } else if (typeof service.images_urls === "string") {
            imagesPreviews = [service.images_urls];
        } else {
            imagesPreviews = service.images || [];
        }

        const initialFormData: CompleteServiceFormData = {
          step1: {
            title: service.title,
            category_id: service.category_id,
            section_id: service.section_id,
            tags: service.tags || [],
            specialties: service.specialties || [],
          },
          step2: {
            price: Number(service.price) || 0,
            execute_count: Number(service.execute_count) || 1,
            execute_type: service.execute_type,
            extras: service.extras || [],
          },
          step3: {
            images: service.images || [],
            images_previews: imagesPreviews, // ✅ استخدام المصفوفة المعالجة
          },
          step4: {
            description: service.description,
            questions: service.questions || [],
          },
        };

        setFormData(initialFormData);
      } catch (error) {
        console.error("Mapping Error", error);
        toast.error("حدث خطأ أثناء معالجة بيانات الخدمة");
      }
    }
  }, [serviceResponse, formData]);

  const breadcrumbItems = useMemo(() => [
    { label: "الخدمات", href: "/admin/serviceProviders" },
    { label: "تعديل الخدمة" },
  ], []);

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  const handleStep1Next = (data: Step1ServiceData) => {
    if (!formData) return;
    setFormData({ ...formData, step1: data });
    setCurrentStep(2);
  };
  const handleStep1Cancel = () => router.push("/admin/serviceProviders");

  const handleStep2Next = (data: Step2ServiceData) => {
    if (!formData) return;
    setFormData({ ...formData, step2: data });
    setCurrentStep(3);
  };
  const handleStep2Back = () => setCurrentStep(1);

  const handleStep3Next = (data: Step3ServiceData) => {
    if (!formData) return;
    setFormData({ ...formData, step3: data });
    setCurrentStep(4);
  };
  const handleStep3Back = () => setCurrentStep(2);

  const handleStep4Next = (data: Step4ServiceData) => {
    if (!formData) return;
    setFormData({ ...formData, step4: data });
    setCurrentStep(5);
  };
  const handleStep4Back = () => setCurrentStep(3);

  const handleStep5Submit = async (data: Step5ServiceData) => {
    if (!formData) return;
    const { step1, step2, step3, step4 } = formData;

    if (!step1 || !step2 || !step3 || !step4) {
      toast.error("يرجى إكمال جميع الخطوات السابقة");
      return;
    }

    const payload: ServicePayload = {
      title: step1.title,
      category_id: step1.category_id,
      section_id: step1.section_id,
      store_id: Number(storeId),
      tags: step1.tags,
      specialties: step1.specialties,

      price: step2.price,
      execute_count: step2.execute_count,
      execute_type: step2.execute_type,
      extras: step2.extras,

      images: step3.images,
      description: step4.description,
      questions: step4.questions,

      status: serviceResponse?.data.status || "pending",
    };

    try {
      await updateServiceMutation.mutateAsync({
        id: serviceId,
        payload,
        storeId
      });
      setShowSuccessModal(true);
    } catch (error) {
      // Error handled in hook
    }
  };
  const handleStep5Back = () => setCurrentStep(4);

  if (isLoading) return <Loader2 className="animate-spin" />;
  if (isError || !serviceResponse?.data) return <div>Error...</div>;
  if (!formData) return null;

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
        return <AddServiceStep1 initialData={formData.step1!} onNext={handleStep1Next} onCancel={handleStep1Cancel} barSteps={steps} breadcrumbItems={breadcrumbItems} onStepClick={setCurrentStep} showSaveDraft={false} storeId={storeId} />;
      case 2:
        return <AddServiceStep2 previousData={formData.step1!} initialData={formData.step2!} onNext={handleStep2Next} onBack={handleStep2Back} barSteps={steps} breadcrumbItems={breadcrumbItems} onStepClick={setCurrentStep} />;
      case 3:
        return <AddServiceStep3 previousDataStep1={formData.step1!} previousDataStep2={formData.step2!} initialData={formData.step3!} onNext={handleStep3Next} onBack={handleStep3Back} barSteps={steps} breadcrumbItems={breadcrumbItems} onStepClick={setCurrentStep} />;
      case 4:
        return <AddServiceStep4 previousDataStep1={formData.step1!} previousDataStep2={formData.step2!} previousDataStep3={formData.step3!} initialData={formData.step4!} onSave={handleStep4Next} onBack={handleStep4Back} isSubmitting={false} barSteps={steps} breadcrumbItems={breadcrumbItems} onStepClick={setCurrentStep} isEditMode />;
      case 5:
        return <AddServiceStep5 previousDataStep1={formData.step1!} previousDataStep2={formData.step2!} previousDataStep3={formData.step3!} onSave={handleStep5Submit} onBack={handleStep5Back} isSubmitting={updateServiceMutation.isPending} barSteps={steps} breadcrumbItems={breadcrumbItems} onStepClick={setCurrentStep} />;
      default: return null;
    }
  };

  return (
    <>
      {renderStep()}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => router.push(`/admin/serviceProviders/${storeId}`)}
        title="تم تعديل الخدمة بنجاح"
        message="تم تعديل الخدمة بنجاح، وهي الآن قيد المراجعة من قبل الفريق المختص. سنوافيكم بالرد خلال 24 إلى 48 ساعة."
        buttonText="قائمة الخدمات"
      />
    </>
  );
}