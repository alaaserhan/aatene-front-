"use client";

import Link from "next/link";
import { ArrowUpDown, Heart, MessageCircleMore } from "lucide-react";

import { Logo } from "./Logo";
import UserMenu from "./UserMenu";
import MobileNav from "./MobileNav";
import { SearchBar } from "./SearchBar";
import { NavIconButton } from "./NavIconButton";
import { TryOnNavEntry } from "@/src/features/(web)/virtual-try-on/components/TryOnNavEntry";
import { NotificationDropdown } from "@/src/components/shared/NotificationDropdown";
import { useAuth } from "@/src/auth";
import { useLanguage } from "@/src/hooks/use-language";
import useFCMToken from "@/src/hooks/use-fcm-token";
import { useTotalUnreadCount } from "@/src/features/(dashboard)/chat/hooks";
import { useCompareCount } from "@/src/features/(web)/compares/hooks";

const NavIcons = () => {
  const lang = useLanguage();
  const { data: unreadData } = useTotalUnreadCount(undefined, true);
  const unreadCount = unreadData?.unread_conversations_count || 0;
  const compareCount = useCompareCount();

  useFCMToken();

  return (
    <>
      <NotificationDropdown />
      <Link href={`/${lang}/compare`} aria-label="المقارنات">
        <NavIconButton tabIndex={-1} count={compareCount} badgeTone="neutral">
          <ArrowUpDown className="size-5" />
        </NavIconButton>
      </Link>

      <Link href={`/${lang}/favourites`} aria-label="المفضلة">
        <NavIconButton tabIndex={-1}>
          <Heart className="size-5" />
        </NavIconButton>
      </Link>

      <TryOnNavEntry />

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

      {/* Desktop navigation — 1fr / 2fr / 1fr keeps the search bar centred. The side
          columns never shrink below their content, so on narrow desktops the search
          bar gives up width instead of the action icons sliding under it. */}
      <div className="container my-2 hidden min-[1100px]:block">
        <div className="grid grid-cols-[minmax(max-content,1fr)_minmax(0,2fr)_minmax(max-content,1fr)] items-center gap-4 xl:gap-6">
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
