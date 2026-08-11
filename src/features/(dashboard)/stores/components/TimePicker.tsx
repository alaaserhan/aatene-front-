// src/features/(dashboard)/stores/components/TimePicker.tsx
"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

type Period = "AM" | "PM";

export function TimePicker({
  value,
  onChange,
  disabled = false,
  className,
}: TimePickerProps) {
  // State to manage dropdown visibility
  const [isHourOpen, setIsHourOpen] = React.useState(false);
  const [isPeriodOpen, setIsPeriodOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Parse the initial value (HH:mm in 24h format)
  const { hour12, minute, period } = React.useMemo(() => {
    if (!value) return { hour12: "08", minute: "00", period: "AM" as Period };
    const [h, m] = value.split(":");
    let hourInt = parseInt(h, 10);
    const p = hourInt >= 12 ? "PM" : "AM";

    // Convert to 12h format
    hourInt = hourInt % 12;
    hourInt = hourInt ? hourInt : 12; // the hour '0' should be '12'

    return {
      hour12: hourInt.toString().padStart(2, "0"),
      minute: m,
      period: p as Period,
    };
  }, [value]);

  // Generate Time Options (01:00 to 12:30)
  const timeOptions = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const h = (i + 1).toString().padStart(2, "0");
      return [`${h}:00`, `${h}:30`];
    }).flat();
  }, []);

  // Handle click outside to close dropdowns
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsHourOpen(false);
        setIsPeriodOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateTime = (newTime12: string, newPeriod: Period) => {
    const [h, m] = newTime12.split(":");
    let hourInt = parseInt(h, 10);

    if (newPeriod === "PM" && hourInt !== 12) hourInt += 12;
    if (newPeriod === "AM" && hourInt === 12) hourInt = 0;

    const finalTime24 = `${hourInt.toString().padStart(2, "0")}:${m}`;
    onChange(finalTime24);
  };

  const currentTimeDisplay = `${hour12}:${minute}`;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex items-center justify-between w-36 h-[45px] px-4 bg-white border border-[#CBD5E0] rounded-lg transition-colors",
        disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "hover:border-blue-3",
        className
      )}
    >
      {/* Time Section (Right) */}
      <div className="relative flex-1">
        <button
          type="button"
          onClick={() => !disabled && setIsHourOpen(!isHourOpen)}
          className="text-xs text-[#808080] hover:text-blue-3 transition-colors focus:outline-none"
          disabled={disabled}
        >
          {currentTimeDisplay}
        </button>

        {/* Time Dropdown */}
        {isHourOpen && (
          <div className="absolute top-full right-0 mt-2 w-24 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50 custom-scrollbar">
            {timeOptions.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  updateTime(t, period);
                  setIsHourOpen(false);
                }}
                className={cn(
                  "w-full text-center py-2 text-sm hover:bg-blue-50 transition-colors block",
                  currentTimeDisplay === t
                    ? "text-blue-3 font-bold bg-blue-5"
                    : "text-gray-700"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>


      {/* Vertical Divider */}
      <div className="w-px h-5 bg-gray-2 mx-3" />

      {/* Period Section (Left) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsPeriodOpen(!isPeriodOpen)}
          className="flex items-center gap-1 text-sm text-gray-2 hover:text-blue-3 transition-colors focus:outline-none"
          disabled={disabled}
        >
          <span className="pt-1 text-xs text-[#808080]">{period}</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {/* Period Dropdown */}
        {isPeriodOpen && (
          <div className="absolute top-full left-0 mt-2 w-16 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
            {["AM", "PM"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  updateTime(currentTimeDisplay, p as Period);
                  setIsPeriodOpen(false);
                }}
                className={cn(
                  "w-full text-center py-2 text-sm hover:bg-blue-50 transition-colors block",
                  period === p ? "text-blue-3 font-bold bg-blue-5" : "text-gray-700"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}