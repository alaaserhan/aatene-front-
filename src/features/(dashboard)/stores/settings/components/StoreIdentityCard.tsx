// src/features/(dashboard)/stores/settings/components/StoreIdentityCard.tsx
"use client";

import { MapPin } from "lucide-react";
import { cn, isVideoFile } from "@/src/lib/utils";
import { Store, StoreStatus } from "../../api";

const STATUS_META: Record<StoreStatus, { label: string; className: string }> = {
  approved: {
    label: "تمت الموافقة عليه",
    className: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  pending: {
    label: "قيد المراجعة",
    className: "bg-amber-50 text-amber-600 border-amber-200",
  },
  rejected: {
    label: "مرفوض",
    className: "bg-red-50 text-red-500 border-red-200",
  },
};

interface StoreIdentityCardProps {
  store: Store;
}

/**
 * Header of the settings page: shows the store being edited (cover, logo, name
 * and state) so the merchant can tell at a glance which store these forms save.
 */
export function StoreIdentityCard({ store }: StoreIdentityCardProps) {
  const cover = store.cover_urls?.[0];
  const showCover = Boolean(cover) && !isVideoFile(cover || "");
  const status = STATUS_META[store.status];
  const cityName = store.city?.name;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="relative h-24 sm:h-28">
        {showCover ? (
          <>
            <img
              src={cover as string}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-blue-7/45" />
          </>
        ) : (
          <div className="h-full w-full bg-linear-to-l from-blue-3 to-blue-4" />
        )}
      </div>

      <div className="-mt-10 flex flex-wrap items-end gap-4 px-4 pb-5 sm:px-6">
        <div className="size-20 shrink-0 overflow-hidden rounded-xl border-4 border-white bg-gray-50 shadow-sm">
          {store.logo_url ? (
            <img
              src={store.logo_url}
              alt={store.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-blue-5 text-2xl font-bold text-blue-3">
              {store.name.trim().charAt(0)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 pb-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-blue-7 sm:text-2xl">
              {store.name}
            </h1>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-2">
              #{store.id}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-blue-1 bg-blue-5 px-3 py-1 text-[11px] font-bold text-blue-3">
              {store.type === "services" ? "متجر خدمات" : "متجر منتجات"}
            </span>
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-[11px] font-bold",
                status.className
              )}
            >
              {status.label}
            </span>
            {cityName && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-2">
                <MapPin className="size-3.5" />
                {cityName}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
