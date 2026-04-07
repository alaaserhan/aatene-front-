"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";

import { Locale } from "date-fns";

interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
  fromYear?: number;
  toYear?: number;
  mode?: "single" | "multiple" | "range";
  initialFocus?: boolean;
  locale?: Locale;
  disabled?: (date: Date) => boolean;
}

const WEEKDAYS = ["أح", "إث", "ث", "أر", "خ", "ج", "س"];
const MONTHS = [
  "يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function Calendar({
  selected,
  onSelect,
  className,
  fromYear = 1940,
  toYear = new Date().getFullYear() + 1,
  disabled,
}: CalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = React.useState(selected?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(selected?.getMonth() ?? today.getMonth());
  const [showYearPicker, setShowYearPicker] = React.useState(false);

  const yearGridRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (showYearPicker && yearGridRef.current) {
      const activeBtn = yearGridRef.current.querySelector<HTMLButtonElement>("[data-active='true']");
      if (activeBtn) {
        activeBtn.scrollIntoView({ block: "center", behavior: "instant" });
      }
    }
  }, [showYearPicker]);

  const years = Array.from({ length: toYear - fromYear + 1 }, (_, i) => fromYear + i);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();

  const cells: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div className={cn("w-[280px] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden", className)}>
      <div className="gradient-blue px-4 py-3.5">
        <div className="flex items-center justify-between">
          <button
            onClick={nextMonth}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-white"
          >
            <ChevronLeftIcon className="h-4.5 w-4.5" />
          </button>

          <button
            onClick={() => setShowYearPicker(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-white font-medium text-sm"
          >
            <span>{MONTHS[viewMonth]} {viewYear}</span>
            <ChevronDownIcon
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-300",
                showYearPicker && "rotate-180"
              )}
            />
          </button>

          <button
            onClick={prevMonth}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-white"
          >
            <ChevronRightIcon className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      <div className="relative">
        {showYearPicker && (
          <div
            ref={yearGridRef}
            className="absolute inset-x-0 top-0 bottom-0 z-10 bg-white overflow-y-auto max-h-[256px] p-3 scrollbar-none"
          >
            <div className="grid grid-cols-4 gap-1.5">
              {years.map((yr) => {
                const isActive = yr === viewYear;
                return (
                  <button
                    key={yr}
                    data-active={isActive}
                    onClick={() => { setViewYear(yr); setShowYearPicker(false); }}
                    className={cn(
                      "rounded-lg py-1.5 pb-1 text-[13px] font-medium transition-all",
                      isActive
                        ? "bg-blue-3 text-white shadow-md transform scale-105"
                        : "hover:bg-blue-5 text-blue-3"
                    )}
                  >
                    {yr}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="p-4">
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((day, idx) => {
              if (day === null) {
                return <div key={idx} />;
              }
              const date = new Date(viewYear, viewMonth, day);
              const isSelected = selected ? isSameDay(date, selected) : false;
              const isTodayDate = isSameDay(date, today);
              const isDayDisabled = disabled ? disabled(date) : false;

              return (
                <button
                  key={idx}
                  onClick={() => !isDayDisabled && onSelect?.(date)}
                  disabled={isDayDisabled}
                  className={cn(
                    "h-7 pt-1 w-full rounded-lg text-sm font-medium transition-all relative flex items-center justify-center",
                    isSelected
                      ? "bg-blue-3 text-white shadow-sm z-1"
                      : isTodayDate
                        ? "bg-blue-5 text-blue-3 ring-1 ring-blue-3/20"
                        : "hover:bg-gray-50 text-gray-600",
                    isDayDisabled && "opacity-30 cursor-not-allowed hover:bg-transparent"
                  )}
                >
                  {day}
                  {isTodayDate && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-3" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
