"use client";

import { Facebook, Twitter, Instagram, Youtube, Ghost, Music2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { type ReactNode } from "react";
import { useSettingsStore } from "@/src/stores/settings-store";
import { useLanguage } from "@/src/hooks/use-language";
import { fixMediaUrl, upgradeHttpToHttps } from "@/src/lib/utils";
import { useIsAuthenticated, useUser } from "@/src/auth";
import { useMounted } from "@/src/hooks/use-mounted";

function AppBadgeLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function AppStoreButtons({
  googlePlayUrl,
  appStoreUrl,
  isMobile = false,
}: {
  googlePlayUrl: string;
  appStoreUrl: string;
  isMobile?: boolean;
}) {
  const itemClassName = isMobile
    ? "relative group block h-12 w-[120px] overflow-hidden rounded-lg"
    : "relative group block h-12 w-full overflow-hidden rounded-lg";

  return (
    <div className={isMobile ? "flex w-full justify-center gap-3 sm:justify-start" : "flex flex-col gap-2"}>
      <AppBadgeLink href={googlePlayUrl} className={itemClassName}>
        <Image
          src="/Group.svg"
          alt="Google Play Store"
          fill={!isMobile}
          width={isMobile ? 120 : undefined}
          height={isMobile ? 40 : undefined}
          className="h-12 w-full object-contain object-right opacity-80 transition-opacity group-hover:opacity-100"
        />
      </AppBadgeLink>

      <AppBadgeLink href={appStoreUrl} className={itemClassName}>
        <Image
          src="/apple.svg"
          alt="Apple App Store"
          fill={!isMobile}
          width={isMobile ? 120 : undefined}
          height={isMobile ? 40 : undefined}
          className="h-12 w-full object-contain object-right opacity-80 transition-opacity group-hover:opacity-100"
        />
      </AppBadgeLink>
    </div>
  );
}

const Footer = () => {
  const lang = useLanguage();
  const { settings } = useSettingsStore();
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const isMerchant = user?.user_type === "merchant";
  const isAdmin = user?.user_type === "admin";
  const mounted = useMounted();
  const localePath = (path: string) => `/${lang}${path === "/" ? "" : path}`;
  const googlePlayUrl = process.env.NEXT_PUBLIC_GOOGLE_PLAY_URL || localePath("/coming-soon");
  const appStoreUrl = process.env.NEXT_PUBLIC_APP_STORE_URL || localePath("/coming-soon");

  const navigationSections = [
    {
      title: "روابط مهمة",
      links: [
        { label: "الرئيسية", href: localePath("/") },
        { label: "منتجات", href: localePath("/search?type=products") },
        { label: "متاجر", href: localePath("/search?type=stores") },
        { label: "خدمات", href: localePath("/search?type=services") },
        { label: "المستخدمين", href: localePath("/search?type=users") },
        { label: "المدونات", href: localePath("/blogs") },
      ],
    },
    {
      title: "عن المنصة",
      links: [
        { label: "من نحن", href: localePath("/about") },
        { label: "قواعد السلامة", href: localePath("/safety-rules") },
        { label: "شروط الاستخدام", href: localePath("/terms-of-use") },
        { label: "سياسة الخصوصية", href: localePath("/privacy-policy") },
      ],
    },
    {
      title: "حسابي",
      links: [
        ...(!mounted || !isAuthenticated ? [
          { label: "تسجيل الدخول", href: localePath("/login") },
          { label: "إنشاء حساب", href: localePath("/signup") },
        ] : []),
        { label: "إعدادات", href: localePath("/settings") },
        ...(!mounted || (!isMerchant && !isAdmin) ? [
          { label: "كن تاجرا", href: localePath("/settings?tab=merchant") },
        ] : []),
      ],
    },
    {
      title: "الدعم والمساعدة",
      links: [
        { label: "بوابة الشكاوى والاقتراحات", href: localePath("/report") },
        { label: "الأسئلة الشائعة", href: localePath("/faq") },
        { label: "اتصل بنا", href: localePath("/contact-us") },
      ],
    },
  ];

  const socialIcons = [];
  if (settings?.facebook) socialIcons.push({ Icon: Facebook, href: settings.facebook, label: "Facebook" });
  if (settings?.x) socialIcons.push({ Icon: Twitter, href: settings.x, label: "X" });
  if (settings?.instagram) socialIcons.push({ Icon: Instagram, href: settings.instagram, label: "Instagram" });
  if (settings?.youtube) socialIcons.push({ Icon: Youtube, href: settings.youtube, label: "YouTube" });
  if (settings?.snapchat) socialIcons.push({ Icon: Ghost, href: settings.snapchat, label: "Snapchat" });
  if (settings?.tiktok) socialIcons.push({ Icon: Music2, href: settings.tiktok, label: "TikTok" });

  return (
    <footer dir="rtl" className="border-t border-gray-200 bg-white text-gray-700 shadow-xs">
      <div className="container my-6 bg-white sm:my-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="col-span-1 lg:col-span-3">
            <div className="flex h-full flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex justify-center sm:justify-start">
                  <Link href={localePath("/")}>
                    {settings?.logo_url ? (
                      <img
                        src={upgradeHttpToHttps(fixMediaUrl(settings.logo_url))}
                        alt={settings?.name || "Aatene"}
                        width={126}
                        height={34}
                        className="h-10 w-auto object-contain"
                      />
                    ) : (
                      <Image
                        src="/black.svg"
                        alt="Aatene"
                        width={120}
                        height={40}
                        className="h-10 w-auto object-contain"
                      />
                    )}
                  </Link>
                </div>
                <p className="mx-auto max-w-xs text-center text-xs leading-relaxed text-[#8B96A5] line-clamp-4 sm:mx-0 sm:text-right sm:text-sm lg:ml-auto lg:mr-0">
                  {settings?.about_website || "أفضل معلومات حول الشركة هنا"}
                </p>
              </div>

              <div className="flex justify-center sm:justify-start">
                <div className="flex gap-2 sm:gap-3">
                  {socialIcons.map(({ Icon, href, label }, i) => (
                    <a
                      key={i}
                      href={href}
                      aria-label={label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-[#8B96A5] p-2 text-white transition-all duration-200 hover:scale-110 hover:bg-gray-2 sm:p-2.5"
                    >
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="block lg:hidden">
            <h4 className="mb-4 text-center text-base font-bold sm:text-right">احصل على التطبيق</h4>
            <AppStoreButtons googlePlayUrl={googlePlayUrl} appStoreUrl={appStoreUrl} isMobile />
          </div>

          <div className="col-span-1 pt-4 sm:col-span-2 lg:col-span-7 lg:pt-0">
            <div className="grid grid-cols-2 gap-6 text-center sm:grid-cols-4 lg:gap-8 lg:text-right">
              {navigationSections.map((section, idx) => (
                <div key={idx} className="space-y-3">
                  <h4 className="mb-2 text-sm font-bold sm:mb-3 sm:text-base">
                    {section.title}
                  </h4>
                  <ul className="sm:space-y-1">
                    {section.links.map((link, i) => (
                      <li key={i}>
                        <Link
                          href={link.href}
                          scroll={true}
                          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                          className="block py-1 text-sm text-[#8B96A5] transition-colors duration-200 hover:text-gray-700"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:col-span-2 lg:block">
            <h4 className="mb-3 text-base font-bold">احصل على التطبيق</h4>
            <AppStoreButtons googlePlayUrl={googlePlayUrl} appStoreUrl={appStoreUrl} />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 bg-[#EFF2F4]">
        <div className="container">
          <div className="flex w-full flex-wrap items-center justify-end gap-4 py-4 text-xs sm:text-sm">
            <div className="mr-auto flex items-center gap-4">
              <span className="whitespace-nowrap opacity-60">© {new Date().getFullYear()} Aatene, Inc.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
