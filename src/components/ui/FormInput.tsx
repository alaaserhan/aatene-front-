// src/components/ui/FormInput.tsx
"use client";

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

interface BaseInputProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  maxLength?: number;
  showCounter?: boolean;
  className?: string;
  containerClassName?: string;
}

type InputProps = BaseInputProps & 
  Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
    multiline?: false;
  };

type TextareaProps = BaseInputProps & 
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> & {
    multiline: true;
  };

type FormInputProps = InputProps | TextareaProps;

export const FormInput = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  FormInputProps
>(({ 
  label,
  error,
  hint,
  required,
  maxLength,
  showCounter = false,
  className = "",
  containerClassName = "",
  ...props
}, ref) => {
  const isMultiline = 'multiline' in props && props.multiline;
  const value = String(props.value || '');
  const currentLength = value.length;

  const inputClasses = cn(
    "w-full px-4 py-3 border rounded-sm text-[13px]  ",
    "focus:outline-none focus:ring-0 focus:ring-blue-3",
    "transition-all duration-200",
    error 
      ? "border-red-500 focus:ring-red-500" 
      : "border-gray-300 focus:ring-blue-3",
    "disabled:bg-gray-100 disabled:cursor-not-allowed",
    className
  );

  return (
    <div className={cn("space-y-2", containerClassName)}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium mb-2">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}

      {/* Input/Textarea */}
      {isMultiline ? (
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          maxLength={maxLength}
          className={inputClasses}
          {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          maxLength={maxLength}
          className={inputClasses}
          {...(props as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}

      {/* Counter, Hint, Error */}
      { error &&
        <div className="flex items-center justify-between gap-2 min-h-[20px]">
        {/* Hint or Error */}
        <div className="flex-1">
          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}
          {!error && hint && (
            <p className="text-xs text-gray-500">{hint}</p>
          )}
        </div>

        {/* Character Counter */}
        {(showCounter || maxLength) && (
          <p className="text-xs text-gray-500 whitespace-nowrap">
            {currentLength}/{maxLength || '∞'}
          </p>
        )}
      </div>
      }
    </div>
  );
});

FormInput.displayName = "FormInput";