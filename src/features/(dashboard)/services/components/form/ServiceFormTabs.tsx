// src/features/(dashboard)/services/components/form/ServiceFormTabs.tsx
"use client";

import { Check } from "lucide-react";
import { cn } from "@/src/lib/utils";

export type ServiceStep = 1 | 2;

interface TabDef {
  step: ServiceStep;
  title: string;
  subtitle: string;
  optional?: boolean;
}

const TABS: TabDef[] = [
  { step: 1, title: "المعلومات الأساسية", subtitle: "العنوان، الصورة، الفئة، القسم، السعر والوصف" },
  {
    step: 2,
    title: "المعلومات المتقدمة",
    subtitle: "المدة، التخصصات، الكلمات المفتاحية، التطويرات والأسئلة",
    optional: true,
  },
];

interface ServiceFormTabsProps {
  activeStep: ServiceStep;
  onStepChange: (step: ServiceStep) => void;
}

/** Two rectangular tabs for navigating between the form's two steps */
export function ServiceFormTabs({ activeStep, onStepChange }: ServiceFormTabsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" dir="rtl">
      {TABS.map((tab) => {
        const isActive = activeStep === tab.step;
        const isCompleted = activeStep > tab.step;

        return (
          <button
            key={tab.step}
            type="button"
            onClick={() => onStepChange(tab.step)}
            className={cn(
              "flex items-center gap-4 rounded-xl border p-4 text-right transition-all",
              isActive
                ? "border-blue-4 bg-[#EEF3FB] shadow-sm"
                : "border-gray-200 bg-white hover:border-blue-4/50"
            )}
          >
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
                isCompleted
                  ? "border-blue-4 bg-blue-4 text-white"
                  : isActive
                    ? "border-blue-4 bg-white text-blue-4"
                    : "border-gray-300 bg-white text-gray-2"
              )}
            >
              {isCompleted ? <Check className="h-5 w-5" strokeWidth={3} /> : tab.step}
            </span>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className={cn("text-sm font-bold", isActive || isCompleted ? "text-blue-4" : "text-gray-700")}>
                  {tab.title}
                </p>
                {tab.optional && (
                  <span className="shrink-0 rounded-full border border-gray-200 bg-blue-6 text-blue-3 px-2 py-0.5 text-[10px] font-medium mb-0.5 pb-0.25">
                    اختياري
                  </span>
                )}
              </div>
              <p className="mt-0.5 truncate text-xs text-gray-2">{tab.subtitle}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
