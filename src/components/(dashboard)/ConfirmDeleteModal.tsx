// src/features/(dashboard)/cities/components/ConfirmDeleteModal.tsx
"use client";

import { X, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "delete" | "restore"; // نوع العملية
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "هل أنت متأكد من حذف المدينة؟",
  description = "لا يمكن استرجاع المدينة بعد حذفها",
  confirmText = "نعم، قم بالحذف",
  cancelText = "إلغاء",
  variant = "delete",
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  // تحديد الألوان حسب نوع العملية
  const colors = variant === "delete" 
    ? {
        bg: "bg-red-100",
        bgInner: "bg-red-200",
        icon: "text-red-600",
        button: "destructive" as const,
      }
    : {
        bg: "bg-emerald-100",
        bgInner: "bg-emerald-200",
        icon: "text-emerald-600",
        button: "default" as const,
      };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader className="flex flex-col items-center pt-4">
          <div className={`w-24 h-24 rounded-full ${colors.bg} flex items-center justify-center mb-6`}>
            <div className={`w-16 h-16 rounded-full ${colors.bgInner} flex items-center justify-center`}>
              <AlertTriangle className={`w-10 h-10 ${colors.icon}`} strokeWidth={2} />
            </div>
          </div>
          <DialogTitle className="text-xl font-bold text-center text-brand-black-1">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-2 pt-2">
            {description || " لا يمكنك التراجع عن هذا الإجراء بعد التأكيد."}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-row-reverse gap-2 sm:justify-start pt-4">
          <Button
            type="button"
            variant={variant === "delete" ? "destructive" : "default"}
            className={`flex-1 cursor-pointer ${
              variant === "restore" ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""
            }`}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 cursor-pointer"
            onClick={onClose}
          >
            {cancelText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}