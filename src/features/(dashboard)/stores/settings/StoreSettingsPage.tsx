// src/features/(dashboard)/stores/settings/StoreSettingsPage.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Accordion } from "@/src/components/ui/accordion";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { useAuthStore } from "@/src/stores/auth-store";
import { getStoreContext } from "@/src/store-context";
import { useGetSingleStore } from "../hooks";
import { mapStoreToSettings } from "./mapStoreToSettings";
import { MainDataSection } from "./sections/MainDataSection";
import { SocialMediaSection } from "./sections/SocialMediaSection";
import { WorkingHoursSection } from "./sections/WorkingHoursSection";
import { ShippingSection } from "./sections/ShippingSection";
import { KeywordsSection } from "./sections/KeywordsSection";
import { StoreSectionsSection } from "./sections/StoreSectionsSection";

const breadcrumbItems = [
  { label: "الرئيسية", href: "/admin/home" },
  { label: "المتاجر", href: "/admin/stores" },
  { label: "إعدادات المتجر" },
];

interface StoreSettingsPageProps {
  storeId: number;
  /**
   * When true (the settings route), a merchant is redirected to the store
   * currently selected in their store context. The edit route passes false so
   * any of the merchant's stores can be opened directly.
   */
  lockToCurrentStore?: boolean;
}

/**
 * Store settings, one independent accordion per API endpoint. Merchants land
 * here after creating a store to fill in everything the create form skips.
 */
export function StoreSettingsPage({
  storeId,
  lockToCurrentStore = true,
}: StoreSettingsPageProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isMerchant = user?.user_type === "merchant";

  const { data, isLoading } = useGetSingleStore(storeId);
  const store = data?.record;

  // A merchant only ever manages the store selected in their store context
  useEffect(() => {
    if (!lockToCurrentStore || !isMerchant) return;
    const { storeId: currentStoreId } = getStoreContext();
    if (currentStoreId && String(storeId) !== currentStoreId) {
      router.replace(`/admin/stores/${currentStoreId}/settings`);
    }
  }, [lockToCurrentStore, isMerchant, storeId, router]);

  const settings = useMemo(
    () => (store ? mapStoreToSettings(store) : null),
    [store]
  );

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-3" />
          <span>جاري تحميل البيانات...</span>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-gray-2">لم يتم العثور على المتجر</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-0 py-4">
      <Breadcrumb items={breadcrumbItems} withContainer />

      <header className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">إعدادات المتجر</h1>
        <p className="text-md text-gray-2">
          يمكنك تحديث بيانات متجر <span className="text-primary font-bold">&quot;{store.name}&quot;</span>. كل قسم يُحفظ بشكل مستقل عن
          الأقسام الأخرى.
        </p>
      </header>

      <Accordion type="multiple" className="mt-4 mb-8 space-y-4">
        <MainDataSection
          key={`mainData-${storeId}`}
          storeId={storeId}
          storeType={store.type}
          initialValues={settings.mainData}
        />

        <StoreSectionsSection
          key={`storeSections-${storeId}`}
          storeId={storeId}
        />

        <SocialMediaSection
          key={`socialMedia-${storeId}`}
          storeId={storeId}
          initialValues={settings.socialMedia}
        />

        <WorkingHoursSection
          key={`workingHours-${storeId}`}
          storeId={storeId}
          initialValues={settings.workingHours}
        />

        {store.type === "products" && (
          <ShippingSection
            key={`shipping-${storeId}`}
            storeId={storeId}
            initialValues={settings.shipping}
          />
        )}

        <KeywordsSection
          key={`keywords-${storeId}`}
          storeId={storeId}
          initialValues={settings.keywords}
          storeType={store.type}
          storeName={store.name}
          storeDescription={store.description || ""}
        />
      </Accordion>
    </div>
  );
}
