// src/features/(dashboard)/stores/components/EditStorePage.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AddStoreStep2 } from "./AddStoreStep2";
import { AddStoreStep3 } from "./AddStoreStep3";
import { AddStoreStep4 } from "./AddStoreStep4";
import { AddStoreStep5 } from "./AddStoreStep5";
import { AddStoreStep6 } from "./AddStoreStep6";
import { AddStoreStep7 } from "./AddStoreStep7";
import { StoreType, StoreUpdatePayload } from "../api";
import { useUpdateStore, useGetSingleStore } from "../hooks";
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
import { Loader2 } from "lucide-react";

interface EditStorePageProps {
  storeId: number;
}

export function EditStorePage({ storeId }: EditStorePageProps) {
  const router = useRouter();
  const updateStoreMutation = useUpdateStore();
  const { data: storeData, isLoading } = useGetSingleStore(storeId);

  const [currentStep, setCurrentStep] = useState(2);
  const [formData, setFormData] = useState<CompleteStoreFormData | null>(null);

  const store = storeData?.record;

  useEffect(() => {
    if (store) {
      const initialFormData: CompleteStoreFormData = {
        type: store.type as StoreType,
        step2: {
          name: store.name,
          logo: store.logo,
          logo_preview: store.logo_url,
          cover: store.cover,
          cover_previews: store.cover_urls.filter((url): url is string => url !== null),
          description: store.description || "",
          email: store.email || "",
          city_id: store.city_id ? String(store.city_id) : "",
          address: store.address || "",
          owner_id: String(store.owner_id),
          currency_id: String(store.currency_id),
        },
        step3: {
          phone: store.phone || "",
          hide_phone: store.hide_phone === "1",
          whats_app: store.whats_app || "",
          tiktok: store.tiktok || "",
          facebook: store.facebook || "",
          instagram: store.instagram || "",
          youtube: store.youtube || "",
        },
        step4: {
          managers: store.managers || [],
        },
        step5: {
          open_status: store.open_status,
          workingtimes: store.workingtimes || [],
        },
        step6: {
          delivery_type: store.delivery_type || "shipping",
          shippingCompanies: store.shippingCompanies || [],
        },
        step7: {
          tags: store.tags || [],
        },
      };

      setFormData(initialFormData);
    }
  }, [store]);

  const handleStep2Next = (data: Step2FormData) => {
    if (!formData) return;
    setFormData({ ...formData, step2: data });
    setCurrentStep(3);
  };

  const handleStep2Back = () => {
    router.push("/admin/stores");
  };

  const handleStep3Next = (data: Step3FormData) => {
    if (!formData) return;
    setFormData({ ...formData, step3: data });
    setCurrentStep(4);
  };

  const handleStep3Back = () => {
    setCurrentStep(2);
  };

  const handleStep4Next = (data: Step4FormData) => {
    if (!formData) return;
    setFormData({ ...formData, step4: data });
    setCurrentStep(5);
  };

  const handleStep4Back = () => {
    setCurrentStep(3);
  };

  const handleStep5Next = (data: Step5FormData) => {
    if (!formData) return;
    setFormData({ ...formData, step5: data });
    setCurrentStep(6);
  };

  const handleStep5Back = () => {
    setCurrentStep(4);
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

    if (
      !updatedFormData.step2 ||
      !updatedFormData.step3 ||
      !updatedFormData.step4 ||
      !updatedFormData.step5 ||
      !updatedFormData.step6
    ) {
      toast.error("يرجى إكمال جميع الخطوات المطلوبة");
      return;
    }

    const payload: StoreUpdatePayload = {
      name: updatedFormData.step2.name,
      logo: updatedFormData.step2.logo || "",
      cover: updatedFormData.step2.cover,
      description: updatedFormData.step2.description,
      email: updatedFormData.step2.email,
      city_id: updatedFormData.step2.city_id
        ? Number(updatedFormData.step2.city_id)
        : null,
      address: updatedFormData.step2.address,
      owner_id: Number(updatedFormData.step2.owner_id),
      currency_id: Number(updatedFormData.step2.currency_id),
      phone: updatedFormData.step3.phone,
      whats_app: updatedFormData.step3.whats_app || null,
      tiktok: updatedFormData.step3.tiktok || null,
      facebook: updatedFormData.step3.facebook || null,
      instagram: updatedFormData.step3.instagram || null,
      youtube: updatedFormData.step3.youtube || null,
      managers: updatedFormData.step4.managers,
      open_status: updatedFormData.step5.open_status,
      workingtimes: updatedFormData.step5.workingtimes,
      delivery_type: updatedFormData.step6.delivery_type,
      shippingCompanies: updatedFormData.step6.shippingCompanies,
      tags: data.tags,
    };

    try {
      await updateStoreMutation.mutateAsync({
        id: storeId,
        payload,
      });
      router.push("/admin/stores");
    } catch (error) {
      console.error("Error updating store:", error);
    }
  };

  const handleStep7Back = () => {
    setCurrentStep(6);
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
          <p className="text-xl text-gray-600 mb-4">لم يتم العثور على المتجر</p>
        </div>
      </div>
    );
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
          />
        );

      case 6:
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
          />
        );

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