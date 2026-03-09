// src/components/ui/InfoBox.tsx
"use client";

import { AlertCircle, Info } from "lucide-react";
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
      <div className="flex items-center gap-4 justify-between" dir="rtl">
        <AlertCircle className="w-5 h-5 text-blue-3 shrink-0 text-blue-4" />
        <ul className="text-xs text-blue-4 space-y-1.5 text-start flex-1 list-disc list-inside">
          {texts.map((text, index) => (
            <li key={index} className="marker:text-blue-4">{text}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}