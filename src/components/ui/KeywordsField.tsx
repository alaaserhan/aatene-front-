// src/components/ui/KeywordsField.tsx
"use client";

import { Label } from "@/src/components/ui/label";
import { TagSearchInput } from "@/src/components/ui/TagSearchInput";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { TagType } from "@/src/features/(dashboard)/tags/api";
import { HelpCircle } from "lucide-react";
import { toast } from "sonner";

const MAX_KEYWORDS = 10;

interface KeywordsFieldProps {
  value: string[];
  onChange: (keywords: string[]) => void;
  /** Filters the tag suggestions to product or service tags */
  type: TagType;
}

/**
 * Keywords (optional) — pick an existing tag from the database or add a new one.
 * Shared by the service and product forms. Manual only: there is deliberately no
 * AI generation here, so the field never calls the n8n webhook.
 */
export function KeywordsField({ value, onChange, type }: KeywordsFieldProps) {
  const handleAdd = (keyword: string): boolean => {
    if (value.includes(keyword)) {
      toast.error("الكلمة المفتاحية مضافة بالفعل");
      return false;
    }
    if (value.length >= MAX_KEYWORDS) {
      toast.error(`الحد الأقصى للكلمات المفتاحية هو ${MAX_KEYWORDS}`);
      return false;
    }
    onChange([...value, keyword]);
    return true;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">الكلمات المفتاحية (اختياري)</Label>
        <Tooltip
          trigger={
            <div className="flex items-center gap-1 text-blue-4 cursor-pointer transition-colors hover:text-blue-500">
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="text-xs font-medium pt-px">ما هي الكلمات المفتاحية</span>
            </div>
          }
          content={
            type === "product"
              ? "الكلمات المفتاحية مصطلحات تصف محتوى المنتج وتُحسّن ظهوره في البحث. ابحث عن كلمة موجودة واخترها، أو أضف كلمة جديدة."
              : "الكلمات المفتاحية مصطلحات تصف محتوى الخدمة وتُحسّن ظهورها في البحث. ابحث عن كلمة موجودة واخترها، أو أضف كلمة جديدة."
          }
        />
      </div>

      <TagSearchInput
        tags={value}
        onAdd={handleAdd}
        onRemove={(keyword) => onChange(value.filter((k) => k !== keyword))}
        type={type}
        placeholder="ابحث عن كلمة مفتاحية أو أضف كلمة جديدة"
      />
    </div>
  );
}
