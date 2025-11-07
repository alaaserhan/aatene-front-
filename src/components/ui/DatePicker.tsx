// src/components/ui/DatePicker.tsx
"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'type'> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  containerClassName?: string;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ 
    label,
    error,
    hint,
    required,
    className = "",
    containerClassName = "",
    ...props
  }, ref) => {
    return (
      <div className={cn("space-y-2", containerClassName)}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-brand-black-1 text-right">
            {label}
            {required && <span className="text-red-500 mr-1">*</span>}
          </label>
        )}

        {/* Date Input Wrapper */}
        <div className="relative">
          <input
            ref={ref}
            type="date"
            className={cn(
              "w-full px-4 py-3 pr-12 border rounded-lg text-right",
              "focus:outline-none focus:ring-2 focus:ring-blue-3 focus:border-transparent",
              "transition-all duration-200",
              "cursor-pointer",
              error 
                ? "border-red-500 focus:ring-red-500" 
                : "border-gray-300 focus:ring-blue-3",
              "disabled:bg-gray-100 disabled:cursor-not-allowed",
              // RTL date input styles
              "[&::-webkit-calendar-picker-indicator]:opacity-0",
              "[&::-webkit-calendar-picker-indicator]:absolute",
              "[&::-webkit-calendar-picker-indicator]:w-full",
              "[&::-webkit-calendar-picker-indicator]:h-full",
              "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
              className
            )}
            {...props}
          />

          {/* Calendar Icon */}
          <Calendar 
            className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" 
          />
        </div>

        {/* Hint or Error */}
        {(error || hint) && (
          <div className="text-right min-h-[20px]">
            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}
            {!error && hint && (
              <p className="text-xs text-gray-500">{hint}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";