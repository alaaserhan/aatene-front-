"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useGetSingleStore } from "../hooks";
import { StoreReviewActionsCard } from "./StoreReviewActionsCard";

interface StoreAdminPreviewPageProps {
  storeId: number;
}

/**
 * "معاينة المتجر" — the compact screen an admin lands on from the eye icon in
 * the stores table: the accept/reject actions plus the store's basic data.
 */
export function StoreAdminPreviewPage({ storeId }: StoreAdminPreviewPageProps) {
  const { data: storeData, isLoading } = useGetSingleStore(storeId);
  const store = storeData?.record;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100 bg-white rounded-lg">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-c2-primary" />
          <span>جاري تحميل البيانات...</span>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex items-center justify-center min-h-100 bg-white rounded-lg">
        <p className="text-xl text-c2-neutral-550">لم يتم العثور على المتجر</p>
      </div>
    );
  }

  const ownerName = store.owner
    ? `${store.owner.first_name} ${store.owner.last_name}`.trim()
    : "";
  const email = store.email || store.owner?.email;
  const phone = store.owner?.phone || store.phone;

  return (
    <div dir="rtl" className="space-y-6">
      <StoreReviewActionsCard store={store} />

      <section className="rounded-lg border border-c2-neutral-200 bg-white p-4 lg:p-14 space-y-5">
        <h2 className="text-base font-bold">البيانات الأساسية للمتجر</h2>

        <div className="px-4 sm:px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <PreviewField
              icon="/icons/dashboard/gallery.svg"
              label="شعار المتجر"
              value={
                store.logo_url ? (
                  <Image
                    src={store.logo_url}
                    alt={store.name}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded object-contain"
                    unoptimized
                  />
                ) : null
              }
            />
            <PreviewField
              icon="/icons/dashboard/mark2.svg"
              label="اسم المتجر"
              value={store.name}
            />
            <PreviewField
              icon="/icons/dashboard/email.svg"
              label="البريد الإلكتروني"
              value={
                email ? (
                  <a
                    href={`mailto:${email}`}
                    dir="ltr"
                    className="block text-right hover:text-c2-primary hover:underline"
                  >
                    {email}
                  </a>
                ) : null
              }
            />
            <PreviewField
              icon="/icons/dashboard/phone2.svg"
              label="رقم الهاتف"
              value={
                phone ? (
                  // dir="ltr" keeps digits and any leading + in logical order inside the RTL page
                  <a
                    href={`tel:${phone}`}
                    dir="ltr"
                    className="block text-right hover:text-c2-primary hover:underline"
                  >
                    {phone}
                  </a>
                ) : null
              }
            />
            <PreviewField
              icon="/icons/dashboard/store.svg"
              label="تخصص المتجر"
              value={store.speciality}
            />
            <PreviewField
              icon="/icons/dashboard/person.svg"
              label="المالك"
              value={ownerName}
            />
            <PreviewField
              icon="/icons/dashboard/mark.svg"
              label="مدينة المتجر"
              value={store.city?.name}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

interface PreviewFieldProps {
  icon: string;
  label: string;
  value: React.ReactNode;
}

function PreviewField({ icon, label, value }: PreviewFieldProps) {
  const isEmpty = value == null || value === "";

  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded border border-c2-neutral-200">
        {/* Masked so every icon renders black, whatever colors its SVG ships with */}
        <span
          aria-hidden
          className="h-5 w-5 bg-c2-neutral-1000"
          style={{
            WebkitMaskImage: `url(${icon})`,
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            WebkitMaskSize: "contain",
            maskImage: `url(${icon})`,
            maskRepeat: "no-repeat",
            maskPosition: "center",
            maskSize: "contain",
          }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-sm text-c2-neutral-550">{label}</p>
        <div className="text-sm font-medium text-c2-neutral-950 wrap-break-word [word-break:break-word]">
          {isEmpty ? "-" : value}
        </div>
      </div>
    </div>
  );
}
