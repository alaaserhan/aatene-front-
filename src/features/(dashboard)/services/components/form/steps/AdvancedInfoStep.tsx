// src/features/(dashboard)/services/components/form/steps/AdvancedInfoStep.tsx
"use client";

import { ExecuteType } from "@/src/features/(dashboard)/services/api";
import { ExecutionDurationField } from "../fields/ExecutionDurationField";
import { SpecialtiesField } from "../fields/SpecialtiesField";
import { KeywordsField } from "@/src/components/ui/KeywordsField";
import { ServiceExtrasField } from "../fields/ServiceExtrasField";
import { ServiceFaqField } from "../fields/ServiceFaqField";
import { ServiceFormValues } from "../types";

interface AdvancedInfoStepProps {
  values: ServiceFormValues;
  setField: <K extends keyof ServiceFormValues>(key: K, value: ServiceFormValues[K]) => void;
}

const Divider = () => <div className="h-px my-8" />;

export function AdvancedInfoStep({ values, setField }: AdvancedInfoStepProps) {
  return (
    <div className="bg-white rounded-xl p-6 pb-10 border border-gray-200 shadow-sm">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">المعلومات المتقدمة</h2>
          <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-500">
            اختياري
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-2">
          كل الحقول في هذه الخطوة اختيارية — يمكنك نشر الخدمة مباشرةً دون تعبئتها.
        </p>
      </div>

      {/* 1. Execution duration */}
      <ExecutionDurationField
        count={values.execute_count}
        type={values.execute_type}
        onCountChange={(count) => setField("execute_count", count)}
        onTypeChange={(type: ExecuteType) => setField("execute_type", type)}
      />

      <Divider />

      {/* 2. Specialties / fields of work */}
      <SpecialtiesField
        value={values.specialties}
        onChange={(specialties) => setField("specialties", specialties)}
      />

      <Divider />

      {/* 3. Keywords */}
      <KeywordsField
        value={values.tags}
        onChange={(tags) => setField("tags", tags)}
        type="service"
      />

      <Divider />

      {/* 4. Service extras */}
      <ServiceExtrasField value={values.extras} onChange={(extras) => setField("extras", extras)} />

      <Divider />

      {/* 5. FAQ */}
      <ServiceFaqField value={values.questions} onChange={(questions) => setField("questions", questions)} />
    </div>
  );
}
