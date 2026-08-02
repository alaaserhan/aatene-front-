// src/features/(dashboard)/stores/components/StoreWorkingHoursFields.tsx
"use client";

import { cn } from "@/src/lib/utils";
import { TimePicker } from "./TimePicker";
import { OpenStatus, WorkingTimePayload } from "../api";

export const WEEK_DAYS = [
  { value: "saturday", label: "السبت" },
  { value: "sunday", label: "الأحد" },
  { value: "monday", label: "الاثنين" },
  { value: "tuesday", label: "الثلاثاء" },
  { value: "wednesday", label: "الأربعاء" },
  { value: "thursday", label: "الخميس" },
  { value: "friday", label: "الجمعة" },
];

const OPEN_STATUS_OPTIONS: {
  value: OpenStatus;
  label: string;
  description: string;
}[] = [
  {
    value: "open_with_working_times",
    label: "مفتوح خلال ساعات عمل معينه",
    description: "أظهر متى يكون عملك مفتوحاً",
  },
  {
    value: "open_without_working_times",
    label: "مفتوح بدون ساعات عمل معينة",
    description: "لا تظهر ساعات عمل معينة",
  },
  {
    value: "temporary_closed",
    label: "مغلق بشكل مؤقت",
    description: "أظهر أن عملنا سيكون متاحاً في المستقبل",
  },
  {
    value: "closed",
    label: "مغلق بشكل دائم",
    description: "أظهر أن عملنا لم يعد موجوداً",
  },
];

export function defaultWorkingTimes(): WorkingTimePayload[] {
  return WEEK_DAYS.map((day) => ({
    day: day.value,
    from: "08:00",
    to: "20:00",
    open_always: false,
    closed_always: false,
  }));
}

interface StoreWorkingHoursFieldsProps {
  openStatus: OpenStatus;
  workingTimes: WorkingTimePayload[];
  onOpenStatusChange: (status: OpenStatus) => void;
  onWorkingTimesChange: (times: WorkingTimePayload[]) => void;
}

/** Open-status radios + per-day hours, shared by the wizard and store settings. */
export function StoreWorkingHoursFields({
  openStatus,
  workingTimes,
  onOpenStatusChange,
  onWorkingTimesChange,
}: StoreWorkingHoursFieldsProps) {
  const updateWorkingTime = <K extends keyof WorkingTimePayload>(
    index: number,
    field: K,
    value: WorkingTimePayload[K]
  ) => {
    const next = [...workingTimes];
    const updated = { ...next[index], [field]: value };

    // The two "always" flags are mutually exclusive
    if (field === "open_always" && value === true) updated.closed_always = false;
    if (field === "closed_always" && value === true) updated.open_always = false;

    next[index] = updated;
    onWorkingTimesChange(next);
  };

  return (
    <>
      <div className="space-y-6">
        {OPEN_STATUS_OPTIONS.map((option) => (
          <OpenStatusOption
            key={option.value}
            label={option.label}
            description={option.description}
            selected={openStatus === option.value}
            onClick={() => onOpenStatusChange(option.value)}
          />
        ))}
      </div>

      {openStatus === "open_with_working_times" && (
        <div className="mt-8">
          <div className="grid grid-cols-12 gap-4 mb-4 text-sm font-medium text-gray-3 px-2">
            <div className="col-span-2">اليوم</div>
            <div className="col-span-4">يفتح في</div>
            <div className="col-span-4">يغلق في</div>
            <div className="col-span-2"></div>
          </div>

          <div className="space-y-8">
            {workingTimes.map((time, index) => (
              <div key={time.day} className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-12 md:col-span-2">
                  <span className="text-sm font-medium">
                    {WEEK_DAYS.find((d) => d.value === time.day)?.label}
                  </span>
                </div>

                <div className="col-span-6 md:col-span-3 flex">
                  <TimePicker
                    value={time.from}
                    onChange={(val) => updateWorkingTime(index, "from", val)}
                    disabled={time.open_always || time.closed_always}
                  />
                </div>

                <div className="col-span-6 md:col-span-3 flex">
                  <TimePicker
                    value={time.to}
                    onChange={(val) => updateWorkingTime(index, "to", val)}
                    disabled={time.open_always || time.closed_always}
                  />
                </div>

                <div className="col-span-12 md:col-span-4 flex flex-row gap-4">
                  <DayCheckbox
                    label="مفتوح 24 ساعة"
                    checked={time.open_always || false}
                    onChange={(checked) =>
                      updateWorkingTime(index, "open_always", checked)
                    }
                  />

                  <DayCheckbox
                    label="مغلق"
                    checked={time.closed_always || false}
                    onChange={(checked) =>
                      updateWorkingTime(index, "closed_always", checked)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

interface OpenStatusOptionProps {
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

function OpenStatusOption({
  label,
  description,
  selected,
  onClick,
}: OpenStatusOptionProps) {
  return (
    <div onClick={onClick} className="flex items-center gap-3 cursor-pointer group">
      <div className="flex-shrink-0 mt-1 relative">
        <div
          className={cn(
            "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
            selected
              ? "border-blue-4"
              : "border-gray-300 group-hover:border-gray-2"
          )}
        >
          {selected && <div className="w-2 h-2 rounded-full bg-blue-4" />}
        </div>
      </div>
      <div>
        <h4 className="font-bold text-sm mb-1">{label}</h4>
        <p className="text-xs text-gray-1">{description}</p>
      </div>
    </div>
  );
}

interface DayCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function DayCheckbox({ label, checked, onChange }: DayCheckboxProps) {
  return (
    <div
      className="flex items-center gap-2 cursor-pointer group select-none"
      onClick={() => onChange(!checked)}
    >
      <button
        type="button"
        className={cn(
          "w-4 h-4 rounded-xs border transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer",
          checked
            ? "bg-blue-5 border-blue-4"
            : "bg-white border-gray-300 group-hover:border-gray-2"
        )}
        aria-checked={checked}
        role="checkbox"
      >
        {checked && (
          <svg
            className="w-4 h-4 text-blue-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </button>
      <span className="text-sm text-gray-2 font-medium">{label}</span>
    </div>
  );
}
