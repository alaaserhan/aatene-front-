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

/** "sm" is the compact scale for tight containers such as dialogs. */
type StepperSize = "sm" | "md";

const SIZE_STYLES: Record<StepperSize, {
  wrapper: string;
  circle: string;
  number: string;
  check: string;
  label: string;
  /** Offsets the connector to the vertical center of the circle. */
  connector: string;
}> = {
  md: {
    wrapper: "py-8",
    circle: "w-12 h-12",
    number: "text-lg",
    check: "w-6 h-6",
    label: "mt-3 text-sm",
    connector: "pt-6",
  },
  sm: {
    wrapper: "py-4",
    circle: "w-9 h-9",
    number: "text-sm",
    check: "w-4 h-4",
    label: "mt-2 text-xs",
    connector: "pt-4.5",
  },
};

interface StepperProps {
  currentStep: number;
  steps: StepItem[];
  onStepClick?: (step: number) => void;
  size?: StepperSize;
  className?: string;
  containerClassName?: string;
}

export function Stepper({
  currentStep,
  steps,
  onStepClick,
  size = "md",
  className,
  containerClassName,
}: StepperProps) {
  const sizeStyles = SIZE_STYLES[size];

  return (
    <div className={cn("hidden md:block w-full", sizeStyles.wrapper, className)} dir="rtl">
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
                      "rounded-full flex items-center justify-center border-2 transition-all duration-200",
                      sizeStyles.circle,
                      isCompleted
                        ? "bg-blue-4 border-blue-4"
                        : isActive
                          ? "bg-[#D5DEE7] border-blue-4"
                          : "bg-white border-blue-4 group-hover:border-blue-4/70"
                    )}
                  >
                    {isCompleted ? (
                      <Check className={cn(sizeStyles.check, "text-white")} strokeWidth={3} />
                    ) : (
                      <span className={cn("font-bold text-blue-4", sizeStyles.number)}>
                        {step.number}
                      </span>
                    )}
                  </div>

                  <p
                    className={cn(
                      "font-medium whitespace-nowrap transition-colors",
                      sizeStyles.label,
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
                  <div className={cn("flex-1 flex items-center self-start px-2", sizeStyles.connector)}>
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