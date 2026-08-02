// src/features/(dashboard)/stores/create/products/steps/WorkingHoursStep.tsx
"use client";

import { useState } from "react";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { StepperProgress } from "../../../components/StepperProgress";
import { StoreFormActions } from "../../../components/StoreFormActions";
import {
  StoreWorkingHoursFields,
  defaultWorkingTimes,
} from "../../../components/StoreWorkingHoursFields";
import { OpenStatus, WorkingTimePayload } from "../../../api";
import { StoreWorkingHoursValues, WizardStep } from "../../../types";
import { STORE_WIZARD_BREADCRUMB } from "../breadcrumb";

interface WorkingHoursStepProps {
  initialData?: StoreWorkingHoursValues;
  onNext: (data: StoreWorkingHoursValues) => void;
  onBack: () => void;
  steps: WizardStep[];
  currentStepNumber: number;
}

export function WorkingHoursStep({
  initialData,
  onNext,
  onBack,
  steps,
  currentStepNumber,
}: WorkingHoursStepProps) {
  const [openStatus, setOpenStatus] = useState<OpenStatus>(
    initialData?.open_status || "open_with_working_times"
  );

  const [workingTimes, setWorkingTimes] = useState<WorkingTimePayload[]>(
    initialData?.workingtimes?.length
      ? initialData.workingtimes
      : defaultWorkingTimes()
  );

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto py-4 px-4">
        <Breadcrumb items={STORE_WIZARD_BREADCRUMB} className="mb-4" />
        <StepperProgress currentStep={currentStepNumber} steps={steps} />

        <div className="grid grid-cols-12 gap-6 mt-8">
          <div className="col-span-12">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">
                أوقات العمل و العطلات
              </h2>

              <StoreWorkingHoursFields
                openStatus={openStatus}
                workingTimes={workingTimes}
                onOpenStatusChange={setOpenStatus}
                onWorkingTimesChange={setWorkingTimes}
              />
            </div>
          </div>
        </div>
      </div>

      <StoreFormActions
        sticky
        onNext={() =>
          onNext({ open_status: openStatus, workingtimes: workingTimes })
        }
        onBack={onBack}
      />
    </div>
  );
}
