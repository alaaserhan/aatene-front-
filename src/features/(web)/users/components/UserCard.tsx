"use client";

import { useState } from "react";
import { User } from "@/src/features/(web)/search/api";
import { cn } from "@/src/lib/utils";
import { UserPlus, User as UserIcon, UserMinus } from "lucide-react";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import {
  useFollowUserOrStore,
  useUnfollowUserOrStore,
} from "@/src/features/(web)/settings/hooks";
import { CardLink, CARD_ACTION } from "@/src/components/shared/CardLink";
import { useLanguage } from "@/src/hooks/use-language";

interface UserCardProps {
  user: User;
  className?: string;
}

export default function UserCard({ user, className }: UserCardProps) {
  const lang = useLanguage();
  const queryClient = useQueryClient();

  const [avatarFailed, setAvatarFailed] = useState(false);
  const [followOverride, setFollowOverride] = useState<boolean | null>(null);
  const followed = followOverride ?? Boolean(user.is_following);

  const { mutate: follow, isPending: isFollowPending } = useFollowUserOrStore();
  const { mutate: unfollow, isPending: isUnfollowPending } =
    useUnfollowUserOrStore();
  const isPending = isFollowPending || isUnfollowPending;

  const followersCount = Number(user.followers_count || 0);
  const profileLink = `/${lang}/profile/${user.slug || user.id}`;
  const showAvatar = Boolean(user.avatar_url) && !avatarFailed;

  const invalidateUserQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["users", "search"] });
    queryClient.invalidateQueries({ queryKey: ["userProfile"] });
  };

  const handleFollowToggle = () => {
    const payload = { followed_type: "user" as const, followed_id: user.id };
    const onSuccess = () => {
      setFollowOverride(!followed);
      invalidateUserQueries();
    };

    if (followed) {
      unfollow(payload, { onSuccess });
    } else {
      follow(payload, { onSuccess });
    }
  };

  return (
    <article
      className={cn(
        "group relative isolate mx-auto flex w-full max-w-[320px] flex-col items-center rounded-2xl border border-c2-neutral-200 bg-white px-5 pb-5 pt-7 text-center transition-all duration-300 hover:shadow-md",
        className,
      )}
      dir="rtl"
    >
      <div className="relative mb-4 size-32.5 shrink-0 overflow-hidden rounded-full border-[3px] border-white bg-c2-neutral-50 shadow-sm">
        {showAvatar ? (
          <Image
            src={user.avatar_url!}
            alt={user.name || "User"}
            width={130}
            height={130}
            className="h-full w-full object-cover"
            onError={() => setAvatarFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <UserIcon className="size-10 text-c2-neutral-500" />
          </div>
        )}
      </div>

      <h3 className="mb-2 line-clamp-1 w-full px-1 text-lg font-bold text-c2-neutral-900">
        <CardLink href={profileLink} className="after:rounded-2xl">
          {user.name}
        </CardLink>
      </h3>

      <p className="mb-4 text-sm text-c2-neutral-500">{followersCount} متابع</p>

      <button
        type="button"
        disabled={isPending}
        onClick={handleFollowToggle}
        className={cn(
          CARD_ACTION,
          "flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold transition-colors disabled:opacity-50 min-h-12",
          followed
            ? "bg-c2-navy-50 text-c2-primary hover:bg-c2-neutral-200"
            : "bg-c2-primary text-white hover:bg-c2-navy-600",
        )}
      >
        {followed ? <UserMinus className="size-5 shrink-0" /> : <UserPlus className="size-5 shrink-0" />}
        <span className="truncate">
          {isPending
            ? followed
              ? "جاري الإلغاء..."
              : "جاري المتابعة..."
            : followed
              ? "إلغاء المتابعة"
              : "متابعة"}
        </span>
      </button>
    </article>
  );
}
