// src/features/(dashboard)/products/components/AddProductPage.tsx
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { AddProductStep1 } from "./AddProductStep1";
import { AddProductStep2 } from "./AddProductStep2";
import { AddProductStep3 } from "./AddProductStep3";
import { AddProductStep4 } from "./AddProductStep4";
import { ProductCreatePayload } from "../api";
import { useCreateProduct, useGenerateProductAI } from "../hooks";
import {
  CompleteProductFormData,
  Step1FormData,
  Step2FormData,
  Step3FormData,
  Step4FormData,
} from "../types";

import { toast } from "sonner";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";

export function AddProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionIdFromUrl = searchParams.get("section_id");

  const storeIdFromUrl = searchParams.get("store_id");
  const storeId = storeIdFromUrl || Cookies.get("current_store_id");
  const userType = Cookies.get("user_type");
  const isAdmin = userType === "admin";
  const toastShownRef = useRef(false);

  const createProductMutation = useCreateProduct();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CompleteProductFormData>({
    step2: (sectionIdFromUrl || storeIdFromUrl) ? {
      store_id: Number(storeId) || 0,
      tags: [],
      ...(sectionIdFromUrl ? { section_id: Number(sectionIdFromUrl) } : {}),
    } : undefined
  });

  const generateAIMutation = useGenerateProductAI();
  const isGeneratingAI = generateAIMutation.isPending;
  const [lastGeneratedInput, setLastGeneratedInput] = useState<{ title: string; description: string; short_description: string } | null>(null);
  const [aiKeywords, setAiKeywords] = useState<string[]>([]);

  const breadcrumbItems = useMemo(() => [
    {
      label: "المنتجات",
      href: storeIdFromUrl ? `/admin/productProviders/${storeIdFromUrl}` : "/admin/products",
    },
    { label: "انشاء منتج جديد" },
  ], [storeIdFromUrl]);

  useEffect(() => {
    if (toastShownRef.current) return;

    const savedDraft = localStorage.getItem("product_draft");
    if (savedDraft) {
      toastShownRef.current = true;
      try {
        const parsedDraft = JSON.parse(savedDraft);
        toast("يوجد مسودة سابقة", {
          description: "هل تريد استكمال آخر جلسة؟",
          action: {
            label: "نعم، استكمل",
            onClick: () => {
              setFormData(parsedDraft);
              if (parsedDraft.step3) setCurrentStep(4);
              else if (parsedDraft.step2) setCurrentStep(3);
              else if (parsedDraft.step1) setCurrentStep(2);
            },
          },
          cancel: {
            label: "لا، ابدأ من جديد",
            onClick: () => {
              localStorage.removeItem("product_draft");
            }
          },
          duration: 10000,
        });
      } catch (error) {
        console.error("Failed to parse draft", error);
      }
    }
  }, []);

  const handleSaveDraft = (currentStepData?: Step1FormData | Step2FormData | Step3FormData | Step4FormData | null) => {
    try {
      const dataToSave = { ...formData };

      if (currentStepData) {
        if (currentStep === 1) dataToSave.step1 = currentStepData as Step1FormData;
        if (currentStep === 2) dataToSave.step2 = currentStepData as Step2FormData;
        if (currentStep === 3) dataToSave.step3 = currentStepData as Step3FormData;
        if (currentStep === 4) dataToSave.step4 = currentStepData as Step4FormData;
        setFormData(dataToSave);
      }

      localStorage.setItem("product_draft", JSON.stringify(dataToSave));
      toast.success("تم حفظ المسودة بنجاح");
    } catch (error) {
      toast.error("فشل حفظ المسودة");
    }
  };

  const handleStepClick = (step: number) => {
    if (step === 1) setCurrentStep(1);
    else if (step === 2 && formData.step1) setCurrentStep(2);
    else if (step === 3 && formData.step1 && formData.step2) setCurrentStep(3);
    else if (step === 4 && formData.step1 && formData.step2 && formData.step3) setCurrentStep(4);
  };

  const handleStep1Next = (data: Step1FormData) => {
    const newData = { ...formData, step1: data };
    setFormData(newData);
    setCurrentStep(2);
    // Trigger AI generation automatically
    handleGenerateAI(data);
  };

  const handleStep1Cancel = () => {
    router.push(storeIdFromUrl ? `/admin/productProviders/${storeIdFromUrl}` : "/admin/products");
  };

  const handleStep2Next = (data: Step2FormData) => {
    setFormData((prev) => ({ ...prev, step2: data }));
    setCurrentStep(3);
  };

  const handleStep2Back = () => {
    setCurrentStep(1);
  };

  const handleStep3Next = (data: Step3FormData) => {
    setFormData((prev) => ({ ...prev, step3: data }));
    setCurrentStep(4);
  };

  const handleStep3Back = () => {
    setCurrentStep(2);
  };

  const handleStep4Save = async (data: Step4FormData) => {
    const updatedFormData = { ...formData, step4: data };

    const isMissingSteps =
      !updatedFormData.step1 ||
      !updatedFormData.step2 ||
      !updatedFormData.step3;

    if (isMissingSteps) {
      toast.error("يرجى إكمال جميع الخطوات المطلوبة");
      return;
    }

    const payload: ProductCreatePayload = {
      sku: `SKU-${Date.now()}`,
      name: updatedFormData.step1!.name,
      short_description: updatedFormData.step1!.short_description,
      description: updatedFormData.step1!.description,
      cover: updatedFormData.step1!.cover,
      gallery: updatedFormData.step1!.gallery,
      type: updatedFormData.step3!.hasVariations ? "variation" : "simple",
      condition: updatedFormData.step1!.condition,
      category_id: updatedFormData.step1!.category_id,
      store_id: updatedFormData.step2!.store_id,
      section_id: updatedFormData.step2!.section_id || 0,
      price: updatedFormData.step1!.price,

      status: isAdmin ? "active" : "not-active",
      tags: updatedFormData.step2!.tags,
  crossSells: [...new Set(data.crossSells || [])],
  cross_sells_price: data.cross_sells_price || undefined,
  cross_sells_due_date: data.cross_sells_due_date || undefined,
  cross_sells_name: data.cross_sells_name || undefined,
  cross_sells_description: data.cross_sells_description || undefined,
    };

    if (updatedFormData.step3!.hasVariations && updatedFormData.step3!.variations.length > 0) {
      payload.variations = updatedFormData.step3!.variations
        .filter((v) => v.enabled)
        .map((v) => ({
          price: v.price,
          image: v.images[0] || "",
          attributeOptions: Object.entries(v.attributeValues).map(([attrId, value]) => ({
            attribute_id: Number(attrId) || 0,
            option_id: Number(value) || 0,
          })),
        }));
    }

    try {
      await createProductMutation.mutateAsync(payload);
      localStorage.removeItem("product_draft");
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  const handleStep4Back = (data: Step4FormData) => {
    setFormData({ ...formData, step4: data });
    setCurrentStep(3);
  };

  const handleGenerateAI = async (currentStep1Data: Step1FormData) => {
    const title = currentStep1Data.name.trim();
    const description = currentStep1Data.description.trim();
    const short_description = currentStep1Data.short_description.trim();

    if (
      lastGeneratedInput &&
      lastGeneratedInput.title === title &&
      lastGeneratedInput.description === description &&
      lastGeneratedInput.short_description === short_description
    ) {
      return;
    }

    try {
      const data = await generateAIMutation.mutateAsync({
        title,
        description,
        short_description,
        type: "product",
      });

      setLastGeneratedInput({ title, description, short_description });


      setFormData((prev) => {
        const newStep1 = { ...prev.step1, ...currentStep1Data };
        if (data.title) newStep1.name = data.title;
        if (data.short_description) newStep1.short_description = data.short_description;

        const newStep2 = { ...prev.step2 } as Step2FormData;

        if (!newStep2.tags) {
          newStep2.tags = [];
        }

        if (data.results?.keywords) {
          newStep2.tags = data.results.keywords;
          setAiKeywords(data.results.keywords);
        }

        return {
          ...prev,
          step1: newStep1,
          step2: newStep2
        };
      });

    } catch (error) {
      console.error("AI Generation Error:", error);
      toast.error("فشل توليد البيانات");
    }
  };


  const steps = [
    { number: 1, label: "المعلومات الاساسية", completed: currentStep > 1 },
    { number: 2, label: "المعلومات المتقدمة", completed: currentStep > 2 },
    { number: 3, label: "الاختلافات و الكميات", completed: currentStep > 3 },
    { number: 4, label: "منتجات مرتبطة", completed: false },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <AddProductStep1
            initialData={formData.step1}
            onNext={handleStep1Next}
            onCancel={handleStep1Cancel}
            onSaveDraft={() => handleSaveDraft(null)}
            barSteps={steps}
            storeId={storeId}
            breadcrumbItems={breadcrumbItems}
            onStepClick={handleStepClick}
          />
        );

      case 2:
        if (!formData.step1) {
          setCurrentStep(1);
          return null;
        }
        return (
          <AddProductStep2
            previousData={formData.step1}
            initialData={formData.step2}
            onNext={handleStep2Next}
            onBack={handleStep2Back}
            onSaveDraft={() => handleSaveDraft(null)}
            barSteps={steps}
            breadcrumbItems={breadcrumbItems}
            onStepClick={handleStepClick}
            isGeneratingAI={isGeneratingAI}
            aiKeywords={aiKeywords}
          />
        );

      case 3:
        if (!formData.step1) {
          setCurrentStep(1);
          return null;
        }
        return (
          <AddProductStep3
            previousData={formData.step1}
            initialData={formData.step3}
            onNext={handleStep3Next}
            onBack={handleStep3Back}
            onSaveDraft={handleSaveDraft}
            barSteps={steps}
            breadcrumbItems={breadcrumbItems}
            onStepClick={handleStepClick}
          />
        );

      case 4:
        if (!formData.step1) {
          setCurrentStep(1);
          return null;
        }
        return (
          <AddProductStep4
            previousData={formData.step1}
            initialData={formData.step4}
            onSave={handleStep4Save}
            onBack={handleStep4Back}
            onSaveDraft={handleSaveDraft}
            isSubmitting={createProductMutation.isPending}
            barSteps={steps}
            isEditMode={false}
            breadcrumbItems={breadcrumbItems}
            onStepClick={handleStepClick}
          />
        );

      default:
        return (
          <AddProductStep1
            initialData={formData.step1}
            onNext={handleStep1Next}
            onCancel={handleStep1Cancel}
            onSaveDraft={() => handleSaveDraft(null)}
            barSteps={steps}
            storeId={storeId}
            breadcrumbItems={breadcrumbItems}
            onStepClick={handleStepClick}
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
          router.push(storeIdFromUrl ? `/admin/productProviders/${storeIdFromUrl}` : "/admin/products");
        }}
        title="تم إضافة المنتج بنجاح"
        message={
          isAdmin
            ? "تمت إضافة المنتج الجديد إلى القائمة بنجاح، يمكنك الآن إدارة المنتجات."
            : "تمت إضافة المنتج الجديد إلى القائمة بنجاح، وسوف يتم نشره بعد المراجعة من قبل فريق أعطيني."
        }
        buttonText="العودة للقائمة"
      />
    </>
  );
}