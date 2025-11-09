// src/components/ui/FormSelect.tsx
"use client";

import { forwardRef, SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface FormSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  options: Array<{ value: string | number; label: string }>;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ 
    label,
    error,
    hint,
    required,
    options,
    placeholder,
    className = "",
    containerClassName = "",
    ...props
  }, ref) => {
    return (
      <div className={cn("space-y-2", containerClassName)}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-brand-black-1 ">
            {label}
            {required && <span className="text-red-500 mr-1">*</span>}
          </label>
        )}

        {/* Select Wrapper */}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "w-full px-4 py-3 border rounded-lg  appearance-none cursor-pointer text-sm",
              "focus:outline-none focus:ring-2 focus:ring-blue-3 focus:border-transparent",
              "transition-all duration-200",
              "bg-white",
              error 
                ? "border-red-500 focus:ring-red-500" 
                : "border-gray-300 focus:ring-blue-3",
              "disabled:bg-gray-100 disabled:cursor-not-allowed",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Chevron Icon */}
          <ChevronDown 
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" 
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

FormSelect.displayName = "FormSelect";