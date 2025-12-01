// src/components/ui/Tooltip.tsx
"use client";

import { useState, ReactNode } from "react";

interface TooltipProps {
  trigger: ReactNode;
  content: ReactNode;
}

export function Tooltip({ trigger, content }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="cursor-pointer"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          className="absolute z-50 p-3 bg-white border border-gray-200 rounded-lg shadow-lg w-64 text-xs text-gray-600 leading-relaxed top-full mt-2 left-1/2 -translate-x-1/2"
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
}