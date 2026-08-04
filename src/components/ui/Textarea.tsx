// src/components/ui/Textarea.tsx
"use client";

import { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";
import { CharCounter } from "@/src/components/ui/CharCounter";
import { Label } from "@/src/components/ui/label";

interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  /** Shows a `current/max` counter under the field (needs `maxLength`) */
  showCounter?: boolean;
  className?: string;
  containerClassName?: string;
}

/**
 * Multi-line text field with an optional label, hint/error line and character
 * counter.
 *
 * The focus ring is drawn with `ring-inset` on purpose: a normal outset ring
 * (or `ring-offset-*`) paints outside the element box, so on a full-width
 * field inside a clipping parent — e.g. the `overflow-hidden` accordion
 * content used by the settings sections — the start/end sides of the ring get
 * cut off while the top/bottom stay visible. Drawing it inside keeps all four
 * sides visible everywhere.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      required,
      showCounter = false,
      className,
      containerClassName,
      id,
      maxLength,
      value,
      ...props
    },
    ref
  ) => {
    const showCounterLine = showCounter && typeof maxLength === "number";

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <Label htmlFor={id} className="text-start text-sm font-medium">
            {label}
            {required && <span className="text-red-500 ms-1">*</span>}
          </Label>
        )}

        <textarea
          ref={ref}
          id={id}
          maxLength={maxLength}
          value={value}
          className={cn(
            "flex min-h-30 w-full rounded-sm border bg-white px-3 py-2 text-sm",
            "transition-colors placeholder:text-gray-6",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset",
            error
              ? "border-red-500 focus-visible:ring-red-500"
              : "border-gray-200 focus-visible:border-blue-3 focus-visible:ring-blue-3",
            "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50",
            className
          )}
          {...props}
        />

        {(error || hint || showCounterLine) && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              {error ? (
                <p className="text-xs text-red-500">{error}</p>
              ) : hint ? (
                <p className="text-xs text-gray-3">{hint}</p>
              ) : null}
            </div>
            {showCounterLine && (
              <CharCounter value={String(value ?? "")} maxLength={maxLength} />
            )}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
