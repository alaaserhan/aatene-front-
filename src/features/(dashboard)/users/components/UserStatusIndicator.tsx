// src/features/(dashboard)/users/components/UserStatusIndicator.tsx
"use client";

import { cn } from "@/src/lib/utils";

interface UserStatusIndicatorProps {
  isActive: boolean;
}

export function UserStatusIndicator({ isActive }: UserStatusIndicatorProps) {
  const config = isActive
    ? { text: "مفعل", color: "text-green-600 bg-green-50" }
    : { text: "في الانتظار", color: "text-orange-600 bg-orange-50" };

  return (
    <div
      className={cn(
        "text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1.5",
        config.color
      )}
    >
      <div
        className={cn(
          "w-2 h-2 rounded-full",
          isActive ? "bg-green-500" : "bg-orange-500"
        )}
      ></div>
      {config.text}
    </div>
  );
}