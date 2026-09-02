"use client";

import { Suspense, useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ChevronLeft, Menu, X, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchBar } from "./SearchBar";
import UserMenu from "./UserMenu";
import { useAuth } from "@/src/auth";
import { useLanguage } from "@/src/hooks/use-language";
import { useMyNotificationStats } from "@/src/features/(web)/notifications/hooks";
import { Badge } from "@/src/components/ui/badge";
import { useSettingsStore } from "@/src/stores/settings-store";

import { upgradeHttpToHttps, fixMediaUrl } from "@/src/lib/utils";

const menuVariants: Variants = {
  closed: {
    x: "100%",
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  open: {
    x: "0%",
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

const overlayVariants: Variants = {
  closed: { opacity: 0 },
  open: { opacity: 1 },
};

const searchVariants: Variants = {
  closed: {
    y: "-100%",
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  open: {
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

export default function MobileNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [failedMobileLogoUrl, setFailedMobileLogoUrl] = useState<string | null>(null);

  const lang = useLanguage();
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  const navLinkClass = (active: boolean) =>
    `group flex items-center justify-between gap-4 p-3 rounded-xl transition-all duration-200 ${
      active ? "text-primary bg-primary/5" : "text-gray-700 hover:text-primary hover:bg-primary/5"
    }`;
  const navIconClass = (active: boolean) =>
    `w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200 ${
      active ? "bg-blue-100" : "bg-gray-4 group-hover:bg-blue-100"
    }`;
  const navChevronClass = (active: boolean) =>
    `transition-opacity duration-200 ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`;

  const { isLoggedIn, user } = useAuth();

  const { data: statsData } = useMyNotificationStats(!!user);
  const unreadCount = statsData?.unseen || 0;
  const { settings } = useSettingsStore();
  const mobileLogoUrl = settings?.logo_url
    ? upgradeHttpToHttps(fixMediaUrl(settings.logo_url))
    : null;
  const showRemoteMobileLogo = Boolean(mobileLogoUrl && failedMobileLogoUrl !== mobileLogoUrl);

  useEffect(() => {
    if (mobileMenuOpen || mobileSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen, mobileSearchOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (mobileSearchOpen) setMobileSearchOpen(false);
  };

  const toggleMobileSearch = () => {
    setMobileSearchOpen(!mobileSearchOpen);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  return (
    <div className="relative z-[280] min-[1100px]:hidden w-full">
      <div className="flex items-center justify-between px-4 py-3 w-full gap-2">
        <div className="flex shrink-0 items-center">
          <button
            className="p-2 hover:bg-gray-100 rounded-md cursor-pointer text-c2-primary"
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
          >
            <Menu size={24} />
          </button>
        </div>

        <Link href={`/${lang}`} className="flex min-w-0 max-w-[45%] shrink-0 justify-center overflow-hidden">
          {showRemoteMobileLogo && mobileLogoUrl ? (
            <img
              src={mobileLogoUrl}
              className="mx-auto h-8 max-h-8 max-w-full object-contain"
              alt={settings?.name || "logo"}
              width={150}
              height={32}
              style={{ width: "auto", height: "2rem" }}
              onError={() => setFailedMobileLogoUrl(mobileLogoUrl)}
            />
          ) : (
            <img src="/black.svg" className="mx-auto h-8 max-w-full object-contain" alt="logo" width={120} height={32} style={{ width: "auto", height: "2rem" }} />
          )}
        </Link>

        <div className="flex shrink-0 items-center gap-0.5">

          <button
            className="p-2 hover:bg-gray-100 rounded-md cursor-pointer text-c2-primary"
            onClick={toggleMobileSearch}
            aria-label={mobileSearchOpen ? "إغلاق البحث" : "فتح البحث"}
          >
            <Search size={24} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-linear-to-br from-black/60 to-black/40 backdrop-blur-sm z-40"
              variants={overlayVariants}
              initial="closed"
              animate="open"
              exit="closed"
              onClick={toggleMobileMenu}
            />
            <motion.div
              className="fixed inset-y-0 right-0 w-4/5 max-w-sm bg-white z-50 shadow-2xl"
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 bg-linear-to-r from-primary/5 to-primary/10 border-b border-gray-100">
                  <Link
                    href={`/${lang}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:scale-105 transition-transform duration-200"
                  >
                    <img src="/black.svg" className="h-8 w-auto" alt="logo" />
                  </Link>
                  <button
                    onClick={toggleMobileMenu}
                    aria-label="إغلاق القائمة"
                    className="p-2 hover:bg-white/50 rounded-full transition-all duration-200 hover:rotate-90 cursor-pointer"
                  >
                    <X size={24} className="text-gray-2" />
                  </button>
                </div>

                {/* Content Section */}
                <div className="flex-1 overflow-y-auto">
                  <div className="flex flex-col justify-between h-full">
                    {/* Navigation Links */}
                    <motion.div
                      className="px-4 py-4 space-y-1"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="mb-4">
                        <h3 className="font-medium text-gray-2 uppercase tracking-wider mb-3">التصفح</h3>
                      </div>

                      {isLoggedIn && (
                        <>
                          <Link
                            href={`/${lang}/chat`}
                            className={navLinkClass(isActive(`/${lang}/chat`))}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="flex items-center gap-4">
                              <div className={navIconClass(isActive(`/${lang}/chat`))}>
                                <img src="/icons/chat.svg" alt="Messages" className="h-7 w-7" />
                              </div>
                              <span className="font-medium">الرسائل</span>
                            </div>
                            <div className={navChevronClass(isActive(`/${lang}/chat`))}>
                              <ChevronLeft size={16} className="text-gray-2" />
                            </div>
                          </Link>

                          <Link
                            href={`/${lang}/favourites`}
                            className={navLinkClass(isActive(`/${lang}/favourites`))}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="flex items-center gap-4">
                              <div className={navIconClass(isActive(`/${lang}/favourites`))}>
                                <img src="/icons/heart.svg" alt="Favorites" className="h-7 w-7" />
                              </div>
                              <span className="font-medium">المفضلة</span>
                            </div>
                            <div className={navChevronClass(isActive(`/${lang}/favourites`))}>
                              <ChevronLeft size={16} className="text-gray-2" />
                            </div>
                          </Link>

                          <Link
                            href={`/${lang}/compare`}
                            className={navLinkClass(isActive(`/${lang}/compare`))}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="flex items-center gap-4">
                              <div className={navIconClass(isActive(`/${lang}/compare`))}>
                                <img src="/icons/Compare.svg" alt="Compare" className="h-7 w-7" />
                              </div>
                              <span className="font-medium">المقارنات</span>
                            </div>
                            <div className={navChevronClass(isActive(`/${lang}/compare`))}>
                              <ChevronLeft size={16} className="text-gray-2" />
                            </div>
                          </Link>

                          <Link
                            href={`/${lang}/notifications`}
                            className={navLinkClass(isActive(`/${lang}/notifications`))}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`relative ${navIconClass(isActive(`/${lang}/notifications`))}`}>
                                <img src="/icons/Notification.svg" alt="Notifications" className="h-7 w-7" />
                                {unreadCount > 0 && (
                                  <Badge
                                    className="absolute bg-red-600 font-baseline-fix -top-1 text-white -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
                                    variant="destructive"
                                  >
                                    {unreadCount}
                                  </Badge>
                                )}
                              </div>
                              <span className="font-medium">الاشعارات</span>
                            </div>
                            <div className={navChevronClass(isActive(`/${lang}/notifications`))}>
                              <ChevronLeft size={16} className="text-gray-2" />
                            </div>
                          </Link>
                        </>
                      )}
                    </motion.div>

                    {/* User Menu Section */}
                    <div className="px-4 pb-4">
                      <UserMenu isMobile={true} onClose={() => setMobileMenuOpen(false)} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {mobileSearchOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              variants={overlayVariants}
              initial="closed"
              animate="open"
              exit="closed"
              onClick={toggleMobileSearch}
            />
            <motion.div
              className="fixed inset-x-0 top-0 bg-white z-50"
              variants={searchVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium">البحث</h2>
                  <button onClick={toggleMobileSearch} aria-label="إغلاق البحث" className="cursor-pointer">
                    <X size={24} />
                  </button>
                </div>

                {/* Search Component */}
                <div className="mt-2">
                  <Suspense fallback={<div className="h-11 w-full rounded-xl bg-gray-100 animate-pulse" aria-hidden />}>
                    <SearchBar
                      variant="mobile"
                      onSearch={() => setMobileSearchOpen(false)}
                    />
                  </Suspense>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
