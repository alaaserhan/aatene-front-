"use client";

import { X } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "هل أنت متأكد من المدينة",
  confirmText = "نعم",
  cancelText = "لا",
}: ConfirmDeleteModalProps) {
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
          {/* Red X Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center">
              <X className="w-12 h-12 text-white" strokeWidth={3} />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-center text-brand-black-1 mb-8">
            {title}
          </h2>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}