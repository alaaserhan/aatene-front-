"use client";

import * as React from "react";
import { CalendarDays } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Calendar } from "@/src/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";

interface DatePickerProps {
  label?: string;
  value?: string;
  onChange: (e: { target: { value: string } }) => void;
  required?: boolean;
  error?: string;
  hint?: string;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
}

const MONTHS_DISPLAY = [
  "يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

function formatDateDisplay(value: string): string {
  if (!value) return "";
  const [y, m, d] = value.split("-");
  const monthIdx = Number(m) - 1;
  return `${Number(d)} ${MONTHS_DISPLAY[monthIdx]} ${y}`;
}

function parseDate(value: string): Date | undefined {
  if (!value) return undefined;
  const parts = value.split("-");
  if (parts.length !== 3) return undefined;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return isNaN(d.getTime()) ? undefined : d;
}

function toYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const DatePicker = ({
  label,
  value,
  onChange,
  required,
  error,
  hint,
  placeholder = "اختر التاريخ",
  className,
  containerClassName,
}: DatePickerProps) => {
  const [open, setOpen] = React.useState(false);
  const date = parseDate(value ?? "");

  return (
    <div className={cn("space-y-2", containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-black-1">
          {label}
          {required && <span className="text-red-1 mr-1">*</span>}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between text-right font-normal h-[50px] px-4 rounded-lg  border border-gray-200 outline-none transition-all duration-200 shadow-none",
              !date && "text-gray-1",
              error
                ? "border-red-100 bg-red-2 text-red-1"
                : "ring-0 bg-white",
              open && !error && "border-gray-300",
              className
            )}
            dir="rtl"
          >
            <CalendarDays className={cn("h-5 w-5 shrink-0 transition-colors", date ? "text-blue-3" : "text-gray-1")} />
            <span className="flex-1 text-right text-[15px] font-medium leading-none font-baseline-fix">
              {value ? formatDateDisplay(value) : placeholder}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 z-99999 shadow-2xl border-0 rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          align="start"
          sideOffset={8}
        >
          <Calendar
            selected={date}
            onSelect={(newDate) => {
              if (newDate) {
                onChange({ target: { value: toYMD(newDate) } });
                setOpen(false);
              }
            }}
          />
        </PopoverContent>
      </Popover>

      {(error || hint) && (
        <div className="min-h-[20px] px-1">
          {error && <p className="text-[13px] font-medium text-red-1 animate-in slide-in-from-top-1">{error}</p>}
          {!error && hint && <p className="text-[13px] text-gray-2">{hint}</p>}
        </div>
      )}
    </div>
  );
};

DatePicker.displayName = "DatePicker";