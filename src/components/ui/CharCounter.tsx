// src/components/ui/CharCounter.tsx
"use client";

import { cn } from "@/src/lib/utils";

interface CharCounterProps {
  /** Current value (its length is counted) or a ready-made count */
  value: string | number | null | undefined;
  maxLength: number;
  /** Unit label shown after the numbers, pass "" to hide it */
  unit?: string;
  className?: string;
}

export function CharCounter({ value, maxLength, unit = "حرف", className }: CharCounterProps) {
  const currentLength = typeof value === "number" ? value : String(value ?? "").length;
  const isAtLimit = currentLength >= maxLength;

  return (
    <p
      className={cn(
        "text-xs whitespace-nowrap shrink-0",
        isAtLimit ? "text-red-500" : "text-gray-3",
        className
      )}
    >
      {currentLength}/{maxLength}
      {unit ? ` ${unit}` : ""}
    </p>
  );
}
