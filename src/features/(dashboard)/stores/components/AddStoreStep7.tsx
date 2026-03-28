// src/features/(dashboard)/stores/components/AddStoreStep7.tsx
"use client";
import { useState, KeyboardEvent, useEffect } from "react";
import { StepperProgress } from "./StepperProgress";
import { StorePreviewSidebar } from "./StorePreviewSidebar";
import { GuideVideoCard } from "../../user-guide/components/GuideVideoCard";
import { StoreFormActions } from "./StoreFormActions";
import { StoreType } from "../api";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { OptionTag } from "@/src/components/ui/OptionTag";
import { Step2FormData, Step7FormData } from "../types";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { Loader2 } from "lucide-react";

interface AddStoreStep7Props {
  storeType: StoreType;
  previousData: Step2FormData;
  initialData?: Step7FormData;
  onSave: (data: Step7FormData) => Promise<void>;
  onBack: () => void;
  isSubmitting?: boolean;
  barSteps: { number: number; label: string; completed: boolean }[];
  isGeneratingAI?: boolean;
  aiKeywords?: string[];
}

export function AddStoreStep7({
  storeType,
  previousData,
  initialData,
  onSave,
  onBack,
  isSubmitting = false,
  barSteps,
  isGeneratingAI = false,
  aiKeywords = [],
}: AddStoreStep7Props) {
  const [tags, setTags] = useState<string[]>(() => {
    const rawTags = initialData?.tags;

    if (!rawTags || rawTags.length === 0) return [];

    if (typeof rawTags[0] === "object" && rawTags[0] !== null) {
      return (rawTags as unknown as { title: string }[]).map((tag) => tag.title || "");
    }

    return rawTags as string[];
  });

  useEffect(() => {
    if (initialData?.tags && initialData.tags.length > 0) {
      const rawTags = initialData.tags;
      queueMicrotask(() => {
        if (typeof rawTags[0] === "object" && rawTags[0] !== null) {
          setTags((rawTags as unknown as { title: string }[]).map((tag) => tag.title || ""));
        } else {
          setTags(rawTags as string[]);
        }
      });
    }
  }, [initialData?.tags]);

  const [inputValue, setInputValue] = useState("");

  const steps = barSteps;

  const breadcrumbItems = [
    { label: "الرئيسية", href: "/admin/home" },
    { label: "المتاجر", href: "/admin/stores" },
    { label: "إضافة متجر" },
  ];

  const handleAddTag = () => {
    const newTag = inputValue.trim();

    if (!newTag) return;

    if (tags.includes(newTag)) {
      toast.error("الكلمة المفتاحية مضافة بالفعل");
      return;
    }

    if (tags.length >= 10) {
      toast.error("لا يمكن إضافة أكثر من 10 كلمات مفتاحية");
      return;
    }

    setTags([...tags, newTag]);
    setInputValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (aiKeywords.length > 0 && aiKeywords.includes(tagToRemove)) {
      const currentAiTagsCount = tags.filter(tag => aiKeywords.includes(tag)).length;
      if (currentAiTagsCount <= 3) {
        toast.error("يجب الإبقاء على 3 كلمات مفتاحية من المولدة بالذكاء الاصطناعي على الأقل");
        return;
      }
    } else {
      if (aiKeywords.length === 0 && tags.length <= 3) {
        toast.error("يجب الإبقاء على 3 كلمات مفتاحية على الأقل");
        return;
      }
    }
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSave = async () => {
    await onSave({ tags });
  };

  const keywordsDescription = `الكلمات المفتاحية هي مصطلحات أو عبارات تصف محتوى الصفحة أو الموضوع. وتستخدم لتحسين البحث والوصول للمحتوى بسهولة. مثل: "تعليم", "برمجة", "تصميم".`;

  return (
    <div className="">
      <div className="container mx-auto py-4 px-4">
        <Breadcrumb items={breadcrumbItems} className="mb-4" />

        <StepperProgress currentStep={6} steps={steps} />

        <div className="grid grid-cols-12 gap-6 mt-8">
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">الكلمات المفتاحية
                  {isGeneratingAI && <Loader2 className="w-4 h-4 mb-1  animate-spin text-blue-3" />}
                </h2>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h3 className="text-sm font-medium">الكلمات المفتاحية</h3>
                  <Tooltip
                    trigger={
                      <div className="flex items-center gap-1 text-blue-4 cursor-pointer hover:text-blue-500 transition-colors">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">
                          ماهي الكلمات المفتاحية
                        </span>
                      </div>
                    }
                    content={keywordsDescription}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={isGeneratingAI ? "جاري توليد الكلمات المفتاحية..." : "اكتب الوسم هنا..."}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-sm focus:outline-none  text-sm transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!inputValue.trim()}
                    className="px-6 py-2.5 bg-blue-4 text-white rounded-sm text-sm font-medium hover:bg-[#2c425e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    اضافة
                  </button>
                </div>

                {/* Tags List Section (Below Input) */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 ">
                    {tags.map((tag, index) => (
                      <OptionTag
                        key={index}
                        label={tag}
                        onRemove={() => removeTag(tag)}
                        showRemoveButton={tags.length > 3}
                      />
                    ))}
                  </div>
                )}

              </div>
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

      <StoreFormActions
        onNext={handleSave}
        onBack={onBack}
        nextLabel="حفظ المتجر"
        isSubmitting={isSubmitting}
      />
    </div>
  );
}