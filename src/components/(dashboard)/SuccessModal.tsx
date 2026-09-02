// src/components/(dashboard)/SuccessModal.tsx
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
import { cn } from "@/src/lib/utils";
import { Check, Clock } from "lucide-react";
import type { ReactNode } from "react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  titleClassName?: string;
  message?: string;
  messageClassName?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  /** Optional second action, rendered underneath the primary button. */
  secondaryButtonText?: string;
  onSecondaryButtonClick?: () => void;
  /**
   * "pending" swaps the success check for a review/waiting illustration —
   * for actions that succeeded but still need approval before going live.
   */
  variant?: "success" | "pending";
  /** Small pill above the title — e.g. confirming what just succeeded. */
  badgeText?: string;
  badgeTone?: "success" | "pending";
  /** Extra content (next steps, hints...) rendered between the message and the actions. */
  children?: ReactNode;
}

export function SuccessModal({
  isOpen,
  onClose,
  title = "تمت العملية بنجاح",
  message,
  messageClassName,
  buttonText = "تم",
  onButtonClick,
  secondaryButtonText,
  onSecondaryButtonClick,
  variant = "success",
  badgeText,
  badgeTone = "pending",
  children,
}: SuccessModalProps) {
  const isPending = variant === "pending";
  const isSuccessBadge = badgeTone === "success";

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
            {isPending ? (
              <div className="relative w-24 h-24 flex items-center justify-center">
                <span
                  aria-hidden
                  className="absolute inset-3 rounded-full bg-[#FFD87D]/40 animate-ping motion-reduce:animate-none"
                />
                <span
                  aria-hidden
                  className="absolute inset-1 rounded-full bg-[#FFF4DA]"
                />
                <span className="relative w-16 h-16 rounded-full bg-[#FFE9B8] text-[#C48A00] flex items-center justify-center">
                  <Clock className="w-8 h-8" strokeWidth={1.75} />
                </span>

                {/* The creation itself succeeded — only the publishing is pending */}
                <span className="absolute bottom-1 start-1 w-7 h-7 rounded-full bg-[#00A651] text-white flex items-center justify-center ring-4 ring-white">
                  <Check className="w-4 h-4" strokeWidth={3} />
                </span>
              </div>
            ) : (
              <img src="/icons/success.svg" alt="" />
            )}
          </div>

          {badgeText && (
            <span
              className={cn(
                "mb-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
                isSuccessBadge
                  ? "border-[#66FF99]/60 bg-[#E6FFF1] text-[#006B2E]"
                  : "border-[#FFD87D]/60 bg-[#FFFBF0] text-[#8A6000]",
              )}
            >
              {isSuccessBadge ? (
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-[#C48A00]" />
              )}
              {badgeText}
            </span>
          )}

          <DialogTitle className="text-xl sm:text-2xl font-medium text-center text-brand-black-1">
            {title}
          </DialogTitle>

          {message && (
            <DialogDescription
              className={cn(
                "text-center font-bold text-[#777] pt-2",
                messageClassName,
              )}
            >
              {message}
            </DialogDescription>
          )}
        </DialogHeader>

        {children}

        <DialogFooter
          className={cn(
            "flex-col gap-4 sm:flex-col sm:justify-center sm:gap-4",
            children ? "pt-1" : "pt-4",
          )}
        >
          <Button
            type="button"
            className="w-full cursor-pointer bg-blue-4 hover:bg-[#2c4460]"
            onClick={handleButtonClick}
            size="lg"
          >
            {buttonText}
          </Button>

          {secondaryButtonText && (
            <Button
              type="button"
              variant="outline"
              className="w-full cursor-pointer"
              onClick={onSecondaryButtonClick ?? onClose}
              size="lg"
            >
              {secondaryButtonText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
