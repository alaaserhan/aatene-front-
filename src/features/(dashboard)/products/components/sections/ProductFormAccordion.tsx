// src/features/(dashboard)/products/components/sections/ProductFormAccordion.tsx
"use client";

import { ReactNode } from "react";
import { AlertCircle, Minus, Plus } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface ProductFormAccordionProps {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onToggle: () => void;
  /** Highlights the collapsed card in red so hidden validation errors stay visible */
  hasError?: boolean;
  errorText?: string;
  children: ReactNode;
}

/** Card-styled accordion used by the single-page product create form */
export function ProductFormAccordion({
  title,
  subtitle,
  isOpen,
  onToggle,
  hasError = false,
  errorText,
  children,
}: ProductFormAccordionProps) {
  const showErrorState = hasError && !isOpen;

  return (
    <div
      className={cn(
        "bg-white rounded-xl border transition-colors",
        showErrorState ? "border-red-500" : "border-gray-200"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-4 p-6 text-right cursor-pointer"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className={cn("text-xl font-semibold", showErrorState && "text-red-500")}>
              {title}
            </h2>
            {showErrorState && <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />}
          </div>
          {(showErrorState && errorText) || subtitle ? (
            <p
              className={cn(
                "mt-1 text-xs",
                showErrorState && errorText ? "text-red-500" : "text-gray-2"
              )}
            >
              {showErrorState && errorText ? errorText : subtitle}
            </p>
          ) : null}
        </div>

        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors",
            showErrorState ? "border-red-500 text-red-500" : "border-blue-4 text-blue-4"
          )}
        >
          {isOpen ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </span>
      </button>

      {isOpen && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}
