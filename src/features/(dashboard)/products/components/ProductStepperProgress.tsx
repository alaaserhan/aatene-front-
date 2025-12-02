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
  onStepClick?: (step: number) => void;
}

export function ProductStepperProgress({ currentStep, steps, onStepClick }: ProductStepperProgressProps) {
  return (
    <div className="w-full py-8" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="flex items-start justify-between max-w-4xl mx-auto">
          {steps.map((step, index) => {
            const isCompleted = step.completed || currentStep > step.number;
            const isActive = currentStep === step.number;
            const isClickable = !!onStepClick;

            return (
              <React.Fragment key={step.number}>
                <div 
                  className={cn(
                    "flex flex-col items-center relative z-10",
                    isClickable ? "cursor-pointer group" : ""
                  )}
                  onClick={() => isClickable && onStepClick(step.number)}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-200",
                      isCompleted
                        ? "bg-blue-4 border-blue-4"
                        : isActive
                        ? "bg-[#D5DEE7] border-blue-4"
                        : "bg-white border-blue-4 group-hover:border-blue-4/70"
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
                      <span className={cn(
                        "text-lg font-bold",
                         isActive ? "text-blue-4" : "text-blue-4"
                      )}>
                        {step.number}
                      </span>
                    )}
                  </div>
                  
                  <p className={cn(
                    "mt-3 text-sm font-medium whitespace-nowrap transition-colors",
                    isActive ? "text-blue-4" : "text-gray-500 group-hover:text-blue-4"
                  )}>
                    {step.label}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className="flex-1 flex items-center self-start pt-6 px-2">
                    <div className={cn(
                      "w-full h-[2px] transition-colors duration-300",
                      isCompleted ? "bg-blue-4" : "bg-gray-200"
                    )} />
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