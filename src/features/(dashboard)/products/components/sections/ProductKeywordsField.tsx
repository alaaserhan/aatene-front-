// src/features/(dashboard)/products/components/sections/ProductKeywordsField.tsx
"use client";

import { HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { TagSearchInput } from "@/src/components/ui/TagSearchInput";
import { Tooltip } from "@/src/components/ui/Tooltip";

const MAX_TAGS = 10;
const MIN_TAGS = 3;

const KEYWORDS_DESCRIPTION = `الكلمات المفتاحية هي مصطلحات أو عبارات تصف محتوى الصفحة أو الموضوع. وتستخدم لتحسين البحث والوصول للمحتوى بسهولة. مثل: "موبايل", "سامسونج" ,"حذاء أحمر", "الكترونيات".`;

interface ProductKeywordsFieldProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  /** Keywords produced by the AI generator — at least 3 must be kept. */
  aiKeywords?: string[];
  isGeneratingAI?: boolean;
}

/** الكلمات المفتاحية field backed by the tags endpoint (same input used in store settings) */
export function ProductKeywordsField({
  tags,
  onChange,
  aiKeywords = [],
  isGeneratingAI = false,
}: ProductKeywordsFieldProps) {
  /** Returns true on a successful add so the input clears */
  const addTag = (newTag: string): boolean => {
    if (tags.includes(newTag)) {
      toast.error("الكلمة المفتاحية مضافة بالفعل");
      return false;
    }

    if (tags.length >= MAX_TAGS) {
      toast.error(`لا يمكن إضافة أكثر من ${MAX_TAGS} كلمات مفتاحية`);
      return false;
    }

    onChange([...tags, newTag]);
    return true;
  };

  const removeTag = (tagToRemove: string) => {
    if (aiKeywords.length > 0 && aiKeywords.includes(tagToRemove)) {
      const remainingAiTags = tags.filter((tag) => aiKeywords.includes(tag));
      if (remainingAiTags.length <= MIN_TAGS) {
        toast.error(
          `يجب الإبقاء على ${MIN_TAGS} كلمات مفتاحية من المولدة بالذكاء الاصطناعي على الأقل`
        );
        return;
      }
    } else if (aiKeywords.length === 0 && tags.length <= MIN_TAGS) {
      toast.error(`يجب الإبقاء على ${MIN_TAGS} كلمات مفتاحية على الأقل`);
      return;
    }

    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="text-sm font-medium">الكلمات المفتاحية</h3>
        <Tooltip
          trigger={
            <div className="flex items-center gap-1 text-blue-4 cursor-pointer hover:text-blue-500 transition-colors">
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="text-xs font-medium pt-px">ما هي الكلمات المفتاحية</span>
            </div>
          }
          content={KEYWORDS_DESCRIPTION}
        />
      </div>

      <TagSearchInput
        tags={tags}
        onAdd={addTag}
        onRemove={removeTag}
        type="product"
        showRemoveButton={tags.length > MIN_TAGS}
        disabled={isGeneratingAI}
        placeholder={
          isGeneratingAI
            ? "جاري توليد الكلمات المفتاحية..."
            : "ابحث عن كلمة مفتاحية أو أضف كلمة جديدة"
        }
        inputClassName="py-2.5"
      />
    </div>
  );
}
