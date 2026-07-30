// src/components/ui/Breadcrumb.tsx
"use client";

import { cn } from "@/src/lib/utils";
import Link from "next/link";
import { Fragment } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  withContainer?: boolean;
}

export function Breadcrumb({ items, className = "", withContainer = false }: BreadcrumbProps) {
  return (
    <nav
      className={cn(
        `flex items-center gap-1 py-2`,
        {
          "p-4 lg:p-6 mt-7 mb-6 bg-white shadow rounded-2xl": withContainer,
        },
        className,
      )}
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <Fragment key={index}>
            {item.href && !isLast ? (
              <Link href={item.href} className="text-gray-6 text-sm hover:text-blue-3 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-gray-2 text-sm font-medium" : "text-gray-6 text-sm"}>{item.label}</span>
            )}

            {!isLast && <span className="text-gray-2">/</span>}
          </Fragment>
        );
      })}
    </nav>
  );
}
