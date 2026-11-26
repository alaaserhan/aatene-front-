// src/components/ui/ToggleSwitch.tsx
"use client";

import { cn } from "@/src/lib/utils";

interface ToggleSwitchProps {
  id?: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

export function ToggleSwitch({ id, enabled, onChange, disabled = false }: ToggleSwitchProps) {
  return (
    <button
      id={id}
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-6 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-3",
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
          // Match the existing RTL switch direction.
          enabled ? "-translate-x-6.5" : "-translate-x-1",

        )}
      />
    </button>
  );
}
