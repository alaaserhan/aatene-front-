// src/features/(dashboard)/cities/components/ToggleSwitch.tsx
"use client";

import { cn } from "@/src/lib/utils";

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

export function ToggleSwitch({ enabled, onChange, disabled = false }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue-3 focus:ring-offset-2",
        "cursor-pointer",
        enabled ? "bg-green-500" : "bg-gray-300",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      role="switch"
      aria-checked={enabled}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
          enabled ? "-translate-x-1" : "-translate-x-8"
        )}
      />
    </button>
  );
}