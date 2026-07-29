// src/features/(dashboard)/services/components/EditServicePage.tsx
"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useGetService, useUpdateService } from "../hooks";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";
import { ServiceForm } from "./form/ServiceForm";
import { ServiceFormValues, formValuesToPayload, serviceToFormValues } from "./form/types";

interface EditServicePageProps {
  serviceId: number | string;
  storeId: number | string;
}

export function EditServicePage({ serviceId, storeId }: EditServicePageProps) {
  const router = useRouter();
  const { locale, type } = useParams<{ locale?: string; type?: string }>();
  const dashboardBase = locale && type ? `/${locale}/${type}` : "/admin";

  const { data: serviceResponse, isLoading, isError } = useGetService(serviceId, storeId);
  const updateService = useUpdateService();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const service = serviceResponse?.data;
  const initialValues = useMemo(
    () => (service ? serviceToFormValues(service) : undefined),
    [service]
  );

  const storeServicesUrl = `${dashboardBase}/serviceProviders/${storeId}`;

  const breadcrumbItems = useMemo(
    () => [
      { label: "الخدمات", href: storeServicesUrl },
      { label: "تعديل الخدمة" },
    ],
    [storeServicesUrl]
  );

  const handleSubmit = (values: ServiceFormValues) => {
    if (updateService.isPending) return;
    updateService.mutate(
      {
        id: serviceId,
        payload: formValuesToPayload(values, storeId, service?.status || "pending"),
        storeId,
      },
      {
        onSuccess: () => setShowSuccessModal(true),
        onError: () => toast.error("تعذّر تعديل الخدمة، حاول مرة أخرى"),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="w-6 h-6 animate-spin text-blue-4" />
      </div>
    );
  }

  if (isError || !initialValues) {
    return <div className="p-8 text-center text-gray-2">تعذّر تحميل بيانات الخدمة</div>;
  }

  return (
    <>
      <ServiceForm
        key={String(serviceId)}
        storeId={storeId}
        initialValues={initialValues}
        breadcrumbItems={breadcrumbItems}
        submitLabel="حفظ التعديلات"
        isSubmitting={updateService.isPending}
        onSubmit={handleSubmit}
        onCancel={() => router.push(storeServicesUrl)}
      />
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => router.push(storeServicesUrl)}
        title="تم تعديل الخدمة بنجاح"
        message="تم تعديل الخدمة بنجاح، وهي الآن قيد المراجعة من قبل الفريق المختص. سنوافيكم بالرد قريباً."
        buttonText="قائمة الخدمات"
      />
    </>
  );
}
