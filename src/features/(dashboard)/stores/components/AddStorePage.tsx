// src/features/(dashboard)/stores/components/AddStorePage.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AddStoreStep2 } from "./AddStoreStep2";
import { AddStoreStep3 } from "./AddStoreStep3";
import { AddStoreStep4 } from "./AddStoreStep4";
import { AddStoreStep5 } from "./AddStoreStep5";
import { StoreType } from "../api";
import { AddStoreStep6 } from "./AddStoreStep6";
import { AddStoreStep7 } from "./AddStoreStep7";

interface StoreFormData {
  type: StoreType;
  step2?: any;
  step3?: any;
  step4?: any;
  step5?: any;
  step6?: any;
}

interface AddStorePageProps {
  storeType: StoreType;
}

export function AddStorePage({ storeType }: AddStorePageProps) {
  const router = useRouter();

  // Start from Step 2 (البيانات الأساسية)
  const [currentStep, setCurrentStep] = useState(2);
  const [formData, setFormData] = useState<StoreFormData>({
    type: storeType,
  });

  // Step 2: Basic Information
  const handleStep2Next = (data: any) => {
    setFormData({ ...formData, step2: data });
    setCurrentStep(3);
  };

  const handleStep2Back = () => {
    // Go back to Step 1 (type selection page)
    router.push("/admin/stores/add");
  };

  // Step 3: Contact & Social
  const handleStep3Next = (data: any) => {
    setFormData({ ...formData, step3: data });
    setCurrentStep(4);
  };

  const handleStep3Back = () => {
    setCurrentStep(2);
  };

  // Step 4: Managers
  const handleStep4Next = (data: any) => {
    setFormData({ ...formData, step4: data });
    setCurrentStep(5);
  };

  const handleStep4Back = () => {
    setCurrentStep(3);
  };

  // Step 5: Working Hours
  const handleStep5Next = (data: any) => {
    setFormData({ ...formData, step5: data });
    setCurrentStep(6);
    // TODO: Navigate to Step 6
  };

  const handleStep5Back = () => {
    setCurrentStep(4);
  };

  const handleStep6Next = (data: any) => {
    setFormData({ ...formData, step6: data });
    setCurrentStep(7);  
  };

  const handleStep6Back = () => {
    setCurrentStep(5);
  }

  const renderStep = () => {
    switch (currentStep) {
      case 2:
        return (
          <AddStoreStep2
            storeType={formData.type}
            initialData={formData.step2}
            onNext={handleStep2Next}
            onBack={handleStep2Back}
          />
        );

      case 3:
        return (
          <AddStoreStep3
            storeType={formData.type}
            previousData={formData.step2}
            initialData={formData.step3}
            onNext={handleStep3Next}
            onBack={handleStep3Back}
          />
        );

      case 4:
        return (
          <AddStoreStep4
            storeType={formData.type}
            previousData={formData.step2}
            initialData={formData.step4}
            onNext={handleStep4Next}
            onBack={handleStep4Back}
          />
        );

      case 5:
        return (
          <AddStoreStep5
            storeType={formData.type}
            previousData={formData.step2}
            initialData={formData.step5}
            onNext={handleStep5Next}
            onBack={handleStep5Back}
          />
        );

      case 6:
        // TODO: Add Step 6 component
        return (
          <AddStoreStep6
            storeType={formData.type}
            previousData={formData.step2}
            initialData={formData.step6}
            onNext={handleStep6Next}
            onBack={handleStep5Back}
          />);

          case 7:
        // TODO: Add Step 7 component
        return (
          <AddStoreStep7
            storeType={formData.type}
            previousData={formData.step2}
            initialData={formData.step6}
            onBack={handleStep5Back}
          />);

      default:
        return (
          <AddStoreStep2
            storeType={formData.type}
            initialData={formData.step2}
            onNext={handleStep2Next}
            onBack={handleStep2Back}
          />
        );
    }
  };

  return <>{renderStep()}</>;
}