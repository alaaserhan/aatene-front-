// src/features/(dashboard)/stores/components/AddStoreStep5.tsx
"use client";

import { useState } from "react";
import { StepperProgress } from "./StepperProgress";
import { StorePreviewSidebar } from "./StorePreviewSidebar";
import { GuideVideoCard } from "../../user-guide/components/GuideVideoCard";
import { StoreFormActions } from "./StoreFormActions";
import { TimePicker } from "./TimePicker";
import { StoreType, WorkingTimePayload, OpenStatus } from "../api";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { cn } from "@/src/lib/utils";
import { Step2FormData, Step5FormData } from "../types";

interface AddStoreStep5Props {
  storeType: StoreType;
  previousData: Step2FormData;
  initialData?: Step5FormData;
  onNext: (data: Step5FormData) => void;
  onBack: () => void;
  barSteps: { number: number; label: string; completed: boolean }[];
}

const DAYS = [
  { value: "saturday", label: "السبت" },
  { value: "sunday", label: "الأحد" },
  { value: "monday", label: "الاثنين" },
  { value: "tuesday", label: "الثلاثاء" },
  { value: "wednesday", label: "الأربعاء" },
  { value: "thursday", label: "الخميس" },
  { value: "friday", label: "الجمعة" },
];

export function AddStoreStep5({
  storeType,
  previousData,
  initialData,
  onNext,
  onBack,
  barSteps,
}: AddStoreStep5Props) {
  const [openStatus, setOpenStatus] = useState<OpenStatus>(
    initialData?.open_status || "open_with_working_times"
  );

  const [workingTimes, setWorkingTimes] = useState<WorkingTimePayload[]>(
    (initialData?.workingtimes && initialData.workingtimes.length > 0)
      ? initialData.workingtimes
      : DAYS.map((day) => ({
        day: day.value,
        from: "08:00",
        to: "20:00",
        open_always: false,
        closed_always: false,
      }))
  );

  const steps = barSteps;
  const breadcrumbItems = [
    { label: "الرئيسية", href: "/admin/home" },
    { label: "المتاجر", href: "/admin/stores" },
    { label: "إضافة متجر" },
  ];

  const updateWorkingTime = <K extends keyof WorkingTimePayload>(
    index: number,
    field: K,
    value: WorkingTimePayload[K]
  ) => {
    setWorkingTimes((prev) => {
      const newTimes = [...prev];
      const updatedTime = { ...newTimes[index], [field]: value };

      if (field === "open_always" && value === true) {
        updatedTime.closed_always = false;
      }
      if (field === "closed_always" && value === true) {
        updatedTime.open_always = false;
      }

      newTimes[index] = updatedTime;
      return newTimes;
    });
  };

  const handleNext = () => {
    onNext({
      open_status: openStatus,
      workingtimes: workingTimes,
    });
  };

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto py-4 px-4">
        <Breadcrumb items={breadcrumbItems} className="mb-4" />
        <StepperProgress currentStep={4} steps={steps} />

        <div className="grid grid-cols-12 gap-6 mt-8">
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">
                أوقات العمل و العطلات
              </h2>

              <div className="space-y-6 mb-10">
                <OpenStatusOption
                  value="open_with_working_times"
                  label="مفتوح خلال ساعات عمل معينه"
                  description="أظهر متى يكون عملك مفتوحاً"
                  selected={openStatus === "open_with_working_times"}
                  onClick={() => setOpenStatus("open_with_working_times")}
                />

                <OpenStatusOption
                  value="open_without_working_times"
                  label="مفتوح بدون ساعات عمل معينة"
                  description="لا تظهر ساعات عمل معينة"
                  selected={openStatus === "open_without_working_times"}
                  onClick={() => setOpenStatus("open_without_working_times")}
                />

                <OpenStatusOption
                  value="temporary_closed"
                  label="مغلق بشكل مؤقت"
                  description="أظهر أن عملنا سيكون متاحاً في المستقبل"
                  selected={openStatus === "temporary_closed"}
                  onClick={() => setOpenStatus("temporary_closed")}
                />

                <OpenStatusOption
                  value="closed"
                  label="مغلق بشكل دائم"
                  description="أظهر أن عملنا لم يعد موجوداً"
                  selected={openStatus === "closed"}
                  onClick={() => setOpenStatus("closed")}
                />
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
                      <div
                        key={index}
                        className="grid grid-cols-12 gap-4 items-center"
                      >
                        <div className="col-span-12 md:col-span-2">
                          <span className="text-sm font-medium">
                            {DAYS.find((d) => d.value === time.day)?.label}
                          </span>
                        </div>

                        <div className="col-span-6 md:col-span-3 flex">
                          <TimePicker
                            value={time.from}
                            onChange={(val) =>
                              updateWorkingTime(index, "from", val)
                            }
                            disabled={time.open_always || time.closed_always}
                          />
                        </div>

                        <div className="col-span-6 md:col-span-3 flex">
                          <TimePicker
                            value={time.to}
                            onChange={(val) =>
                              updateWorkingTime(index, "to", val)
                            }
                            disabled={time.open_always || time.closed_always}
                          />
                        </div>

                        <div className="col-span-12 md:col-span-4 flex flex-row gap-4">
                          <CustomCheckbox
                            label="مفتوح 24 ساعة"
                            checked={time.open_always || false}
                            onChange={(checked) =>
                              updateWorkingTime(index, "open_always", checked)
                            }
                          />

                          <CustomCheckbox
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
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <StorePreviewSidebar
              data={{
                logo: previousData.logo_preview,
                name: previousData.name,
                description: previousData.description,
                coverImages: previousData.cover_previews,
              }}
            />
            <GuideVideoCard location="create-store" />
          </div>
        </div>
      </div>

      <StoreFormActions onNext={handleNext} onBack={onBack} />
    </div>
  );
}

interface OpenStatusOptionProps {
  value: OpenStatus;
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
    <div
      onClick={onClick}
      className="flex items-center gap-3 cursor-pointer group"
    >
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
        <h4 className={cn("font-bold text-sm mb-1 transition-colors")}>
          {label}
        </h4>
        <p className="text-xs text-gray-1">{description}</p>
      </div>
    </div>
  );
}

interface CustomCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function CustomCheckbox({ label, checked, onChange }: CustomCheckboxProps) {
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