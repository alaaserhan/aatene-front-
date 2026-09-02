// src/features/(dashboard)/stores/create/StoreTypeSelectPage.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { RadioCard, RadioCardGroup } from "@/src/components/ui/RadioCard";
import { StoreSubmitBar } from "../components/StoreSubmitBar";
import { StoreType } from "../api";

const breadcrumbItems = [{ label: "الرئيسية", href: "/admin/home" }, { label: "المتاجر", href: "/admin/stores" }, { label: "إضافة متجر" }];

/**
 * First screen of store creation: pick the store type. Each type then has its
 * own single-step form — `create/services` or `create/products`.
 */
export function StoreTypeSelectPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<StoreType>("products");

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} withContainer />

      <div className="heading-card">
        <div className="mb-6 pb-6">
          <h1 className="heading-1 mb-3">كن تاجرًا</h1>
          <p className="heading-2">قم باختيار نوع المتجر الذي تريده (بيع منتجات/تقديم خدمات)</p>
        </div>

        <RadioCardGroup label="نوع المتجر" name="storeType" value={selectedType} onChange={setSelectedType}>
          <RadioCard value="products" label="بيع منتجات" icon={<Image src="/icons/dashboard/shop.svg" alt="" className="size-12" width={12} height={12} />} />
          <RadioCard value="services" label="تقديم خدمات" icon={<Image src="/icons/dashboard/service.svg" alt="" className="size-12" width={12} height={12} />} />
        </RadioCardGroup>
      </div>

      <div className="container fixed bottom-0">
        <StoreSubmitBar className="" submitLabel="التالي" onSubmit={() => router.push(`/admin/stores/add/${selectedType}`)} onCancel={() => router.push("/admin/stores")} />
      </div>
    </div>
  );
}
