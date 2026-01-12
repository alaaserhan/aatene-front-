// src/components/(dashboard)/SuccessModal.tsx
"use client";

import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";

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
  // لا نحتاج شرط if (!isOpen) لأن Dialog يتحكم في الظهور داخلياً عبر open prop

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader className="flex flex-col items-center pt-4">
          {/* أيقونة النجاح بنفس ستايل أيقونة الحذف لكن باللون الأخضر */}
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-200 flex items-center justify-center">
              <Check className="w-10 h-10 text-green-600" strokeWidth={2} />
            </div>
          </div>

          <DialogTitle className="text-xl font-bold text-center text-brand-black-1">
            {title}
          </DialogTitle>

          {message && (
            <DialogDescription className="text-center text-gray-2 pt-2">
              {message}
            </DialogDescription>
          )}
        </DialogHeader>

        <DialogFooter className="flex-col sm:justify-center pt-4">
          <Button
            type="button"
            className="w-full cursor-pointer bg-blue-4 hover:bg-[#2c4460]"
            onClick={onClose}
          >
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}