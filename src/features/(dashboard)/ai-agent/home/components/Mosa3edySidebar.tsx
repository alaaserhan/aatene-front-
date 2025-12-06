// src/features/(dashboard)/home/components/Mosa3edySidebar.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/src/lib/utils";
import { Home, Database, FileText, MessageCircle, LogOut } from "lucide-react";

interface Mosa3edySidebarProps {
  isCollapsed?: boolean;
  className?: string;
}

export function Mosa3edySidebar({ isCollapsed = false, className }: Mosa3edySidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      icon: Home,
      label: "الرئيسية",
      href: "/admin/mosa3edy",
      isActive: pathname === "/admin/mosa3edy" || pathname === "/admin/mosa3edy/"
    },
    {
      icon: Database,
      label: "قاعدة المعرفة",
      href: "/admin/mosa3edy/KnowledgeBase",
      isActive: pathname.includes("KnowledgeBase")
    },
    {
      icon: FileText,
      label: "التعليمات العامة",
      href: "/admin/mosa3edy/instructions",
      isActive: pathname.includes("instructions")
    },
    {
      icon: MessageCircle,
      label: "المحادثات",
      href: "/admin/conversations",
      isActive: pathname.includes("conversations")
    },
  ];

  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-lg flex flex-col transition-all duration-300 ease-in-out overflow-hidden  h-[calc(100vh-124px)] ",
        isCollapsed ? "w-[90px]" : "w-full max-w-[270px]",
        className
      )}
    >
      <div className={cn(
        "flex items-center py-8",
        isCollapsed ? "justify-center px-0" : "gap-2 px-8"
      )}>
        <div>
          <img src="/icons/dashboard/Mosaady.svg" alt="Mosaady" className={cn("transition-all", isCollapsed ? "w-10 h-10" : "w-12")} />
        </div>
        {!isCollapsed && (
          <h2 className="text-3xl font-medium">مُساعدي</h2>
        )}
      </div>

      <div className="w-4/5 mx-auto h-[1px] bg-blue-5 mb-6" />

      <nav className="flex-1 px-4 space-y-4">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className={cn(
              "flex items-center group transition-colors duration-200",
              isCollapsed ? "justify-center" : "gap-2 px-4",
              "py-2"
            )}
          >
            <item.icon
              className={cn(
                "transition-colors",
                isCollapsed ? "w-6 h-6" : "w-5 h-5",
                item.isActive
                  ? "text-gold-1"
                  : "group-hover:text-gold-1"
              )}
              strokeWidth={1.5}
            />
            {!isCollapsed && (
              <span
                className={cn(
                  "text-sm font-medium transition-colors",
                  item.isActive ? "text-gold-1" : "group-hover:text-gold-1"
                )}
              >
                {item.label}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="w-4/5 mx-auto h-[1px] bg-blue-5 mt-auto mb-6" />

      <div className="px-4 pb-8">
        <button
          className={cn(
            "w-full flex items-center group transition-colors duration-200",
            isCollapsed ? "justify-center" : "gap-2 px-4"
          )}
        >
          <LogOut
            className={cn(
              "group-hover:text-red-600 transition-colors",
              isCollapsed ? "w-6 h-6" : "w-5 h-5"
            )}
            strokeWidth={1.5}
          />
          {!isCollapsed && (
            <span className="text-sm font-medium group-hover:text-red-600 transition-colors cursor-pointer">
              تسجيل خروج
            </span>
          )}
        </button>
      </div>
    </div>
  );
}