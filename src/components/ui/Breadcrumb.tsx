// src/components/ui/Breadcrumb.tsx
"use client";

import { cn } from "@/src/lib/utils";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  /** Wraps the trail in the standard white card used on dashboard pages. */
  withContainer?: boolean;
}

const ITEM_CLASS = "text-base text-c2-neutral-500";
const CURRENT_CLASS = "text-base font-normal text-c2-neutral-700";

export function Breadcrumb({
  items,
  className,
  withContainer = false,
}: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "ps-4 lg:ps-8 mb-6",
        withContainer && "p-4 lg:p-6 mt-8 mb-6 bg-white shadow rounded-2xl",
        className,
      )}
    >
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={`${item.href ?? ""}-${item.label}`}
              className="flex items-center gap-1"
            >
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={cn(
                    ITEM_CLASS,
                    "hover:text-blue-3 transition-colors",
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? CURRENT_CLASS : ITEM_CLASS}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}

              {!isLast && (
                /* Points along the reading direction: left in RTL, right in LTR. */
                <ChevronLeft
                  className="w-5 h-5 shrink-0 pb-0.5 text-c2-neutral-500 ltr:rotate-180"
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
