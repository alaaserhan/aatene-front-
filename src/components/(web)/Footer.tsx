"use client";

import { Carrot } from "lucide-react";
import { Earth } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/src/hooks/use-language";

const Footer = () => {
  const lang = useLanguage();

  const footerStyle = {
    boxShadow: "0px 0px 75px 0px #0d0d0d1a",
  };

  const navigationSections = [
    {
      title: "روابط مهمة",
      links: [
        { label: "الرئيسية", href: `/${lang}/` },
        { label: "منتجات", href: `/${lang}/products` },
        { label: "متاجر", href: `/${lang}/stores` },
        { label: "خدمات", href: `/${lang}/services` }
      ]
    },
    {
      title: "عن المنصة",
      links: [
        { label: "معلومات عنا", href: `/${lang}/about` },
        { label: "المستخدمين", href: `/${lang}/users` },
        { label: "قواعد السلامة", href: `/${lang}/safety-rules` },
        { label: "كن تاجراً", href: `/${lang}/become-seller` },
        { label: "المدونات", href: `/${lang}/blogs` }
      ]
    },
    {
      title: "حسابي",
      links: [
        { label: "تسجيل الدخول", href: `/${lang}/login` },
        { label: "إنشاء حساب", href: `/${lang}/signup` },
        { label: "إعدادات", href: `/${lang}/settings` }
      ]
    },
    {
      title: "الدعم والمساعدة",
      links: [
        { label: "الشكاوي والاقتراحات", href: `/${lang}/complaints` },
        { label: "الأسئلة الشائعة", href: `/${lang}/faq` },
        { label: "اتصل بنا", href: `/${lang}/contact` }
      ]
    },
  ];

  const socialIcons = [
    { Icon: Carrot, href: "#", label: "Facebook" },
    { Icon: Carrot, href: "#", label: "Twitter" },
    { Icon: Carrot, href: "#", label: "LinkedIn" },
    { Icon: Carrot, href: "#", label: "Instagram" },
    { Icon: Carrot, href: "#", label: "YouTube" }
  ];

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
                  <Link href={`/${lang}`}>
                    <img
                      src="/black.svg"
                      alt="A'atene"
                      className="h-10 w-auto object-contain"
                    />
                  </Link>
                </div>
                <p className="text-[#8B96A5] text-xs sm:text-sm leading-relaxed text-center sm:text-right lg:text-right max-w-xs mx-auto sm:mx-0 lg:ml-auto lg:mr-0">
                  أفضل معلومات حول الشركة gies هنا ولكن الآن lorem ipsum
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
            <div className="flex flex-row gap-3 max-w-xs mx-auto sm:max-w-none sm:mx-0">
              <a href="#" className="block group">
                <div className="relative h-12 sm:h-14 w-full sm:w-32 overflow-hidden rounded-lg transition-transform group-hover:scale-105">
                  <img
                    src="/Group.svg"
                    alt="Google Play Store"
                    className="w-full h-full object-contain"
                  />
                </div>
              </a>
              <a href="#" className="block group">
                <div className="relative h-12 sm:h-14 w-full sm:w-32 overflow-hidden rounded-lg transition-transform group-hover:scale-105">
                  <img
                    src="/apple.svg"
                    alt="Apple App Store"
                    className="w-full h-full object-contain"
                  />
                </div>
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
                          className="text-[#8B96A5] text-xs sm:text-sm hover:text-gray-700 transition-colors duration-200 block py-1"
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
                  <img
                    src="/Group.svg"
                    alt="Google Play Store"
                    className="h-full"
                  />
                </div>
              </a>
              <a href="#" className="block group">
                <div className="relative h-12 w-full overflow-hidden rounded-lg transition-transform group-hover:scale-105">
                  <img
                    src="/apple.svg"
                    alt="Apple App Store"
                    className="h-full"
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
              <span className="whitespace-nowrap opacity-60">© 2025 Aatene, Inc.</span>
              <Link href={`/${lang}/terms-of-use`} className="hover:text-blue-4 transition-colors whitespace-nowrap">
                شروط الاستخدام
              </Link>
              <Link href={`/${lang}/privacy-policy`} className="hover:text-blue-4 transition-colors whitespace-nowrap">
                خصوصية
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;