"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import UserMenu from "./UserMenu";
import MobileNav from "./MobileNav";
import { useAuthStore } from "@/src/stores/auth-store";
import { useLanguage } from "@/src/hooks/use-language";
import { SearchBar } from "./SearchBar";
import { NotificationDropdown } from "@/src/components/shared/NotificationDropdown";
import useFCMToken from "@/src/hooks/use-fcm-token";
import { useSettingsStore } from "@/src/stores/settings-store";

import Image from "next/image";
import NavbarCategoriesMenu from "./NavbarCategoriesMenu";
import { upgradeHttpToHttps, fixMediaUrl } from "@/src/lib/utils";

const Navbar = () => {
  const isAuthenticated = useAuthStore((state) => state.isLoggedIn);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const lang = useLanguage();
  const { settings } = useSettingsStore();
  const [logoBroken, setLogoBroken] = useState(false);

  useEffect(() => {
    setLogoBroken(false);
  }, [settings?.logo_url]);

  return (
    <div className="relative z-[280] w-full shadow-xs bg-white min-h-[72px] flex items-center border-b border-gray-200">
      {/* Mobile Navigation */}
      <MobileNav />

      {/* Desktop Navigation */}
      <div className="hidden min-[1100px]:block container my-2">
        <div className="flex items-center justify-between gap-6">
          <Link href={`/${lang}`} className="flex shrink-0 items-center gap-4 overflow-visible">
            {settings?.logo_url && !logoBroken ? (
              <Image 
                src={upgradeHttpToHttps(fixMediaUrl(settings.logo_url))} 
                className="h-10 w-auto object-contain" 
                alt={settings?.name || "logo"} 
                width={150}
                height={40}
                priority
                onError={() => setLogoBroken(true)}
              />
            ) : (
              <Image 
                src="/black.svg" 
                className="h-10 w-auto object-contain" 
                alt="logo" 
                width={150}
                height={40}
                priority
              />
            )}
          </Link>

          <div className="flex min-w-0 flex-1 items-center gap-4 overflow-visible">
            <NavbarCategoriesMenu variant="desktop" />
            <div className="min-w-0 flex-1 max-w-2xl">
              <Suspense fallback={<div className="h-10 w-full rounded-xl bg-gray-100/90 animate-pulse" aria-hidden />}>
                <SearchBar currentLocale={lang} />
              </Suspense>
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            {isHydrated && isAuthenticated && <NavIcons />}
            <UserMenu />
          </div>
        </div>
      </div>
    </div>
  );
};

import { useTotalUnreadCount } from "@/src/features/(dashboard)/chat/hooks";
import { Badge } from "@/src/components/ui/badge";

const NavIcons = () => {
  const lang = useLanguage();
  const { data: unreadData } = useTotalUnreadCount(undefined, true);
  const unreadCount = unreadData?.unread_conversations_count || 0;

  useFCMToken();

  return (
    <div className="flex items-center gap-4 text-gray-2">
      <NotificationDropdown variant="web" />

      <Link href={`/${lang}/compare`} className="flex items-center">
        <button className="cursor-pointer bg-gray-4 rounded-full p-1.5" aria-label="المقارنات">
          <Image src="/icons/Compare.svg" alt="" width={24} height={24} className="h-6 w-6" />
        </button>
      </Link>
      {/* {userType === "admin" && (
        <Link href={`/${lang}/admin/stores`} className="flex items-center">
          <button className="cursor-pointer bg-gray-4 rounded-full p-1.5" aria-label="المتاجر">
            <Image src="/icons/shop.svg" alt="" width={24} height={24} className="h-6 w-6" />
          </button>
        </Link>
      )} */}
      <Link href={`/${lang}/favourites`} className="flex items-center">
        <button className="cursor-pointer bg-gray-4 rounded-full p-1.5" aria-label="المفضلة">
          <Image src="/icons/heart.svg" alt="Favorites" width={24} height={24} className="h-6 w-6" />
        </button>
      </Link>
      <Link href={`/${lang}/chat`} className="flex items-center">
        <button className="cursor-pointer relative bg-gray-4 rounded-full p-1.5" aria-label="الرسائل">
          <Image src="/icons/chat.svg" alt="Messages" width={24} height={24} className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge
              className="absolute bg-red-600 -top-1 text-white -right-1 h-4 w-4 flex items-center justify-center p-0 pt-[3px] text-[10px]"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </button>
      </Link>
    </div>
  );
};

export default Navbar;