"use client";

import { Facebook, Twitter, Instagram, Youtube, Ghost, Music2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSettingsStore } from "@/src/stores/settings-store";
import { Label } from "recharts";

const Footer = () => {


  const navigationSections = [
    {
      title: "روابط مهمة",
      links: [
        { label: "الرئيسية", href: `/` },
        { label: "منتجات", href: `/search?type=products` },
        { label: "متاجر", href: `/search?type=stores` },
        { label: "خدمات", href: `/search?type=services` },
        { label: "المستخدمين", href: `/search?type=users` }, { label: "المدونات", href: `/blogs` }
      ]
    },
    {
      title: "عن المنصة",
      links: [
        { label: "من نحن", href: `/about` },
        { label: "قواعد السلامة", href: `/safety-rules` },
        { label: "شروط الاستخدام", href: `/terms-of-use` },
        { label: "سياسة الخصوصية", href: `/privacy-policy` },
      ]
    },
    {
      title: "حسابي",
      links: [
        { label: "تسجيل الدخول", href: `/login` },
        { label: "إنشاء حساب", href: `/signup` },
        { label: "إعدادات", href: `/settings` },
        { label: "كن تاجراً", href: `/stores/add` },
      ]
    },
    {
      title: "الدعم والمساعدة",
      links: [
        { label: "بوابة الشكاوى والاقتراحات", href: `/report` },
        { label: "الأسئلة الشائعة", href: `/faq` },
        { label: "اتصل بنا", href: `/contact-us` },
      ]
    },
  ];

  const { settings } = useSettingsStore();

  const socialIcons = [];
  if (settings?.facebook && settings.facebook !== "") socialIcons.push({ Icon: Facebook, href: settings.facebook, label: "Facebook" });
  if (settings?.x && settings.x !== "") socialIcons.push({ Icon: Twitter, href: settings.x, label: "X" });
  if (settings?.instagram && settings.instagram !== "") socialIcons.push({ Icon: Instagram, href: settings.instagram, label: "Instagram" });
  if (settings?.youtube && settings.youtube !== "") socialIcons.push({ Icon: Youtube, href: settings.youtube, label: "YouTube" });
  if (settings?.snapchat && settings.snapchat !== "") socialIcons.push({ Icon: Ghost, href: settings.snapchat, label: "Snapchat" });
  if (settings?.tiktok && settings.tiktok !== "") socialIcons.push({ Icon: Music2, href: settings.tiktok, label: "TikTok" });

  return (
    <footer dir="rtl" className="bg-white shadow-xs text-gray-700 border-t border-gray-200 ">
      {/* Main Footer Content */}
      <div className="bg-white container my-6 sm:my-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Company Info and Social Links */}
          <div className="col-span-1 sm:col-span-1 lg:col-span-3">
            <div className="flex flex-col h-full justify-between space-y-3">
              {/* Company Info */}
              <div className="space-y-2">
                <div className="flex justify-center sm:justify-start">
                  <Link href={`/`}>
                    {settings?.logo_url ? (
                      <img
                        src={settings.logo_url}
                        alt={settings?.name || "A'atene"}
                        className="h-10 w-auto object-contain"
                      />
                    ) : (
                      <Image
                        src="/black.svg"
                        alt="A'atene"
                        width={120}
                        height={40}
                        className="h-10 w-auto object-contain"
                      />
                    )}
                  </Link>
                </div>
                <p className="text-[#8B96A5] text-xs sm:text-sm leading-relaxed text-center sm:text-right lg:text-right max-w-xs mx-auto sm:mx-0 lg:ml-auto lg:mr-0 line-clamp-4">
                  {settings?.about_website || "أفضل معلومات حول الشركة هنا"}
                </p>
              </div>

              {/* Social Media Icons */}
              <div className="flex justify-center sm:justify-start">
                <div className="flex gap-2 sm:gap-3">
                  {socialIcons.map(({ Icon, href, label }, i) => (
                    <a
                      key={i}
                      href={href}
                      aria-label={label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 sm:p-2.5 bg-[#8B96A5] hover:bg-gray-2 rounded-full text-white transition-all duration-200 hover:scale-110"
                    >
                      <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile App Downloads - Mobile Position */}
          <div className="block lg:hidden col-span-1 sm:col-span-1">
            <h4 className="font-bold text-base mb-4  text-center sm:text-right">احصل على التطبيق</h4>
            <div className="flex md:flex-col flex-row justify-center sm:justify-start gap-3 md:gap-0">
              <a href="#" className="">
                <Image
                  width={120}
                  height={40}
                  src="/Group.svg"
                  alt="Google Play Store"
                  className="h-12"
                />
              </a>
              <a href="#" className=" ">
                <Image
                  src="/apple.svg"
                  alt="Apple App Store"
                  width={120}
                  height={40}
                  className="h-12"
                />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="col-span-1 sm:col-span-2 pt-4 lg:pt-0 lg:col-span-7">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 lg:gap-8 text-center lg:text-right">
              {navigationSections.map((section, idx) => (
                <div key={idx} className="space-y-3">
                  <h4 className="font-bold text-sm sm:text-base  mb-2 sm:mb-3">
                    {section.title}
                  </h4>
                  <ul className="sm:space-y-1">
                    {section.links.map((link, i) => (
                      <li key={i}>
                        <Link
                          href={link.href}
                          className="text-[#8B96A5] text-sm hover:text-gray-700 transition-colors duration-200 block py-1"
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

          {/* Mobile App Downloads - Desktop Position */}
          <div className="hidden lg:block lg:col-span-2">
            <h4 className="font-bold text-base mb-3 ">احصل على التطبيق</h4>
            <div className="flex justify-start flex-col gap-3">
              <a href="#" className="block group">
                <div className="relative h-12 w-full overflow-hidden rounded-lg transition-transform group-hover:scale-105">
                  <Image
                    src="/Group.svg"
                    alt="Google Play Store"
                    fill
                    className="object-contain object-right"
                  />
                </div>
              </a>
              <a href="#" className="block group">
                <div className="relative h-12 w-full overflow-hidden rounded-lg transition-transform group-hover:scale-105">
                  <Image
                    src="/apple.svg"
                    alt="Apple App Store"
                    fill
                    className="object-contain object-right"
                  />
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#EFF2F4] border-t border-gray-200 ">
        <div className="container">
          <div className="flex flex-wrap justify-end items-center gap-4 text-xs sm:text-sm py-4 w-full">


            <div className="flex items-center gap-4 mr-auto">
              <span className="whitespace-nowrap opacity-60">© {new Date().getFullYear()} Aatene, Inc.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;