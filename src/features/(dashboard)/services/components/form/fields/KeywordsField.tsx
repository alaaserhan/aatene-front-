// src/features/(dashboard)/services/components/form/fields/KeywordsField.tsx
"use client";

import { useState } from "react";
import { HelpCircle, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/src/components/ui/label";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { Button } from "@/src/components/ui/button";
import { useGenerateProductAI } from "@/src/features/(dashboard)/products/hooks";
import { MAX_KEYWORDS } from "../constants";
import { TagInput } from "./TagInput";

interface KeywordsFieldProps {
  value: string[];
  onChange: (keywords: string[]) => void;
  /** Used to generate the keywords via AI */
  title: string;
  description: string;
}

const stripHtml = (html: string) => {
  const el = document.createElement("div");
  el.innerHTML = html;
  return (el.textContent || el.innerText || "").trim();
};

/** Keywords (optional) — manual entry or AI generation from the title and description */
export function KeywordsField({ value, onChange, title, description }: KeywordsFieldProps) {
  const generateAI = useGenerateProductAI();
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleGenerate = async () => {
    const descText = stripHtml(description);
    if (!title.trim() || !descText) {
      toast.error("يرجى إدخال عنوان ووصف للخدمة أولاً لتوليد الكلمات المفتاحية");
      return;
    }

    setIsGenerating(true);
    try {
      const data = await generateAI.mutateAsync({
        title: title.trim(),
        description: descText,
        type: "service",
      });
      const keywords = data.results?.keywords ?? [];
      if (keywords.length > 0) {
        onChange(keywords.slice(0, MAX_KEYWORDS));
        toast.success("تم توليد الكلمات المفتاحية بنجاح");
      } else {
        toast.warning("لم تُستخرج كلمات مفتاحية — جرّب تعديل الوصف وأعد المحاولة");
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      toast.error("فشل توليد الكلمات المفتاحية");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">الكلمات المفتاحية (اختياري)</Label>
        <Tooltip
          trigger={
            <div className="flex items-center gap-1 text-blue-4 cursor-pointer transition-colors hover:text-blue-500">
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">ماهي الكلمات المفتاحية</span>
            </div>
          }
          content="الكلمات المفتاحية مصطلحات تصف محتوى الخدمة وتُحسّن ظهورها في البحث."
        />
      </div>

      <TagInput
        tags={value}
        onAdd={handleAdd}
        onRemove={(keyword) => onChange(value.filter((k) => k !== keyword))}
        placeholder="اضف الكلمة المفتاحية ثم اضغط علي اضافة"
      />

      <Button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating}
        className="flex items-center gap-2 bg-blue-4 hover:bg-blue-500"
      >
        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {isGenerating ? "جاري التوليد..." : "توليد الكلمات المفتاحية من الوصف"}
      </Button>
    </div>
  );
}
