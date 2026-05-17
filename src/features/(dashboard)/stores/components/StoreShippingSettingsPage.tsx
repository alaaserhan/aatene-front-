"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Loader2 } from "lucide-react";
import { AddStoreStep6 } from "./AddStoreStep6";
import { useGetSingleStore, useUpdateStore } from "../hooks";
import { Step2FormData, Step6FormData } from "../types";
import {
  buildStoreShippingUpdatePayload,
  getStoreUpdateValidationHint,
  mapStoreShippingCompanies,
} from "../buildStoreShippingUpdatePayload";
import { useAuthStore } from "@/src/stores/auth-store";
import { SuccessModal } from "@/src/components/(dashboard)/SuccessModal";
import { toast } from "sonner";

interface StoreShippingSettingsPageProps {
  storeId: number;
}

export function StoreShippingSettingsPage({ storeId }: StoreShippingSettingsPageProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isMerchant = user?.user_type === "merchant";
  const { data: storeData, isLoading } = useGetSingleStore(storeId);
  const updateStoreMutation = useUpdateStore();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const store = storeData?.record;

  useEffect(() => {
    if (!isMerchant) return;
    const currentStoreId = Cookies.get("current_store_id");
    if (currentStoreId && String(storeId) !== currentStoreId) {
      router.replace(`/admin/stores/${currentStoreId}/shipping`);
    }
  }, [isMerchant, storeId, router]);

  const step2Preview = useMemo((): Step2FormData | null => {
    if (!store) return null;
    return {
      name: store.name,
      logo: store.logo,
      logo_preview: store.logo_url,
      cover: store.cover || [],
      cover_previews: (store.cover_urls ?? []).filter(
        (url): url is string => typeof url === "string" && url.length > 0
      ),
      description: store.description || "",
      email: store.email || "",
      locationCities: [],
      serviceCities: [],
      address: store.address || "",
      owner_id: Number(store.owner_id) || 0,
      currency_id: Number(store.currency_id) || 1,
    };
  }, [store]);

  const step6Initial = useMemo((): Step6FormData | undefined => {
    if (!store) return undefined;
    return {
      delivery_type: store.delivery_type || "hand_delivery",
      shippingCompanies: mapStoreShippingCompanies(store.shippingCompanies),
    };
  }, [store]);

  const handleSave = async (data: Step6FormData) => {
    if (!store) return;

    const clientHint = getStoreUpdateValidationHint(store);
    if (clientHint) {
      toast.error(clientHint);
      return;
    }

    try {
      await updateStoreMutation.mutateAsync({
        id: storeId,
        payload: buildStoreShippingUpdatePayload(store, data),
      });
      setShowSuccessModal(true);
    } catch (error) {
      if (error && typeof error === "object" && "response" in error) {
        const axiosErr = error as { response?: { data?: unknown } };
        console.error("Shipping save validation:", axiosErr.response?.data);
      }
      console.error("Error saving shipping settings:", error);
    }
  };

  if (isLoading || !step2Preview) {
    return <PageLoader />;
  }

  if (!store) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-xl text-gray-2">لم يتم العثور على المتجر</p>
      </div>
    );
  }

  if (store.type !== "products") {
    return (
      <div className="flex items-center justify-center min-h-[50vh] px-4">
        <div className="text-center max-w-md">
          <p className="text-xl font-semibold text-brand-black-1 mb-2">
            إعداد الشحن متاح لمتاجر المنتجات فقط
          </p>
          <p className="text-sm text-gray-2 mb-6">
            المتجر الحالي من نوع خدمات. يمكنك تعديل مدن الخدمة من إعدادات المتجر.
          </p>
          <button
            type="button"
            onClick={() => router.push("/admin/home")}
            className="px-6 py-2.5 rounded-sm text-white"
            style={{ backgroundColor: "var(--blue-3)" }}
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <AddStoreStep6
        variant="standalone"
        storeType="products"
        previousData={step2Preview}
        initialData={step6Initial}
        onNext={() => {}}
        onSave={handleSave}
        onBack={() => router.push("/admin/home")}
        isSaving={updateStoreMutation.isPending}
        barSteps={[]}
        breadcrumbItems={[
          { label: "الرئيسية", href: "/admin/home" },
          { label: "الشحن" },
        ]}
      />
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="تم حفظ إعدادات الشحن"
        message="تم تحديث طريقة الشحن وشركات التوصيل للمتجر بنجاح."
        buttonText="حسناً"
      />
    </>
  );
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="flex items-center gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-blue-3" />
        <span>جاري تحميل البيانات...</span>
      </div>
    </div>
  );
}
