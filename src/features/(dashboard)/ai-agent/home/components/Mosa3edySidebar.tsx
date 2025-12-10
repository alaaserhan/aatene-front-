// src/features/(dashboard)/home/components/Mosa3edySidebar.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/src/lib/utils";
import { LogOut } from "lucide-react";

interface Mosa3edySidebarProps {
  isCollapsed?: boolean;
  className?: string;
}

export function Mosa3edySidebar({ isCollapsed = false, className }: Mosa3edySidebarProps) {
  const pathname = usePathname();

  // 1. تعديل المصفوفة لتحتوي على المسارات فقط لتسهيل التحكم في الستايل
  const menuItems = [
    {
      iconPath: "/icons/dashboard/homeAi.svg",
      label: "الرئيسية",
      href: "/admin/mosa3edy",
      isActive: pathname === "/admin/mosa3edy" || pathname === "/admin/mosa3edy/"
    },
    {
      iconPath: "/icons/dashboard/databaseAi.svg",
      label: "قاعدة المعرفة",
      href: "/admin/mosa3edy/KnowledgeBase",
      isActive: pathname.includes("KnowledgeBase")
    },
    {
      iconPath: "/icons/dashboard/fileAi.svg",
      label: "التعليمات العامة",
      href: "/admin/mosa3edy/instructions",
      isActive: pathname.includes("instructions")
    },
    {
      iconPath: "/icons/dashboard/chatAi.svg",
      label: "المحادثات",
      href: "/admin/mosa3edy/messages",
      isActive: pathname.includes("messages") // تأكد من المسار الصحيح (messages أو conversations حسب الراوتر)
    },
  ];

  // فلتر اللون الذهبي (#D97706) تقريباً
  // هذا الفلتر يحول اللون الأسود إلى اللون الذهبي
  const activeIconFilter = "brightness-0 saturate-100 invert-[56%] sepia-[68%] saturate-[2087%] hue-rotate-[1deg] brightness-[96%] contrast-[96%]";

  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-lg flex flex-col transition-all duration-300 ease-in-out overflow-hidden h-[calc(100vh-124px)] sticky top-6",
        isCollapsed ? "w-[90px]" : "w-full max-w-[270px]",
        className
      )}
    >
      <div className={cn(
        "flex items-center py-3 pt-4",
        isCollapsed ? "justify-center px-0" : "gap-2 px-8"
      )}>
        <div>
          <img
            src="/icons/dashboard/Mosaady.svg"
            alt="Mosaady"
            className={cn("transition-all object-contain", isCollapsed ? "w-10 h-10" : "w-12")}
          />
        </div>
        {!isCollapsed && (
          <h2 className="text-3xl font-medium ">مُساعدي</h2>
        )}
      </div>

      <div className="w-4/5 mx-auto h-[1px] bg-blue-5 mb-6" />

      <nav className="flex-1 px-4 space-y-4">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className={cn(
              "flex items-center group transition-colors duration-200 rounded-lg",
              isCollapsed ? "justify-center" : "gap-3 px-4",
              "py-3 hover:bg-gray-50",
              // خلفية خفيفة عند التفعيل (اختياري)
              item.isActive && "bg-orange-50/50"
            )}
          >
            {/* 2. عرض الصورة مع تطبيق الفلتر عند التفعيل */}
            <div className="relative flex items-center justify-center">
              <img
                src={item.iconPath}
                alt={item.label}
                className={cn(
                  "transition-all duration-200 object-contain",
                  isCollapsed ? "w-5 h-5" : "w-4 h-4",
                  // تطبيق الفلتر إذا كان نشطاً، وإلا جعلها رمادية قليلاً وتغميقها عند الهوفر
                  item.isActive
                    ? activeIconFilter
                    : ""
                )}
                style={item.isActive ? { filter: "invert(47%) sepia(76%) saturate(1476%) hue-rotate(3deg) brightness(97%) contrast(92%)" } : undefined}
              />
            </div>

            {!isCollapsed && (
              <span
                className={cn(
                  "text-sm font-medium transition-colors",
                  item.isActive
                    ? "text-[#D97706]" // اللون الذهبي للنص
                    : ""
                )}
              >
                {item.label}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* <div className="w-4/5 mx-auto h-[1px] bg-blue-5 mt-auto mb-6" />

      <div className="px-4 pb-8">
        <button
          className={cn(
            "w-full flex items-center group transition-colors duration-200 p-2 ",
            isCollapsed ? "justify-center" : "gap-3 px-4"
          )}
        >
          <img
            src={"/icons/dashboard/logout.svg"}
            className={cn(
              "",
              isCollapsed ? "w-5 h-5" : "w-4 h-4"
            )}
          />
          {!isCollapsed && (
            <span className="text-sm font-medium cursor-pointer">
              تسجيل خروج
            </span>
          )}
        </button>
      </div> */}
    </div>
  );
}