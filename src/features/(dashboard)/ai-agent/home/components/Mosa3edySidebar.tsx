// src/features/(dashboard)/home/components/Mosa3edySidebar.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/src/lib/utils";

interface Mosa3edySidebarProps {
  isCollapsed?: boolean;
  className?: string;
}

export function Mosa3edySidebar({ isCollapsed = false, className }: Mosa3edySidebarProps) {
  const pathname = usePathname();

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
      label: "التعليمات",
      href: "/admin/mosa3edy/instructions",
      isActive: pathname.includes("instructions")
    },
    {
      iconPath: "/icons/dashboard/chatAi.svg",
      label: "المحادثات",
      href: "/admin/mosa3edy/messages",
      isActive: pathname.includes("messages")
    },
  ];

  const activeIconFilter = "brightness-0 saturate-100 invert-[56%] sepia-[68%] saturate-[2087%] hue-rotate-[1deg] brightness-[96%] contrast-[96%]";

  return (
    <>
      {/* Mobile: Horizontal navigation bar */}
      <div className="lg:hidden w-full bg-white border border-gray-200 rounded-xl p-3 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <div className="flex items-center gap-2 pe-3 border-e border-gray-200 shrink-0">
            <img
              src="/icons/dashboard/Mosaady.svg"
              alt="Mosaady"
              className="w-8 h-8 object-contain"
            />
            <span className="text-lg font-medium">مُساعدي</span>
          </div>

          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                item.isActive
                  ? "bg-blue-5 text-blue-4"
                  : "text-gray-2 hover:bg-gray-50"
              )}
            >
              <img
                src={item.iconPath}
                alt={item.label}
                className={cn(
                  "w-4 h-4 object-contain transition-all",
                  item.isActive ? activeIconFilter : ""
                )}
                style={item.isActive ? { filter: "invert(39%) sepia(21%) saturate(996%) hue-rotate(174deg) brightness(92%) contrast(87%)" } : undefined}
              />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop: Vertical sidebar */}
      <div
        className={cn(
          "hidden lg:flex bg-white border border-gray-200 rounded-lg flex-col transition-all duration-300 ease-in-out overflow-hidden h-[calc(100vh-124px)] sticky top-6",
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
            <h2 className="text-2xl font-medium ">مُساعدي</h2>
          )}
        </div>

        <div className="w-4/5 mx-auto h-px bg-blue-5 mb-6" />

        <nav className="flex-1 px-4 space-y-4">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex items-center group transition-colors duration-200 rounded-lg",
                isCollapsed ? "justify-center" : "gap-3 px-4",
                "py-3 hover:bg-gray-50",
                item.isActive && "bg-blue-5"
              )}
            >
              <div className="relative flex items-center justify-center">
                <img
                  src={item.iconPath}
                  alt={item.label}
                  className={cn(
                    "transition-all duration-200 object-contain",
                    isCollapsed ? "w-5 h-5" : "w-4 h-4",
                    item.isActive
                      ? activeIconFilter
                      : ""
                  )}
                  style={item.isActive ? { filter: "invert(39%) sepia(21%) saturate(996%) hue-rotate(174deg) brightness(92%) contrast(87%)" } : undefined}
                />
              </div>

              {!isCollapsed && (
                <span
                  className={cn(
                    "text-sm font-medium transition-colors",
                    item.isActive
                      ? "text-blue-4"
                      : ""
                  )}
                >
                  {item.label}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}