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

interface AddStoreStep7Props {
  storeType: StoreType;
  previousData: Step2FormData;
  initialData?: Step7FormData;
  onSave: (data: Step7FormData) => Promise<void>;
  onBack: () => void;
  isSubmitting?: boolean;
  barSteps: { number: number; label: string; completed: boolean }[];
}

const TooltipContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`absolute z-50 p-3 bg-white border border-gray-200 rounded-lg shadow-lg max-w-xs text-xs text-gray-600 leading-relaxed top-full mt-2 right-0 ${className}`}
    style={{ width: "300px", whiteSpace: "normal", direction: "rtl" }}
  >
    {children}
  </div>
);

const Tooltip = ({
  trigger,
  content,
}: {
  trigger: React.ReactNode;
  content: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative inline-block "
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {trigger}
      {isOpen && <TooltipContent className="">{content}</TooltipContent>}
    </div>
  );
};

export function AddStoreStep7({
  storeType,
  previousData,
  initialData,
  onSave,
  onBack,
  isSubmitting = false,
  barSteps
}: AddStoreStep7Props) {
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [inputValue, setInputValue] = useState("");

  const steps = barSteps;

  const breadcrumbItems = [
    { label: "الرئيسية", href: "/admin" },
    { label: "المتاجر", href: "/admin/stores" },
    { label: "إضافة متجر" },
  ];

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 ">
              <div className="p-6 flex justify-between items-center">
                <h2 className="text-xl font-medium">الكلمات المفتاحية</h2>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h3 className="text-base font-medium">الكلمات المفتاحية</h3>
                  <Tooltip
                    trigger={
                      <div className="flex items-center gap-1 text-blue-4 cursor-pointer">
                        <HelpCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">
                          ماهي الكلمات المفتاحية
                        </span>
                      </div>
                    }
                    content={
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {keywordsDescription}
                      </p>
                    }
                  />
                </div>

                <div className="min-h-[50px] p-2 border border-gray-300 rounded-lg focus-within:border-blue-3 focus-within:ring-1 focus-within:ring-blue-3 bg-white flex flex-wrap gap-2 items-center">
                  {tags.map((tag, index) => (
                    <OptionTag
                      key={index}
                      label={tag}
                      onRemove={() => removeTag(tag)}
                      showRemoveButton={true}
                    />
                  ))}

                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      tags.length === 0 ? "اضف الوسم ثم اضغط علي اضافة" : ""
                    }
                    className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400 min-w-[150px] h-8"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2 text-end">
                  اضغط Enter لإضافة الكلمة
                </p>
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