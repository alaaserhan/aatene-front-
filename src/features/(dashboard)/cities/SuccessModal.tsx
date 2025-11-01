"use client";

import { Check } from "lucide-react";
import { useEffect } from "react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  actionText?: string;
  actionLink?: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function SuccessModal({
  isOpen,
  onClose,
  title = "تم حذف المدينة",
  actionText = "عرض جميع المدن",
  actionLink,
  autoClose = true,
  autoCloseDelay = 2000,
}: SuccessModalProps) {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          {/* Green Check Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="w-12 h-12 text-white" strokeWidth={3} />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-center text-brand-black-1 mb-6">
            {title}
          </h2>

          {/* Action Button */}
          <button
            onClick={() => {
              if (actionLink) {
                window.location.href = actionLink;
              }
              onClose();
            }}
            className="w-full px-6 py-3 bg-brand-blue-3 text-white rounded-lg font-medium hover:bg-brand-blue-2 transition-colors"
          >
            {actionText}
          </button>

          {/* Close Text */}
          <button
            onClick={onClose}
            className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}