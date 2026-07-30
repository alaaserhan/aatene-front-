// src/components/(dashboard)/ProviderInfoCard.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { MapPin, Flag, Plus, Star, ShieldCheck, ShoppingCart, AlarmClock } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Store } from "@/src/features/(dashboard)/stores/api";
import { useLanguage } from "@/src/hooks/use-language";
import Link from "next/link";

export interface ProviderData {
  id?: number;
  name: string;
  avatar: string;
  location: string;
  memberSince: string;
  rating: string;
  ordersCount: number | string;
  isVerified?: boolean;
  isFollowing?: boolean;
  slug?: string;
}

interface ProviderInfoCardProps {
  store?: Store;
  provider?: ProviderData;
  className?: string;
  onReport?: () => void;
  onFollow?: () => void;
  isFollowing?: boolean;
  isOwner?: boolean;
  isAdmin?: boolean;
}

export function ProviderInfoCard({ store, provider, className, onReport, onFollow, isFollowing, isOwner, isAdmin }: ProviderInfoCardProps) {
  const lang = useLanguage();
  // If store is provided, map it to ProviderData
  const data: ProviderData | null = store
    ? {
        id: store.id,
        name: `${store.owner?.first_name} ${store.owner?.last_name}`,
        avatar: store.owner?.avatar_url || "",
        location: store.serviceCities?.[0]?.name || "فلسطين، الخليل",
        memberSince: store.owner?.created_at ? new Date(store.owner.created_at).toLocaleDateString("en-GB") : "N/A",
        rating: store.review_rate || "5.0",
        ordersCount: store.conversations_count || 0,
        isVerified: true, // Assuming dashboard stores are verified or we default to true/false
        isFollowing: isFollowing !== undefined ? isFollowing : store.am_i_following,
        slug: store.slug,
      }
    : provider
      ? {
          ...provider,
          isFollowing: isFollowing !== undefined ? isFollowing : provider.isFollowing,
        }
      : null;

  if (!data) return null;

  return (
    <div className={cn("bg-white rounded-2xl p-4 border border-[#DEE2E7]", className)}>
      {/* الجزء العلوي */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4  w-full md:w-auto ">
          <Link href={`/${lang}/store/${data.slug}`}>
            <Avatar className="w-14 h-14 border-2 border-white shadow-sm">
              <AvatarImage src={data.avatar} className="object-cover" />
              <AvatarFallback>{data.name?.[0]}</AvatarFallback>
            </Avatar>
          </Link>

          <div className="">
            <Link href={`/${lang}/store/${data.slug}`}>
              <h3 className=" font-medium  mb-1">{data.name}</h3>
            </Link>
            <div className="flex items-center  gap-1 text-gray-2 text-sm">
              <MapPin className="size-5 text-blue-3" />
              <span>{data.location}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2  w-full md:w-auto">
          {!isAdmin && (
            <Button onClick={onFollow} className={cn("font-medium h-8 px-8 gap-2 rounded-full flex-1 md:flex-none transition-colors", data.isFollowing ? "bg-gray-100 hover:bg-gray-200 text-gray-800 " : "bg-blue-3 text-white")}>
              {data.isFollowing ? (
                <>
                  <span>الغاء المتابعة</span>
                </>
              ) : (
                <>
                  <Plus className="size-5" />
                  <span>تابع</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* الفاصل */}
      <div className="border-t border-[#DEE2E7] mb-6"></div>

      {/* شريط الإحصائيات السفلي */}
      <div className="flex flex-wrap items-center  gap-8 text-sm text-gray-2">
        <div className="flex items-center gap-2">
          <AlarmClock className="size-5 text-[black]" />
          <span className="pt-px text-[#505050]">
            عضو منذ
            <span className="font-bold ps-1">{data.memberSince}</span>
          </span>
        </div>

        {/* {data.isVerified !== false && (
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="size-5 text-[black]" />
                        <span className="pt-px text-[#505050]">بائع معتمد</span>
                    </div>
                )} */}

        <div className="flex items-center gap-2">
          <Star className="size-5 text-[black]" />
          <span className="pt-px text-[#505050]">
            تقييم البائع
            <span className="font-bold ps-1">{data.rating}</span>
          </span>
        </div>

        {/* <div className="flex items-center gap-2">
                    <ShoppingCart className="size-5 text-[black]" />
                    <span className="pt-px text-[#505050]">عدد مرات التواصل للطلب {data.ordersCount}</span>
                </div> */}
      </div>
    </div>
  );
}
