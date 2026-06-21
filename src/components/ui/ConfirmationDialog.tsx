"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  overlayClassName?: string;
  contentClassName?: string;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  overlayClassName,
  contentClassName,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={contentClassName ?? "sm:max-w-md"} overlayClassName={overlayClassName} dir="rtl">
        <DialogHeader className="pt-4">
          <DialogTitle className="text-lg font-bold text-center">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-center text-gray-2 pt-2">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-row-reverse gap-2 sm:justify-start pt-4">
          <Button
            type="button"
            className="flex-1 cursor-pointer bg-blue-4 hover:bg-blue-600 text-white"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            نعم
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 cursor-pointer"
            onClick={onClose}
          >
            لا
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
