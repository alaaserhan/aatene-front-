// src/features/(dashboard)/stores/create/products/steps/KeywordsStep.tsx
"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { StepperProgress } from "../../../components/StepperProgress";
import { StoreFormActions } from "../../../components/StoreFormActions";
import {
  StoreKeywordsFields,
  normalizeTagList,
} from "../../../components/StoreKeywordsFields";
import { StoreKeywordsValues, WizardStep } from "../../../types";
import { STORE_WIZARD_BREADCRUMB } from "../breadcrumb";

interface KeywordsStepProps {
  initialData?: StoreKeywordsValues;
  onSave: (data: StoreKeywordsValues) => Promise<void>;
  onBack: () => void;
  isSubmitting?: boolean;
  steps: WizardStep[];
  currentStepNumber: number;
  isGeneratingAI?: boolean;
  aiKeywords?: string[];
}

export function KeywordsStep({
  initialData,
  onSave,
  onBack,
  isSubmitting = false,
  steps,
  currentStepNumber,
  isGeneratingAI = false,
  aiKeywords = [],
}: KeywordsStepProps) {
  const [tags, setTags] = useState<string[]>(() =>
    normalizeTagList(initialData?.tags)
  );

  // The AI generator fills the tags in asynchronously while this step is open
  useEffect(() => {
    if (initialData?.tags?.length) setTags(normalizeTagList(initialData.tags));
  }, [initialData?.tags]);

  return (
    <div>
      <div className="container mx-auto py-4 px-4">
        <Breadcrumb items={STORE_WIZARD_BREADCRUMB} className="mb-4" />
        <StepperProgress currentStep={currentStepNumber} steps={steps} />

        <div className="grid grid-cols-12 gap-6 mt-8">
          <div className="col-span-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  الكلمات المفتاحية
                  {isGeneratingAI && (
                    <Loader2 className="w-4 h-4 mb-1 animate-spin text-blue-3" />
                  )}
                </h2>
              </div>

              <div className="p-6">
                <StoreKeywordsFields
                  tags={tags}
                  onChange={setTags}
                  type="product"
                  aiKeywords={aiKeywords}
                  isGeneratingAI={isGeneratingAI}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <StoreFormActions
        sticky
        onNext={() => void onSave({ tags })}
        onBack={onBack}
        nextLabel="حفظ المتجر"
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
