"use client";

import Link from "next/link";
import UserMenu from "./UserMenu";
import MobileNav from "./MobileNav";
import { useAuthStore } from "@/src/stores/auth-store";
import { useLanguage } from "@/src/hooks/use-language";
import { SearchBar } from "./SearchBar";

const Navbar = () => {
  const isAuthenticated = useAuthStore((state) => state.isLoggedIn);
  const lang = useLanguage();

  return (
    <div className="w-full shadow-xs bg-white min-h-[72px] flex items-center border-b border-gray-200">
      {/* Mobile Navigation */}
      <MobileNav />

      {/* Desktop Navigation */}
      <div className="hidden min-[1100px]:block container my-2">
        <div className="flex items-center justify-between gap-6">
          <Link href={`/${lang}`} className="flex items-center gap-4">
            <img src="/black.svg" className="h-10" alt="logo" />
          </Link>

          <div className="flex-1 max-w-2xl">
            <SearchBar currentLocale={lang} />
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            {isAuthenticated && <NavIcons />}
            <UserMenu />
          </div>
        </div>
      </div>
    </div>
  );
};

const NavIcons = () => {
  const user = useAuthStore((state) => state.user);
  const lang = useLanguage();
  const userType = user?.user_type;

  return (
    <div className="flex items-center gap-4 text-gray-2">
      <Link href={`/${lang}/notifications`} className="flex items-center">
        <button className="cursor-pointer bg-gray-4 rounded-full p-1.5" aria-label="الإشعارات">
          <img src="/icons/Notification.svg" alt="" className="h-6 w-6" />
        </button>
      </Link>
      <Link href={`/${lang}/compare`} className="flex items-center">
        <button className="cursor-pointer bg-gray-4 rounded-full p-1.5" aria-label="المقارنات">
          <img src="/icons/Compare.svg" alt="" className="h-6 w-6" />
        </button>
      </Link>
      {userType === "admin" && (
        <Link href={`/${lang}/admin/stores`} className="flex items-center">
          <button className="cursor-pointer bg-gray-4 rounded-full p-1.5" aria-label="المتاجر">
            <img src="/icons/shop.svg" alt="" className="h-6 w-6" />
          </button>
        </Link>
      )}
      <Link href={`/${lang}/favourites`} className="flex items-center">
        <button className="cursor-pointer bg-gray-4 rounded-full p-1.5" aria-label="المفضلة">
          <img src="/icons/heart.svg" alt="Favorites" className="h-6 w-6" />
        </button>
      </Link>
      <Link href={`/${lang}/chat`} className="flex items-center">
        <button className="cursor-pointer bg-gray-4 rounded-full p-1.5" aria-label="الرسائل">
          <img src="/icons/chat.svg" alt="Messages" className="h-6 w-6" />
        </button>
      </Link>
    </div>
  );
};

export default Navbar;