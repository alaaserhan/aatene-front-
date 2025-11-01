"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { RichTextEditor } from "./RichTextEditor";
import { ImageUpload } from "./ImageUpload";
import { cn } from "@/src/lib/utils";

interface TermsParagraph {
  id: string;
  titleAr: string;
  titleEn: string;
  image: File | null;
  contentAr: string;
  contentEn: string;
}

const TERMS_TAGS = [
  { id: "terms", label: "قبول الشروط" },
  { id: "intellectual", label: "حقوق الملكية الفكرية" },
  { id: "account", label: "إنشاء الحساب والمسؤولية" },
  { id: "usage", label: "استخدام المنصة" },
];

export function TermsSection() {
  const [activeTags, setActiveTags] = useState<string[]>(["terms", "intellectual", "account", "usage"]);
  const [paragraphs, setParagraphs] = useState<TermsParagraph[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [currentParagraph, setCurrentParagraph] = useState<TermsParagraph>({
    id: Date.now().toString(),
    titleAr: "",
    titleEn: "",
    image: null,
    contentAr: "",
    contentEn: "",
  });
  const [languageTab, setLanguageTab] = useState<"ar" | "en">("ar");

  const handleRemoveTag = (tagId: string) => {
    setActiveTags(activeTags.filter((id) => id !== tagId));
  };

  const handleAddParagraph = () => {
    setIsAdding(true);
  };

  const handleSaveParagraph = () => {
    setParagraphs([...paragraphs, currentParagraph]);
    setCurrentParagraph({
      id: Date.now().toString(),
      titleAr: "",
      titleEn: "",
      image: null,
      contentAr: "",
      contentEn: "",
    });
    setIsAdding(false);
  };

  const handleCancelAdd = () => {
    setCurrentParagraph({
      id: Date.now().toString(),
      titleAr: "",
      titleEn: "",
      image: null,
      contentAr: "",
      contentEn: "",
    });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Terms Tags */}
      <div className="bg-brand-blue-1/30 rounded-lg p-4">
        <h3 className="text-sm font-medium text-brand-black-1 text-right mb-3">
          شروط الاستخدام المضافة
        </h3>
        <div className="flex flex-wrap gap-2 justify-end">
          {TERMS_TAGS.filter((tag) => activeTags.includes(tag.id)).map((tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-brand-blue-2 rounded-full text-sm"
            >
              <button
                type="button"
                onClick={() => handleRemoveTag(tag.id)}
                className="hover:bg-gray-100 rounded-full p-0.5 transition-colors"
              >
                <X className="w-4 h-4 text-brand-blue-3" />
              </button>
              <span className="text-brand-black-1 font-medium">{tag.label}</span>
              <div className="w-2 h-2 bg-brand-blue-3 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Add Paragraph Form */}
      {isAdding ? (
        <div className="space-y-6 bg-white border-2 border-brand-blue-2 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-brand-black-1 text-right">
            إضافة شرط جديد
          </h3>

          {/* Language Tabs */}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setLanguageTab("en")}
              className={cn(
                "px-6 py-2 rounded-lg font-medium transition-colors",
                languageTab === "en"
                  ? "bg-brand-blue-3 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              )}
            >
              العنوان بالعبري
            </button>
            <button
              type="button"
              onClick={() => setLanguageTab("ar")}
              className={cn(
                "px-6 py-2 rounded-lg font-medium transition-colors",
                languageTab === "ar"
                  ? "bg-brand-blue-3 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              )}
            >
              العنوان بالعربي
            </button>
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <input
              type="text"
              value={languageTab === "ar" ? currentParagraph.titleAr : currentParagraph.titleEn}
              onChange={(e) =>
                setCurrentParagraph({
                  ...currentParagraph,
                  [languageTab === "ar" ? "titleAr" : "titleEn"]: e.target.value,
                })
              }
              placeholder="أضف عنوان الشرط..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-blue-2 text-right"
              dir={languageTab === "ar" ? "rtl" : "ltr"}
            />
          </div>

          {/* Image Upload */}
          <ImageUpload
            label="إضافة صورة (اختياري)"
            optional
            value={currentParagraph.image}
            onChange={(image) =>
              setCurrentParagraph({ ...currentParagraph, image })
            }
          />

          {/* Content Tabs */}
          <div>
            <h4 className="text-sm font-medium text-brand-black-1 text-right mb-3">
              الوصف
            </h4>
            <div className="flex gap-2 justify-end mb-4">
              <button
                type="button"
                onClick={() => setLanguageTab("en")}
                className={cn(
                  "px-6 py-2 rounded-lg font-medium transition-colors",
                  languageTab === "en"
                    ? "bg-brand-blue-3 text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                )}
              >
                المحتوى العبري
              </button>
              <button
                type="button"
                onClick={() => setLanguageTab("ar")}
                className={cn(
                  "px-6 py-2 rounded-lg font-medium transition-colors",
                  languageTab === "ar"
                    ? "bg-brand-blue-3 text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                )}
              >
                المحتوى العربي
              </button>
            </div>

            {/* Rich Text Editor */}
            <RichTextEditor
              value={languageTab === "ar" ? currentParagraph.contentAr : currentParagraph.contentEn}
              onChange={(value) =>
                setCurrentParagraph({
                  ...currentParagraph,
                  [languageTab === "ar" ? "contentAr" : "contentEn"]: value,
                })
              }
              placeholder="أضف وصف مميز..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleCancelAdd}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSaveParagraph}
              className="px-8 py-3 bg-brand-blue-3 text-white rounded-lg font-medium hover:bg-brand-blue-2 transition-colors"
            >
              إضافة الفقرة
            </button>
          </div>
        </div>
      ) : (
        /* Add Button */
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleAddParagraph}
            className="px-8 py-3 bg-brand-blue-3 text-white rounded-lg font-medium hover:bg-brand-blue-2 transition-colors"
          >
            إضافة فقرة
          </button>
        </div>
      )}

      {/* Display Added Paragraphs */}
      {paragraphs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-brand-black-1 text-right">
            الشروط المضافة
          </h3>
          {paragraphs.map((para) => (
            <div
              key={para.id}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <button
                  type="button"
                  onClick={() =>
                    setParagraphs(paragraphs.filter((p) => p.id !== para.id))
                  }
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex-1 text-right">
                  <h4 className="font-semibold text-brand-black-1">{para.titleAr}</h4>
                  {para.titleEn && (
                    <p className="text-sm text-gray-600 mt-1">{para.titleEn}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}