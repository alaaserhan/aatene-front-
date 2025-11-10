// src/components/(dashboard)/SuccessModal.tsx
"use client";

import { Check } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
}

export function SuccessModal({
  isOpen,
  onClose,
  title = "تمت العملية بنجاح",
  message,
  buttonText = "تم",
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 transform transition-all">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="w-10 h-10 text-white stroke-[3]" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {title}
        </h2>

        {/* Message */}
        {message && (
          <p className="text-gray-600 mb-6">
            {message}
          </p>
        )}

        {/* Button */}
        <Button
          onClick={onClose}
          className="w-full py-3 cursor-pointer"
          style={{ backgroundColor: "var(--blue-3)" }}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
}