"use client";

import { useState, ReactNode } from "react";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface SettingsAccordionProps {
  title: string;
  children: ReactNode;
  isCompleted?: boolean;
  defaultOpen?: boolean;
}

export function SettingsAccordion({
  title,
  children,
  isCompleted = true,
  defaultOpen = false,
}: SettingsAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full cursor-pointer flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* Title */}
          <h2 className=" font-semibold text-brand-black-1">
            {title}
          </h2>
          
          {/* Completed Checkmark */}
          {isCompleted && (
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500">
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </div>
          )}
        </div>

        {/* Toggle Icon */}
        <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-300 hover:border-brand-blue-2 transition-colors">
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-brand-blue-2" />
          ) : (
            <ChevronDown className="w-4 h-4 text-brand-blue-2" />
          )}
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="border-t border-gray-200 p-6 bg-gray-50/50">
          {children}
        </div>
      )}
    </div>
  );
}