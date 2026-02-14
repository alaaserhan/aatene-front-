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
  onButtonClick?: () => void;
}

export function SuccessModal({
  isOpen,
  onClose,
  title = "تمت العملية بنجاح",
  message,
  buttonText = "تم",
  onButtonClick,
}: SuccessModalProps) {
  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader className="flex flex-col items-center pt-4">
          <div className="w-24 h-24 flex items-center justify-center mb-6">
            <img src="/icons/success.svg" alt="success" />
          </div>

          <DialogTitle className="text-xl sm:text-2xl font-medium text-center text-brand-black-1">
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
            onClick={handleButtonClick}
          >
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}