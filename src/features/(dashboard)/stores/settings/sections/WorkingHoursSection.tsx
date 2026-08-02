// src/features/(dashboard)/stores/settings/sections/WorkingHoursSection.tsx
"use client";

import { useState } from "react";
import { StoreWorkingHoursFields } from "../../components/StoreWorkingHoursFields";
import { OpenStatus, WorkingTimePayload } from "../../api";
import { StoreWorkingHoursValues } from "../../types";
import { useUpdateStoreWorkingHours } from "../hooks";
import { SettingsSection } from "./SettingsSection";

interface WorkingHoursSectionProps {
  storeId: number;
  initialValues: StoreWorkingHoursValues;
}

export function WorkingHoursSection({
  storeId,
  initialValues,
}: WorkingHoursSectionProps) {
  const [openStatus, setOpenStatus] = useState<OpenStatus>(
    initialValues.open_status
  );
  const [workingTimes, setWorkingTimes] = useState<WorkingTimePayload[]>(
    initialValues.workingtimes
  );

  const mutation = useUpdateStoreWorkingHours(storeId);

  const handleSave = () => {
    mutation.mutate({
      open_status: openStatus,
      // Day rows are only meaningful for the "specific hours" status
      workingtimes:
        openStatus === "open_with_working_times" ? workingTimes : [],
    });
  };

  return (
    <SettingsSection
      value="workingHours"
      title="أوقات العمل والعطلات"
      description="حالة المتجر ومواعيد العمل خلال أيام الأسبوع"
      isSaving={mutation.isPending}
      onSave={handleSave}
    >
      <StoreWorkingHoursFields
        openStatus={openStatus}
        workingTimes={workingTimes}
        onOpenStatusChange={setOpenStatus}
        onWorkingTimesChange={setWorkingTimes}
      />
    </SettingsSection>
  );
}
