"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { AlarmClock, Flag, MapPin, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { ReportAbuseModal } from "@/src/features/(web)/reports/components/ReportAbuseModal";
import {
  useFollowUserOrStore,
  useUnfollowUserOrStore,
} from "@/src/features/(web)/settings/hooks";
import { useLanguage } from "@/src/hooks/use-language";
import { useAuthStore } from "@/src/stores/auth-store";

/** Minimal store shape this card needs, so any feature's `Store` type can be passed in. */
export interface StoreInfoCardStore {
  id: number;
  slug: string;
  name: string;
  logo_url?: string | null;
  city?: { name: string } | null;
  review_rate?: string | null;
  created_at?: string | null;
  am_i_following?: boolean;
}

interface StoreInfoCardProps {
  store: StoreInfoCardStore;
  /** Hides the report action, e.g. when the viewer owns the store. */
  hideReport?: boolean;
  className?: string;
}

const DEFAULT_LOCATION = "فلسطين";

function formatMemberSince(createdAt?: string | null) {
  if (!createdAt) return "";
  return format(new Date(createdAt), "dd-MM-yyyy", { locale: ar });
}

/**
 * Reusable store info card: store identity, follow toggle, report abuse and store stats.
 */
export default function StoreInfoCard({
  store,
  hideReport,
  className,
}: StoreInfoCardProps) {
  const lang = useLanguage();
  const { user } = useAuthStore();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(store.am_i_following ?? false);

  // Re-sync the optimistic follow state when the store prop refetches.
  const [syncedFollowing, setSyncedFollowing] = useState(
    store.am_i_following ?? false,
  );
  if (syncedFollowing !== (store.am_i_following ?? false)) {
    setSyncedFollowing(store.am_i_following ?? false);
    setIsFollowing(store.am_i_following ?? false);
  }

  const { mutate: follow, isPending: isFollowPending } = useFollowUserOrStore();
  const { mutate: unfollow, isPending: isUnfollowPending } =
    useUnfollowUserOrStore();
  const isFollowLoading = isFollowPending || isUnfollowPending;

  const storeHref = `/${lang}/store/${store.slug}`;
  const location = store.city?.name || DEFAULT_LOCATION;
  const memberSince = formatMemberSince(store.created_at);

  const handleFollowToggle = () => {
    if (!user) {
      toast.error("يجب عليك تسجيل الدخول أولاً");
      return;
    }

    const payload = { followed_id: store.id, followed_type: "store" as const };

    if (isFollowing) {
      unfollow(payload, { onSuccess: () => setIsFollowing(false) });
    } else {
      follow(payload, { onSuccess: () => setIsFollowing(true) });
    }
  };

  return (
    <div className={cn("white-card", className)}>
      {/* Store identity + actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          <Link href={storeHref}>
            <Avatar className="size-12">
              <AvatarImage
                src={store.logo_url || ""}
                className="object-cover"
              />
              <AvatarFallback>{store.name?.[0]}</AvatarFallback>
            </Avatar>
          </Link>

          <div>
            <Link
              href={storeHref}
              className="text-base font-medium text-c2-navy-950 hover:text-c2-primary transition-colors"
            >
              {store.name}
            </Link>
            <div className="flex items-center gap-1 text-sm text-c2-neutral-600">
              <MapPin className="size-4 text-c2-primary" />
              <span className="text-c2-primary font-normal">{location}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleFollowToggle}
            disabled={isFollowLoading}
            className={cn(
              "rounded-full gap-1 px-4!",
              isFollowing
                ? "bg-white hover:bg-c2-neutral-200 text-c2-primary border border-[#D1D1D6]"
                : "bg-c2-primary hover:bg-c2-navy-600 text-white",
            )}
          >
            {!isFollowing && <Plus className="size-4" />}
            <span>{isFollowing ? "إلغاء المتابعة" : "متابعة"}</span>
          </Button>

          {!hideReport && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setIsReportModalOpen(true)}
              className="rounded-full px-4!"
            >
              <Flag className="size-4" />
              <span>بلغ عن إساءة</span>
            </Button>
          )}
        </div>
      </div>

      <div className="border-t border-[#DEE2E7] my-3" />

      {/* Store stats */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-[#505050]">
        {memberSince && (
          <div className="flex items-center gap-2">
            <AlarmClock className="size-4 text-[#2E2E2F]" />
            <div className="flex items-center gap-1">
              <span>عضو منذ</span>
              <span className="font-bold pt-px">{memberSince}</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Star className="size-4 text-[#2E2E2F]" />
          <div className="flex items-center gap-1">
            <span>تقييم البائع</span>
            <span className="font-bold pt-px">{store.review_rate || "0"}</span>
          </div>
        </div>
      </div>

      <ReportAbuseModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        type="store"
        id={store.id}
      />
    </div>
  );
}
