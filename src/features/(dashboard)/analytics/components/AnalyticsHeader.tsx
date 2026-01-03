// src/components/dashboard/analytics/AnalyticsHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";

export function AnalyticsHeader() {
  const pathname = usePathname();

  const links = [
    { label: "ملخص المنصة", href: "/admin/analytics/overview" },
    { label: "التقارير", href: "/admin/analytics/reports" },
  ];

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-10 h-[65px]">
      <div className="flex items-center justify-between h-16 px-6">
        <nav className="flex items-center h-full">
          <ul className="flex items-center gap-8 h-full">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href} className="h-full flex items-center">
                  <Link
                    href={link.href}
                    className={cn(
                      "text-sm font-bold h-full flex items-center transition-all px-2 border-b-2",
                      isActive
                        ? "text-[#3A5779] border-[#3A5779]"
                        : "text-gray-500 border-transparent hover:text-[#3A5779]"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}