// src/features/(dashboard)/settings/components/PrivacyPolicySection.tsx
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { RichTextEditor } from "./RichTextEditor";
import { ImageUpload } from "./ImageUpload";
import { cn } from "@/src/lib/utils";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";

interface PolicyParagraph {
  id: string;
  titleAr: string;
  titleEn: string;
  image: File | null;
  imageUrl: string | null;
  contentAr: string;
  contentEn: string;
}

interface PrivacyPolicySectionProps {
  selectedLanguages: string[];
  paragraphs: PolicyParagraph[];
  onChange: (paragraphs: PolicyParagraph[]) => void;
}

export function PrivacyPolicySection({
  selectedLanguages = ["ar", "en"],
  paragraphs,
  onChange,
}: PrivacyPolicySectionProps) {
  const [currentParagraph, setCurrentParagraph] = useState<PolicyParagraph>({
    id: Date.now().toString(),
    titleAr: "",
    titleEn: "",
    image: null,
    imageUrl: null,
    contentAr: "",
    contentEn: "",
  });
  const [languageTab, setLanguageTab] = useState<"ar" | "en">("ar");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleRemoveParagraph = (index: number) => {
    const newParagraphs = paragraphs.filter((_, i) => i !== index);
    onChange(newParagraphs);
    
    // إذا كنا نحرر هذه الفقرة، نلغي التحرير
    if (editingIndex === index) {
      resetForm();
    }
  };

  const handleTagClick = (index: number) => {
    // إذا ضغطنا على نفس الـ tag المحدد، نلغي التحديد
    if (editingIndex === index) {
      resetForm();
      return;
    }

    // نحمل بيانات الفقرة المختارة
    const paragraph = paragraphs[index];
    setCurrentParagraph(paragraph);
    setEditingIndex(index);
    setLanguageTab("ar");
  };

  const resetForm = () => {
    setCurrentParagraph({
      id: Date.now().toString(),
      titleAr: "",
      titleEn: "",
      image: null,
      imageUrl: null,
      contentAr: "",
      contentEn: "",
    });
    setEditingIndex(null);
    setLanguageTab("ar");
  };

  const handleSaveParagraph = () => {
    if (editingIndex !== null) {
      // تحديث فقرة موجودة
      const newParagraphs = [...paragraphs];
      newParagraphs[editingIndex] = currentParagraph;
      onChange(newParagraphs);
    } else {
      // إضافة فقرة جديدة
      onChange([...paragraphs, currentParagraph]);
    }
    resetForm();
  };

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case "ar":
        return { title: "العنوان بالعربي", content: "المحتوى العربي" };
      case "en":
        return { title: "العنوان بالإنجليزي", content: "المحتوى الإنجليزي" };
      case "he":
        return { title: "العنوان بالعبري", content: "المحتوى العبري" };
      default:
        return { title: "العنوان", content: "المحتوى" };
    }
  };

  const availableLanguages =
    selectedLanguages.includes("ar") ||
    selectedLanguages.includes("en") ||
    selectedLanguages.includes("he")
      ? selectedLanguages
      : ["ar"];

  return (
    <div className="space-y-6">
      {/* Policy Tags Section */}
      {paragraphs.length > 0 && (
        <div className="bg-[#5B88BA33] rounded-lg p-6">
          <h3 className="text-base font-medium mb-4">السياسات المضافة</h3>
          <div className="flex flex-wrap gap-3">
            {paragraphs.map((paragraph, index) => (
              <div
                key={paragraph.id}
                onClick={() => handleTagClick(index)}
                className={cn(
                  "flex items-center gap-2 px-2.5 py-2 border rounded-full cursor-pointer transition-all",
                  editingIndex === index
                    ? "bg-blue-4 border-blue-4 text-white"
                    : "bg-white border-blue-4 hover:bg-blue-50"
                )}
              >
                <div className={cn(
                  "w-3 h-3 rounded-full text-[8px] flex items-center justify-center",
                  editingIndex === index ? "bg-white text-blue-4" : "bg-blue-4 text-white"
                )}>
                  <span className="pt-px">{index + 1}</span>
                </div>
                <span className="text-sm">
                  {paragraph.titleAr || paragraph.titleEn || `سياسة ${index + 1}`}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveParagraph(index);
                  }}
                  className="cursor-pointer hover:scale-110 transition-transform"
                  aria-label={`حذف ${paragraph.titleAr}`}
                >
                  <X className={cn(
                    "w-4 h-4",
                    editingIndex === index ? "text-white" : "text-blue-4"
                  )} strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <h3 className="font-medium text-blue-2">
          {editingIndex !== null ? "تعديل السياسة" : "إضافة سياسة جديدة"}
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            {availableLanguages.map((lang) => (
              <Button
                key={lang}
                type="button"
                onClick={() => setLanguageTab(lang as "ar" | "en")}
                variant={languageTab === lang ? "default" : "outline"}
                className={cn(
                  "px-6 py-2 rounded-full font-normal transition-colors",
                  languageTab === lang
                    ? "bg-blue-4 text-white"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                )}
              >
                {getLanguageLabel(lang).title}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Input
            type="text"
            value={
              languageTab === "ar"
                ? currentParagraph.titleAr
                : currentParagraph.titleEn
            }
            onChange={(e) =>
              setCurrentParagraph({
                ...currentParagraph,
                [languageTab === "ar" ? "titleAr" : "titleEn"]: e.target.value,
              })
            }
            placeholder="أضف عنوان السياسة..."
            className="w-full border-gray-300 rounded-lg h-12 px-4"
          />
        </div>

        <div className="space-y-2">
          <Label className="block font-medium text-blue-2">
            إضافة صورة (اختياري)
          </Label>
          <ImageUpload
            label=""
            optional={false}
            value={currentParagraph.image || currentParagraph.imageUrl}
            onChange={(image) =>
              setCurrentParagraph({ ...currentParagraph, image })
            }
          />
        </div>

        <div className="space-y-4">
          <Label className="block font-medium text-blue-2">الوصف</Label>
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              {availableLanguages.map((lang) => (
                <Button
                  key={lang}
                  type="button"
                  onClick={() => setLanguageTab(lang as "ar" | "en")}
                  variant={languageTab === lang ? "default" : "outline"}
                  className={cn(
                    "px-6 py-2 rounded-full font-normal transition-colors",
                    languageTab === lang
                      ? "bg-blue-4 text-white"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                  )}
                >
                  {getLanguageLabel(lang).content}
                </Button>
              ))}
            </div>
          </div>

          <RichTextEditor
            value={
              languageTab === "ar"
                ? currentParagraph.contentAr
                : currentParagraph.contentEn
            }
            onChange={(value) =>
              setCurrentParagraph({
                ...currentParagraph,
                [languageTab === "ar" ? "contentAr" : "contentEn"]: value,
              })
            }
            placeholder="أضف وصف مميز..."
            isRtl={languageTab === "ar" || languageTab}
          />
        </div>

        <div className="flex gap-3 justify-center pt-2">
          {editingIndex !== null && (
            <Button
              type="button"
              onClick={resetForm}
              variant="outline"
              className="px-8 py-2.5 border-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
            >
              إلغاء
            </Button>
          )}
          <Button
            type="button"
            onClick={handleSaveParagraph}
            className="px-8 py-2.5 bg-blue-3 text-white rounded-lg font-medium transition-colors"
          >
            {editingIndex !== null ? "تحديث السياسة" : "إضافة السياسة"}
          </Button>
        </div>
      </div>
    </div>
  );
}