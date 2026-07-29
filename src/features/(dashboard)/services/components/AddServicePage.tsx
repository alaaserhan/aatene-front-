// src/features/(dashboard)/services/components/AddServicePage.tsx
"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateService } from "../hooks";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";
import { ServiceForm } from "./form/ServiceForm";
import { ServiceFormValues, formValuesToPayload } from "./form/types";

interface AddServicePageProps {
  storeId: number | string;
}

export function AddServicePage({ storeId }: AddServicePageProps) {
  const router = useRouter();
  const { locale, type } = useParams<{ locale?: string; type?: string }>();
  const dashboardBase = locale && type ? `/${locale}/${type}` : "/admin";

  const createService = useCreateService();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const storeServicesUrl = `${dashboardBase}/serviceProviders/${storeId}?status=pending`;

  const breadcrumbItems = useMemo(
    () => [
      { label: "الخدمات", href: storeServicesUrl },
      { label: "انشاء خدمة جديدة" },
    ],
    [storeServicesUrl]
  );

  const handleSubmit = async (values: ServiceFormValues) => {
    try {
      await createService.mutateAsync({
        payload: formValuesToPayload(values, storeId, "pending"),
        storeId,
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error creating service:", error);
      toast.error("تعذّر إنشاء الخدمة، حاول مرة أخرى");
    }
  };

  return (
    <>
      <ServiceForm
        storeId={storeId}
        breadcrumbItems={breadcrumbItems}
        submitLabel="نشر الخدمة"
        isSubmitting={createService.isPending}
        onSubmit={handleSubmit}
        onCancel={() => router.push(storeServicesUrl)}
      />
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => router.push(storeServicesUrl)}
        title="تم رفع الخدمة بنجاح"
        message="تم رفع الخدمة بنجاح، وهي الآن قيد المراجعة من قبل الفريق المختص. سنوافيك بالرد قريباً."
        buttonText="قائمة الخدمات"
      />
    </>
  );
}
