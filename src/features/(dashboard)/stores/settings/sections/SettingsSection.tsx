// src/features/(dashboard)/stores/settings/sections/SettingsSection.tsx
"use client";

import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { Button } from "@/src/components/ui/button";

interface SettingsSectionProps {
  value: string;
  title: string;
  description: string;
  isSaving?: boolean;
  onSave: () => void;
  children: ReactNode;
}

/**
 * One accordion panel of the store settings page. Each panel owns its own
 * form state and posts to its own endpoint, so saving one never overwrites
 * another.
 */
export function SettingsSection({
  value,
  title,
  description,
  isSaving = false,
  onSave,
  children,
}: SettingsSectionProps) {
  return (
    <AccordionItem
      value={value}
      className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 sm:px-6"
    >
      <AccordionTrigger iconStyle="chevron" className="hover:no-underline py-5">
        <h2 className="text-base sm:text-lg font-semibold">{title}</h2>
        <p className="text-xs text-gray-2 mt-1 font-normal">{description}</p>
      </AccordionTrigger>

      <AccordionContent className="pt-2 pb-6">
        {children}

        <div className="flex justify-end pt-6 mt-6 border-t border-gray-100">
          <Button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="min-w-[160px] py-5 cursor-pointer rounded-sm text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "var(--blue-3)" }}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري الحفظ...
              </span>
            ) : (
              "حفظ التعديلات"
            )}
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
