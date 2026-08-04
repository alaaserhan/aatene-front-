// src/features/(dashboard)/stores/settings/sections/KeywordsSection.tsx
"use client";

import { storeTypeToTagType } from "@/src/features/(dashboard)/tags/api";
import { useState } from "react";
import { StoreKeywordsFields } from "../../components/StoreKeywordsFields";
import { StoreKeywordsValues } from "../../types";
import { useUpdateStoreTags } from "../hooks";
import { SettingsSection } from "./SettingsSection";

interface KeywordsSectionProps {
  storeId: number;
  initialValues: StoreKeywordsValues;
  /** Scopes the tag suggestions to the store's own type */
  storeType: string;
  /** Used as the AI prompt — both come from the main data section. */
  storeName: string;
  storeDescription: string;
}

export function KeywordsSection({
  storeId,
  initialValues,
  storeType,
}: KeywordsSectionProps) {
  const [tags, setTags] = useState<string[]>(initialValues.tags);
  // const [aiKeywords, setAiKeywords] = useState<string[]>([]);

  const mutation = useUpdateStoreTags(storeId);
  // const { mutateAsync: generateAI, isPending: isGeneratingAI } =
  //   useGenerateStoreAI();

  // const handleGenerate = async () => {
  //   const name = storeName.trim();
  //   const description = storeDescription.trim();

  //   if (!name) {
  //     toast.error("أضف اسم المتجر أولاً من قسم البيانات الأساسية");
  //     return;
  //   }

  //   const descriptionError = getStoreDescriptionValidationError(description);
  //   if (descriptionError) {
  //     toast.error(descriptionError);
  //     return;
  //   }

  //   try {
  //     const response = await generateAI({ name, description });
  //     const keywords = response.results?.keywords ?? [];

  //     if (keywords.length === 0) {
  //       toast.error(
  //         "لم نتمكن من إكمال العملية. حاول توسيع وصف المتجر ثم أعد المحاولة."
  //       );
  //       return;
  //     }

  //     setAiKeywords(keywords);
  //     setTags(keywords);
  //   } catch (error) {
  //     console.error("AI Generation Error:", error);
  //   }
  // };

  return (
    <SettingsSection
      value="keywords"
      isSaving={mutation.isPending}
      onSave={() => mutation.mutate({ tags })}
    >
      <div className="space-y-4">
        {/* <button
          type="button"
          onClick={handleGenerate}
          disabled={isGeneratingAI}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-blue-4 bg-blue-6 text-blue-4 text-sm font-medium cursor-pointer transition-colors hover:bg-blue-5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingAI ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {isGeneratingAI ? "جاري التوليد..." : "توليد بالذكاء الاصطناعي"}
        </button> */}

        <StoreKeywordsFields
          tags={tags}
          onChange={setTags}
          type={storeTypeToTagType(storeType)}
        />
      </div>
    </SettingsSection>
  );
}
