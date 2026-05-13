// src/features/(dashboard)/stores/components/StepperProgress.tsx
"use client";

import { cn } from "@/src/lib/utils";
import React from "react";

interface Step {
  number: number;
  label: string;
  completed: boolean;
}

interface StepperProgressProps {
  currentStep: number;
  steps: Step[];
}

export function StepperProgress({ currentStep, steps }: StepperProgressProps) {
  return (
    <div className="hidden md:block w-full py-8" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="flex  items-start  justify-between max-w-6xl mx-auto">
          {steps.map((step, index) => {
            // تحديد حالة الخطوة
            const isCompleted = step.completed || currentStep > step.number;
            const isActive = currentStep === step.number;

            return (
              <React.Fragment key={step.number}>
                {/* Step Item */}
                <div className="flex flex-col items-center relative z-10">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-200",
                      // الألوان بناءً على الحالة
                      isCompleted
                        ? "bg-blue-4 border-blue-4" // مكتمل: خلفية وحدود كحلية
                        : isActive
                          ? "bg-[#D5DEE7] border-blue-4" // حالي: خلفية سماوي فاتح وحدود كحلية
                          : "bg-white border-blue-4" // قادم: خلفية بيضاء وحدود كحلية
                    )}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <span
                        className={cn(
                          "text-lg font-bold",
                          // الرقم دائماً كحلي إلا إذا كانت الخطوة مكتملة (يختفي الرقم ويظهر الصح)
                          "text-blue-4"
                        )}
                      >
                        {step.number}
                      </span>
                    )}
                  </div>

                  {/* Label */}
                  <p className="mt-3 text-sm font-medium text-blue-4 whitespace-nowrap">
                    {step.label}
                  </p>
                </div>

                {/* Connector Line (Show for all except the last item) */}
                {index < steps.length - 1 && (
                  <div className="flex-1 flex items-center self-start pt-6 px-2">
                    <div className="w-full h-[2px] bg-blue-4" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}