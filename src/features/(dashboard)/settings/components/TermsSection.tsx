// src/features/(dashboard)/settings/components/TermsSection.tsx
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { RichTextEditor } from "../../../../components/ui/RichTextEditor";
import { cn } from "@/src/lib/utils";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { MediaSelectButton } from "../../mediaCenter/components/MediaSelectButton";
import { toast } from "sonner";

interface PolicyParagraph {
  id: string;
  titleAr: string;
  titleEn: string;
  titleHe: string;
  logo: string | null;
  logo_url: string | null;
  contentAr: string;
  contentEn: string;
  contentHe: string;
}

interface TermsSectionProps {
  selectedLanguages: string[];
  paragraphs: PolicyParagraph[];
  onChange: (paragraphs: PolicyParagraph[]) => void;
}

const isContentEmpty = (content: string) => {
  if (!content) return true;
  return content.replace(/<[^>]*>?/gm, "").trim().length === 0;
};

export function TermsSection({
  selectedLanguages = ["ar", "en"],
  paragraphs,
  onChange,
}: TermsSectionProps) {
  const [currentParagraph, setCurrentParagraph] = useState<PolicyParagraph>({
    id: Date.now().toString(),
    titleAr: "",
    titleEn: "",
    titleHe: "",
    logo: null,
    logo_url: null,
    contentAr: "",
    contentEn: "",
    contentHe: "",
  });
  const [languageTab, setLanguageTab] = useState<"ar" | "en" | "he">("ar");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const availableLanguages =
    selectedLanguages.length > 0 ? selectedLanguages : ["ar"];

  const handleRemoveParagraph = (index: number) => {
    const newParagraphs = paragraphs.filter((_, i) => i !== index);
    onChange(newParagraphs);

    if (editingIndex === index) {
      resetForm();
    }
  };

  const handleTagClick = (index: number) => {
    if (editingIndex === index) {
      resetForm();
      return;
    }

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
      titleHe: "",
      logo: null,
      logo_url: null,
      contentAr: "",
      contentEn: "",
      contentHe: "",
    });
    setEditingIndex(null);
    setLanguageTab("ar");
  };

  const handleSaveParagraph = () => {
    let isValid = true;
    for (const lang of availableLanguages) {
      if (lang === "ar") {
        if (
          !currentParagraph.titleAr.trim() ||
          isContentEmpty(currentParagraph.contentAr)
        ) {
          isValid = false;
        }
      }
      if (lang === "en") {
        if (
          !currentParagraph.titleEn.trim() ||
          isContentEmpty(currentParagraph.contentEn)
        ) {
          isValid = false;
        }
      }
      if (lang === "he") {
        if (
          !currentParagraph.titleHe.trim() ||
          isContentEmpty(currentParagraph.contentHe)
        ) {
          isValid = false;
        }
      }
    }

    if (!isValid) {
      toast.error("يرجى ملء حقلي العنوان والمحتوى لجميع اللغات المحددة.");
      return;
    }

    if (editingIndex !== null) {
      const newParagraphs = [...paragraphs];
      newParagraphs[editingIndex] = currentParagraph;
      onChange(newParagraphs);
    } else {
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

  return (
    <div className="space-y-6">
      {paragraphs.length > 0 && (
        <div className="bg-[#5B88BA33] rounded-lg p-6">
          <h3 className="text-base font-medium mb-4">الشروط المضافة</h3>
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
                <div
                  className={cn(
                    "w-3 h-3 rounded-full text-[8px] flex items-center justify-center",
                    editingIndex === index
                      ? "bg-white text-blue-4"
                      : "bg-blue-4 text-white"
                  )}
                >
                  <span className="pt-px">{index + 1}</span>
                </div>
                <span className="text-sm">
                  {paragraph.titleAr ||
                    paragraph.titleEn ||
                    paragraph.titleHe ||
                    `شرط ${index + 1}`}
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
                  <X
                    className={cn(
                      "w-4 h-4",
                      editingIndex === index ? "text-white" : "text-blue-4"
                    )}
                    strokeWidth={2}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <h3 className="font-medium text-blue-2">
          {editingIndex !== null ? "تعديل الشرط" : "إضافة شرط جديد"}
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            {availableLanguages.map((lang) => (
              <Button
                key={lang}
                type="button"
                onClick={() => setLanguageTab(lang as "ar" | "en" | "he")}
                variant={languageTab === lang ? "default" : "outline"}
                className={cn(
                  "px-6 py-2 rounded-full font-normal transition-colors",
                  languageTab === lang
                    ? "bg-blue-4 text-white"
                    : "bg-white text-gray-2 border-gray-300 hover:bg-gray-50"
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
                : languageTab === "en"
                  ? currentParagraph.titleEn
                  : currentParagraph.titleHe
            }
            onChange={(e) =>
              setCurrentParagraph({
                ...currentParagraph,
                [languageTab === "ar"
                  ? "titleAr"
                  : languageTab === "en"
                    ? "titleEn"
                    : "titleHe"]: e.target.value,
              })
            }
            placeholder="أضف عنوان الشرط..."
            className="w-full border-gray-300 rounded-lg h-12 px-4"
          />
        </div>

        <div className="space-y-2">
          <MediaSelectButton
            label="إضافة صورة (اختياري)"
            width={700}
            height={400}
            value={currentParagraph.logo}
            previewUrl={currentParagraph.logo_url}
            onChange={(fileName, src) =>
              setCurrentParagraph({
                ...currentParagraph,
                logo: fileName,
                logo_url: src,
              })
            }
            accept="image/png,image/jpeg,image/jpg"
            primaryText="أضف صورة للشرط"
            infoText={[]}
            allowedMediaTypes={["gallery", "image"]}
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
                  onClick={() => setLanguageTab(lang as "ar" | "en" | "he")}
                  variant={languageTab === lang ? "default" : "outline"}
                  className={cn(
                    "px-6 py-2 rounded-full font-normal transition-colors",
                    languageTab === lang
                      ? "bg-blue-4 text-white"
                      : "bg-white text-gray-2 border-gray-300 hover:bg-gray-50"
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
                : languageTab === "en"
                  ? currentParagraph.contentEn
                  : currentParagraph.contentHe
            }
            onChange={(value) =>
              setCurrentParagraph({
                ...currentParagraph,
                [languageTab === "ar"
                  ? "contentAr"
                  : languageTab === "en"
                    ? "contentEn"
                    : "contentHe"]: value,
              })
            }
            placeholder="أضف وصف مميز..."
            dir={languageTab === "en" ? "ltr" : "rtl"}
            label=""
            helpText=""
            helpTooltip=""
            className="max-h-[400px] min-h-[200px]"
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
            {editingIndex !== null ? "تحديث الشرط" : "إضافة الشرط"}
          </Button>
        </div>
      </div>
    </div>
  );
}