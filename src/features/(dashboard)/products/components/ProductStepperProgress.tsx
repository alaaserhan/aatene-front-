// src/features/(dashboard)/products/components/ProductStepperProgress.tsx
"use client";

import { cn } from "@/src/lib/utils";
import React from "react";

interface Step {
  number: number;
  label: string;
  completed: boolean;
}

interface ProductStepperProgressProps {
  currentStep: number;
  steps: Step[];
}

export function ProductStepperProgress({ currentStep, steps }: ProductStepperProgressProps) {
  return (
    <div className="w-full py-8" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="flex items-start justify-between max-w-4xl mx-auto">
          {steps.map((step, index) => {
            const isCompleted = step.completed || currentStep > step.number;
            const isActive = currentStep === step.number;

            return (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center relative z-10">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-200",
                      isCompleted
                        ? "bg-blue-4 border-blue-4"
                        : isActive
                        ? "bg-[#D5DEE7] border-blue-4"
                        : "bg-white border-blue-4"
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
                      <span className="text-lg font-bold text-blue-4">
                        {step.number}
                      </span>
                    )}
                  </div>
                  
                  <p className="mt-3 text-sm font-medium text-blue-4 whitespace-nowrap">
                    {step.label}
                  </p>
                </div>

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