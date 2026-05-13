// src/components/ui/Stepper.tsx
"use client";

import React from "react";
import { cn } from "@/src/lib/utils";
import { Check } from "lucide-react";

export interface StepItem {
  number: number;
  label: string;
  completed?: boolean;
}

interface StepperProps {
  currentStep: number;
  steps: StepItem[];
  onStepClick?: (step: number) => void;
  className?: string;
  containerClassName?: string;
}

export function Stepper({
  currentStep,
  steps,
  onStepClick,
  className,
  containerClassName,
}: StepperProps) {
  return (
    <div className={cn("hidden md:block w-full py-8", className)} dir="rtl">
      <div className="container mx-auto px-4">
        <div
          className={cn(
            "flex items-start justify-between mx-auto",
            containerClassName || "max-w-4xl"
          )}
        >
          {steps.map((step, index) => {
            const isCompleted = step.completed || currentStep > step.number;
            const isActive = currentStep === step.number;
            const isClickable = !!onStepClick;

            return (
              <React.Fragment key={step.number}>
                {/* Step Circle & Label */}
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
                      <Check className="w-6 h-6 text-white" strokeWidth={3} />
                    ) : (
                      <span
                        className={cn(
                          "text-lg font-bold",
                          "text-blue-4"
                        )}
                      >
                        {step.number}
                      </span>
                    )}
                  </div>

                  <p
                    className={cn(
                      "mt-3 text-sm font-medium whitespace-nowrap transition-colors",
                      isActive
                        ? "text-blue-4"
                        : isCompleted
                          ? "text-blue-4"
                          : "text-gray-2 group-hover:text-blue-4"
                    )}
                  >
                    {step.label}
                  </p>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 flex items-center self-start pt-6 px-2">
                    <div
                      className={cn(
                        "w-full h-[2px] transition-colors duration-300",
                        isCompleted ? "bg-blue-4" : "bg-gray-200"
                      )}
                    />
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