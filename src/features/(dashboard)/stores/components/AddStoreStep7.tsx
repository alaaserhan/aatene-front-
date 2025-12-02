// src/features/(dashboard)/stores/components/AddStoreStep7.tsx
"use client";
import { useState, KeyboardEvent } from "react";
import { StepperProgress } from "./StepperProgress";
import { StorePreviewSidebar } from "./StorePreviewSidebar";
import { StoreFormActions } from "./StoreFormActions";
import { StoreType } from "../api";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { OptionTag } from "@/src/components/ui/OptionTag";
import { Step2FormData, Step7FormData } from "../types";
import { Tooltip } from "@/src/components/ui/Tooltip";

interface AddStoreStep7Props {
  storeType: StoreType;
  previousData: Step2FormData;
  initialData?: Step7FormData;
  onSave: (data: Step7FormData) => Promise<void>;
  onBack: () => void;
  isSubmitting?: boolean;
  barSteps: { number: number; label: string; completed: boolean }[];
}

export function AddStoreStep7({
  storeType,
  previousData,
  initialData,
  onSave,
  onBack,
  isSubmitting = false,
  barSteps,
}: AddStoreStep7Props) {
  const [tags, setTags] = useState<string[]>(() => {
    const rawTags = initialData?.tags;

    if (!rawTags || rawTags.length === 0) return [];

    if (typeof rawTags[0] === "object" && rawTags[0] !== null) {
      return (rawTags as unknown as { title: string }[]).map((tag) => tag.title || "");
    }

    return rawTags as string[];
  });

  const [inputValue, setInputValue] = useState("");

  const steps = barSteps;

  const breadcrumbItems = [
    { label: "الرئيسية", href: "/admin" },
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
                <h2 className="text-xl font-bold">الكلمات المفتاحية</h2>
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
                      placeholder="اكتب الوسم هنا..."
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
                        showRemoveButton={true}
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