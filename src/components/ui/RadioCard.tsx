// src/components/ui/RadioCard.tsx
"use client";

import { createContext, useContext, useId, type ReactNode } from "react";
import { cn } from "@/src/lib/utils";

interface RadioCardGroupContextValue {
  name: string;
  value: string | undefined;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const RadioCardGroupContext = createContext<RadioCardGroupContextValue | null>(null);

function useRadioCardGroup(component: string) {
  const context = useContext(RadioCardGroupContext);
  if (!context) {
    throw new Error(`${component} must be used within a RadioCardGroup`);
  }
  return context;
}

interface RadioCardGroupProps<T extends string> {
  /** Currently selected option */
  value: T | undefined;
  onChange: (value: T) => void;
  /** Group label, announced by screen readers */
  label: string;
  /** Also render the label visually */
  showLabel?: boolean;
  /** Field name used on form submission */
  name?: string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

export function RadioCardGroup<T extends string>({
  value,
  onChange,
  label,
  showLabel = false,
  name,
  disabled,
  className,
  children,
}: RadioCardGroupProps<T>) {
  const generatedName = useId();

  return (
    <RadioCardGroupContext.Provider
      value={{
        name: name ?? generatedName,
        value,
        onChange: onChange as (value: string) => void,
        disabled,
      }}
    >
      <fieldset className="min-w-0 border-0 p-0 m-0">
        <legend className={cn(!showLabel && "sr-only", showLabel && "heading-2 mb-3")}>
          {label}
        </legend>
        <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6", className)}>
          {children}
        </div>
      </fieldset>
    </RadioCardGroupContext.Provider>
  );
}

interface RadioCardProps {
  value: string;
  label: string;
  /** Icon or any content rendered above the label */
  icon?: ReactNode;
  /** Content pinned to the card's top-end corner, e.g. a "coming soon" badge */
  badge?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function RadioCard({
  value,
  label,
  icon,
  badge,
  disabled,
  className,
}: RadioCardProps) {
  const group = useRadioCardGroup("RadioCard");
  const isSelected = group.value === value;
  const isDisabled = disabled || group.disabled;

  return (
    <label
      className={cn(
        "relative p-8 rounded-2xl border-2",
        "flex flex-col items-center justify-center min-h-[260px]",
        "transition-all duration-200",
        "focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-4 focus-within:ring-offset-2",
        isDisabled
          ? "cursor-not-allowed"
          : "cursor-pointer hover:shadow-lg hover:scale-[1.02]",
        isSelected
          ? "bg-blue-5 border-blue-3 shadow-md shadow-blue-3/10"
          : cn("bg-white border-gray-200", !isDisabled && "hover:border-blue-3/30"),
        className
      )}
    >
      <input
        type="radio"
        name={group.name}
        value={value}
        checked={isSelected}
        disabled={isDisabled}
        onChange={() => group.onChange(value)}
        className="sr-only"
      />

      {badge && <span className="absolute top-4 left-4">{badge}</span>}

      <span
        aria-hidden="true"
        className={cn(
          "absolute top-4 right-4",
          "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all",
          isSelected ? "border-blue-4 bg-blue-4 shadow-sm" : "border-gray-300 bg-transparent",
          isDisabled && "opacity-60"
        )}
      >
        {isSelected && <span className="w-3 h-3 rounded-full bg-white" />}
      </span>

      <span
        className={cn(
          "flex flex-col items-center justify-center transition-opacity",
          isDisabled && "opacity-60"
        )}
      >
        {icon && (
          <span
            aria-hidden="true"
            className={cn(
              "mb-3 p-4 rounded-2xl transition-all",
              isSelected ? "bg-blue-3/10" : "bg-gray-50"
            )}
          >
            {icon}
          </span>
        )}

        <span
          className={cn(
            "text-xl font-bold transition-colors",
            isSelected ? "text-blue-3" : "text-blue-4"
          )}
        >
          {label}
        </span>
      </span>
    </label>
  );
}
