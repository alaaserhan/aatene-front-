"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpDown, Heart, MessageCircleMore } from "lucide-react";

import UserMenu from "./UserMenu";
import MobileNav from "./MobileNav";
import { SearchBar } from "./SearchBar";
import { NavIconButton } from "./NavIconButton";
import { NotificationDropdown } from "@/src/components/shared/NotificationDropdown";
import { useAuth } from "@/src/auth";
import { useLanguage } from "@/src/hooks/use-language";
import { useSettingsStore } from "@/src/stores/settings-store";
import useFCMToken from "@/src/hooks/use-fcm-token";
import { useTotalUnreadCount } from "@/src/features/(dashboard)/chat/hooks";
import { upgradeHttpToHttps, fixMediaUrl } from "@/src/lib/utils";

const Logo = () => {
  const lang = useLanguage();
  const { settings } = useSettingsStore();
  const [failedLogoUrl, setFailedLogoUrl] = useState<string | null>(null);

  const logoUrl = settings?.logo_url ? upgradeHttpToHttps(fixMediaUrl(settings.logo_url)) : null;
  const useRemoteLogo = !!logoUrl && failedLogoUrl !== logoUrl;

  return (
    <Link href={`/${lang}`} className="flex shrink-0 items-center">
      <Image
        src={useRemoteLogo ? logoUrl : "/black.svg"}
        className="h-10 w-auto object-contain"
        alt={(useRemoteLogo && settings?.name) || "logo"}
        width={150}
        height={40}
        priority
        onError={useRemoteLogo ? () => setFailedLogoUrl(logoUrl) : undefined}
      />
    </Link>
  );
};

const NavIcons = () => {
  const lang = useLanguage();
  const { data: unreadData } = useTotalUnreadCount(undefined, true);
  const unreadCount = unreadData?.unread_conversations_count || 0;

  useFCMToken();

  return (
    <>
      <NotificationDropdown variant="web" />

      <Link href={`/${lang}/compare`} aria-label="المقارنات">
        <NavIconButton tabIndex={-1}>
          <ArrowUpDown className="size-5" />
        </NavIconButton>
      </Link>

      <Link href={`/${lang}/favourites`} aria-label="المفضلة">
        <NavIconButton tabIndex={-1}>
          <Heart className="size-5" />
        </NavIconButton>
      </Link>

      <Link href={`/${lang}/chat`} aria-label="الرسائل">
        <NavIconButton tabIndex={-1} count={unreadCount}>
          <MessageCircleMore className="size-5" />
        </NavIconButton>
      </Link>
    </>
  );
};

const Navbar = () => {
  const { isLoggedIn } = useAuth();

  return (
    <div className="sticky top-0 z-280 flex min-h-18 w-full items-center">
      <div className="absolute inset-0 z-[-1] border-b border-c2-neutral-300-a10 bg-white/95 shadow-sm backdrop-blur-sm" />

      {/* Mobile navigation */}
      <MobileNav />

      {/* Desktop navigation — 1fr / 2fr / 1fr keeps the search bar centred in the
          viewport regardless of how wide the logo or the action icons get. */}
      <div className="container my-2 hidden min-[1100px]:block">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] items-center gap-6">
          <div className="flex justify-start">
            <Logo />
          </div>

          <div className="min-w-0">
            <SearchBar />
          </div>

          <div className="flex items-center justify-end gap-3">
            {isLoggedIn && <NavIcons />}
            <UserMenu />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
