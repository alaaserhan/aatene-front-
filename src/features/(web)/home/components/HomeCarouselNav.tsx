"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/src/lib/utils";

const navBtnClass =
  "absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all opacity-0 group-hover/nav:opacity-100 cursor-pointer text-gray-700 z-10";

interface HomeCarouselNavProps {
  onPrev: () => void;
  onNext: () => void;
  className?: string;
}

/** أسهم التنقل — نفس متاجر مميزة */
export default function HomeCarouselNav({ onPrev, onNext, className }: HomeCarouselNavProps) {
  return (
    <>
      <button
        type="button"
        onClick={onNext}
        aria-label="التالي"
        className={cn(navBtnClass, "-right-4", className)}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={onPrev}
        aria-label="السابق"
        className={cn(navBtnClass, "-left-4", className)}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
    </>
  );
}
