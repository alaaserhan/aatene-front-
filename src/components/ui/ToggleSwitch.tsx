// src/components/ui/ToggleSwitch.tsx
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
        "relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none ",
        "cursor-pointer",
        enabled ? "bg-green-500" : "bg-gray-300",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      role="switch"
      aria-checked={enabled}
    >
      <span
        className={cn(
          "inline-block h-4.5 w-4.5 transform rounded-full bg-white transition-transform",
          // --- هذا هو الإصلاح ---
          // LTR (Default): 
          // enabled = right (x-8), disabled = left (x-1)
          enabled ? "-translate-x-6.5" : "-translate-x-1",

        )}
      />
    </button>
  );
}