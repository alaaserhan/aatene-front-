// src/components/ui/InfoBox.tsx
"use client";

import { Info } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface InfoBoxProps {
  texts: string[];
  className?: string;
}

export function InfoBox({ texts, className }: InfoBoxProps) {
  if (!texts || texts.length === 0) {
    return null;
  }

  return (
    <div className={cn("bg-blue-6 rounded-sm p-3", className)}>
      <div className="flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-3 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-gray-700 space-y-1 text-start flex-1">
          {texts.map((text, index) => (
            <p key={index}>{index === 0 ? text : `• ${text}`}</p>
          ))}
        </div>
      </div>
    </div>
  );
}