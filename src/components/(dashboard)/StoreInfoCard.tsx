"use client";

import Link from "next/link";
import { ChevronLeft, MapPin, Star, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Store } from "@/src/features/(dashboard)/stores/api";
import { formatStoreCityNames, getStoreCityNames } from "@/src/lib/storeCities";
import { cn } from "@/src/lib/utils";

interface StoreInfoCardProps {
  store: Store;
  href: string;
  className?: string;
}

export function StoreInfoCard({ store, href, className }: StoreInfoCardProps) {
  const location = formatStoreCityNames(getStoreCityNames(store));
  const followers = Number(store.followers_count ?? 0) || 0;

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-4 rounded-2xl border border-c2-neutral-200 bg-white p-4 transition-colors hover:border-c2-primary",
        className,
      )}
    >
      <Avatar className="size-14 shrink-0 rounded-xl border border-c2-neutral-200">
        <AvatarImage src={store.logo_url || ""} alt={store.name} className="object-cover" />
        <AvatarFallback className="rounded-xl">{store.name?.[0]}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="text-xs text-c2-neutral-600">المتجر</p>
        <h3 className="truncate font-medium text-c2-neutral-900">{store.name}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-c2-neutral-600">
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="size-4 text-c2-primary" />
              {location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Star className="size-4 fill-c2-rating text-c2-rating" />
            {store.review_rate || "0"}
          </span>
          <span className="flex items-center gap-1">
            <Users className="size-4" />
            {followers} متابع
          </span>
        </div>
      </div>

      <ChevronLeft className="size-5 shrink-0 text-c2-neutral-600 transition-colors group-hover:text-c2-primary ltr:rotate-180" />
    </Link>
  );
}
