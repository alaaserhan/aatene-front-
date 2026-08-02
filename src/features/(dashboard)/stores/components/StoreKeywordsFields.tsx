// src/features/(dashboard)/stores/components/StoreKeywordsFields.tsx
"use client";

import { KeyboardEvent, useState } from "react";
import { HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { OptionTag } from "@/src/components/ui/OptionTag";
import { Tooltip } from "@/src/components/ui/Tooltip";

const MAX_TAGS = 10;
const MIN_TAGS = 3;

const KEYWORDS_DESCRIPTION = `الكلمات المفتاحية هي مصطلحات أو عبارات تصف محتوى الصفحة أو الموضوع. وتستخدم لتحسين البحث والوصول للمحتوى بسهولة. مثل: "تعليم", "برمجة", "تصميم".`;

/** Tags coming back from the API can be plain strings or `{ title }` objects. */
export function normalizeTagList(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((tag) => {
      if (typeof tag === "string") return tag.trim();
      if (tag && typeof tag === "object" && "title" in tag) {
        return String((tag as { title?: unknown }).title ?? "").trim();
      }
      return "";
    })
    .filter(Boolean);
}

interface StoreKeywordsFieldsProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  /** Keywords produced by the AI generator — at least 3 must be kept. */
  aiKeywords?: string[];
  isGeneratingAI?: boolean;
}

export function StoreKeywordsFields({
  tags,
  onChange,
  aiKeywords = [],
  isGeneratingAI = false,
}: StoreKeywordsFieldsProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = () => {
    const newTag = inputValue.trim();
    if (!newTag) return;

    if (tags.includes(newTag)) {
      toast.error("الكلمة المفتاحية مضافة بالفعل");
      return;
    }

    if (tags.length >= MAX_TAGS) {
      toast.error(`لا يمكن إضافة أكثر من ${MAX_TAGS} كلمات مفتاحية`);
      return;
    }

    onChange([...tags, newTag]);
    setInputValue("");
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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="text-sm font-medium">الكلمات المفتاحية</h3>
        <Tooltip
          trigger={
            <div className="flex items-center gap-1 text-blue-4 cursor-pointer hover:text-blue-500 transition-colors">
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">ماهي الكلمات المفتاحية</span>
            </div>
          }
          content={KEYWORDS_DESCRIPTION}
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isGeneratingAI
              ? "جاري توليد الكلمات المفتاحية..."
              : "اكتب الوسم هنا..."
          }
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-sm focus:outline-none text-sm transition-all"
        />
        <button
          type="button"
          onClick={addTag}
          disabled={!inputValue.trim()}
          className="px-6 py-2.5 bg-blue-4 text-white rounded-sm text-sm font-medium hover:bg-[#2c425e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          إضافة
        </button>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {tags.map((tag) => (
            <OptionTag
              key={tag}
              label={tag}
              onRemove={() => removeTag(tag)}
              showRemoveButton={tags.length > MIN_TAGS}
            />
          ))}
        </div>
      )}
    </div>
  );
}
