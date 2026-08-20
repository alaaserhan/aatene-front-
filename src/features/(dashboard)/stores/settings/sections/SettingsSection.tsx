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
import { getStoreSettingsSection } from "../sections-meta";
import { StoreSettingsSectionId } from "../types";

interface SettingsSectionProps {
  value: StoreSettingsSectionId;
  isSaving?: boolean;
  /**
   * Omitted by panels that persist each change on its own (the sections
   * panel), which hides the shared save footer.
   */
  onSave?: () => void;
  children: ReactNode;
}

/**
 * One accordion panel of the store settings page. Each panel owns its own
 * form state and posts to its own endpoint, so saving one never overwrites
 * another.
 */
export function SettingsSection({
  value,
  isSaving = false,
  onSave,
  children,
}: SettingsSectionProps) {
  const { label, description, icon: Icon } = getStoreSettingsSection(value);

  return (
    <AccordionItem
      value={value}
      className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-colors data-[state=open]:border-blue-1"
    >
      <AccordionTrigger
        iconStyle="chevron"
        className="group px-4 py-4 hover:no-underline data-[state=open]:bg-blue-5/60 sm:px-6"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-2 transition-colors group-hover:text-blue-4 group-data-[state=open]:border-blue-1 group-data-[state=open]:bg-white group-data-[state=open]:text-blue-3">
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-blue-7 transition-colors sm:text-lg">
              {label}
            </h2>
            <p className="mt-1 text-xs font-normal text-gray-2">
              {description}
            </p>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="p-0">
        <div className="border-t border-gray-100 px-4 py-6 sm:px-6">
          {children}
        </div>

        {onSave && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/70 px-4 py-4 sm:px-6">
            <p className="text-xs text-gray-2">
              يُحفظ هذا القسم بشكل مستقل عن باقي الأقسام.
            </p>
            <Button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="min-w-40 cursor-pointer rounded-sm py-5 text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
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
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
