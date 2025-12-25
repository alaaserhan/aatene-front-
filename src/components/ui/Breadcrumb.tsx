// src/components/ui/Breadcrumb.tsx
"use client";

import Link from "next/link";
import { Fragment } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center gap-1 py-2  ${className}`} aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <Fragment key={index}>
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-[#8E8E8E] text-sm hover:text-blue-3 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={isLast ? "text-gray-2 font-medium" : "text-[#8E8E8E]"}
              >
                {item.label}
              </span>
            )}
            
            {!isLast && (
              <span className="text-gray-400">/</span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}