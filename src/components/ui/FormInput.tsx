// src/components/ui/FormInput.tsx
"use client";

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, useState } from "react";
import { cn } from "@/src/lib/utils";
import { Eye, EyeOff } from "lucide-react";

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
  multiline,
  ...props
}, ref) => {
  const isMultiline = multiline;
  const value = String(props.value || '');
  const currentLength = value.length;
  const [showPassword, setShowPassword] = useState(false);

  // Check if it's a password input
  const isPassword = !isMultiline && (props as InputHTMLAttributes<HTMLInputElement>).type === 'password';

  const inputClasses = cn(
    "w-full px-4 py-3 border rounded-sm text-[13px]  ",
    "focus:outline-none focus:ring-0 focus:ring-blue-3",
    "transition-all duration-200",
    error
      ? "border-red-500 focus:ring-red-500"
      : "border-gray-200 focus:ring-blue-3",
    "disabled:bg-gray-100 disabled:cursor-not-allowed",
    isPassword ? "pl-10" : "", // Add left padding for password eye icon
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
        <div className="relative">
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            maxLength={maxLength}
            className={inputClasses}
            {...(props as InputHTMLAttributes<HTMLInputElement>)}
            type={isPassword ? (showPassword ? 'text' : 'password') : (props as InputHTMLAttributes<HTMLInputElement>).type}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute cursor-pointer left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          )}
        </div>
      )}

      {/* Counter, Hint, Error */}
      {(error || hint || (maxLength && showCounter)) && (
        <div className="flex items-center justify-between gap-2 min-h-[20px]">
          {/* Hint or Error */}
          <div className="flex-1">
            {error ? (
              <p className="text-xs text-red-500">{error}</p>
            ) : hint ? (
              <p className="text-xs text-gray-3">{hint}</p>
            ) : null}
          </div>
          {/* Character Counter */}
          {!error && (showCounter || maxLength) && (
            <p className="text-xs text-gray-3 whitespace-nowrap">
              {currentLength}/{maxLength || '∞'} حرف
            </p>
          )}
        </div>
      )}
    </div>
  );
});

FormInput.displayName = "FormInput";