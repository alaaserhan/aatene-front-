// src/features/(dashboard)/services/components/form/fields/ExecutionDurationField.tsx
"use client";

import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { ReusableDropdown } from "@/src/components/ui/ReusableDropdown";
import { ExecuteType } from "@/src/features/(dashboard)/services/api";
import { EXECUTE_TYPE_OPTIONS } from "../constants";

interface ExecutionDurationFieldProps {
  count: number | string;
  type: ExecuteType;
  onCountChange: (count: string) => void;
  onTypeChange: (type: ExecuteType) => void;
}

/** Execution duration: count + time unit */
export function ExecutionDurationField({
  count,
  type,
  onCountChange,
  onTypeChange,
}: ExecutionDurationFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">مدة تنفيذ العمل</Label>
      <div className="flex gap-4">
        <div className="relative min-w-0 flex-1">
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            value={count}
            onChange={(e) => onCountChange(e.target.value)}
            className="h-12 w-full min-w-0 rounded-lg border border-gray-200 px-4 text-center text-sm transition-all focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="0"
          />
        </div>
        <div className="w-[140px]">
          <ReusableDropdown
            options={EXECUTE_TYPE_OPTIONS}
            value={type}
            onChange={(val) => onTypeChange(val as ExecuteType)}
            className="h-12"
          />
        </div>
      </div>
    </div>
  );
}
