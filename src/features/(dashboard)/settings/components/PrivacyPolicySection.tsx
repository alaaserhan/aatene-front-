// src/features/(dashboard)/settings/components/PrivacyPolicySection.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Trash2 } from "lucide-react";
import { RichTextEditor } from "./RichTextEditor";
import { ImageUpload } from "./ImageUpload";
import { cn } from "@/src/lib/utils";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { useUpdateSettings } from "../hooks";
import { toast } from "sonner";

interface PolicyParagraph {
  id: string;
  titleAr: string;
  titleEn: string;
  image: File | null;
  imageUrl: string | null;
  contentAr: string;
  contentEn: string;
}

const POLICY_TAGS = [
  { id: "intro", label: "المقدمة" },
  { id: "collection", label: "المعلومات التي نجمعها" },
  { id: "usage", label: "كيفية إستخدام المعلومات" },
  { id: "sharing", label: "مشاركة البيانات" },
];

interface PrivacyPolicySectionProps {
  selectedLanguages?: string[];
  initialData?: any;
}

export function PrivacyPolicySection({
  selectedLanguages = ["ar", "en", "he"],
  initialData,
}: PrivacyPolicySectionProps) {
  const [activeTags, setActiveTags] = useState<string[]>([
    "intro",
    "collection",
    "usage",
    "sharing",
  ]);
  const [paragraphs, setParagraphs] = useState<PolicyParagraph[]>([]);
  const [isAdding, setIsAdding] = useState(false);
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

  const updateSettingsMutation = useUpdateSettings();

  // تحميل البيانات الأولية
  useEffect(() => {
    if (initialData) {
      if (initialData.policies && Array.isArray(initialData.policies)) {
        const loadedParagraphs = initialData.policies.map((policy: any, index: number) => ({
          id: `policy-${index}`,
          titleAr: policy.title_ar || "",
          titleEn: policy.title_en || "",
          image: null,
          imageUrl: policy.logo_url || null,
          contentAr: policy.content_ar || "",
          contentEn: policy.content_en || "",
        }));
        setParagraphs(loadedParagraphs);
      }

      if (initialData.added_policies && Array.isArray(initialData.added_policies)) {
        setActiveTags(initialData.added_policies);
      }
    }
  }, [initialData]);

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
      imageUrl: null,
      contentAr: "",
      contentEn: "",
    });
    setIsAdding(false);
  };

  const handleSaveAll = async () => {
    try {
      const policiesPayload = paragraphs.map((p) => ({
        title_ar: p.titleAr,
        title_en: p.titleEn,
        content_ar: p.contentAr,
        content_en: p.contentEn,
        logo: p.image,
      }));

      await updateSettingsMutation.mutateAsync({
        name: initialData?.name || "",
        logo: null,
        main_color: initialData?.main_color || "#000000",
        email: initialData?.email || "",
        address: initialData?.address || "",
        whatsapp: initialData?.whatsapp || "",
        phone: initialData?.phone || "",
        facebook: initialData?.facebook || "",
        instagram: initialData?.instagram || "",
        snapchat: initialData?.snapchat || "",
        tiktok: initialData?.tiktok || "",
        x: initialData?.x || "",
        youtube: initialData?.youtube || "",
        added_privacy_policies: activeTags,
        policies: policiesPayload,
        added_terms: initialData?.added_terms || [],
        terms: initialData?.terms || [],
      });
      toast.success("تم حفظ سياسات الخصوصية بنجاح");
    } catch (error) {
      console.error("Error saving privacy policies:", error);
    }
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
      <div className="bg-[#5B88BA33] rounded-lg p-6">
        <h3 className="text-base font-medium mb-4">السياسات المضافة</h3>
        <div className="flex flex-wrap gap-3">
          {POLICY_TAGS.filter((tag) => activeTags.includes(tag.id)).map(
            (tag, index) => (
              <div
                key={tag.id}
                className="flex items-center gap-2 px-2.5 py-2 bg-white border border-blue-4 rounded-full"
              >
                <div className="w-3 h-3 bg-blue-4 rounded-full text-[8px] text-white flex items-center justify-center">
                  <span className="pt-px">{index + 1}</span>
                </div>
                <span className="text-sm text-gray-900">{tag.label}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag.id)}
                  className="cursor-pointer"
                  aria-label={`حذف ${tag.label}`}
                >
                  <X className="w-4 h-4 text-blue-4" strokeWidth={2} />
                </button>
              </div>
            )
          )}
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="font-medium text-blue-2">إضافة عنوان</h3>

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
            className="w-full  border-gray-300 rounded-lg h-12 px-4"
          />
        </div>

        <div className="space-y-2">
          <Label className="block font-medium text-blue-2 ">
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
          <Label className="block font-medium text-blue-2 ">الوصف</Label>
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
                      ? "bg-blue-4 text-white "
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
            isRtl={languageTab === "ar"}
          />
        </div>

        <div className="flex gap-3 justify-center pt-2">
          <Button
            type="button"
            onClick={handleSaveParagraph}
            className="px-8 py-2.5 bg-blue-3 text-white rounded-lg font-medium  transition-colors"
          >
            إضافة الفقرة
          </Button>
        </div>
      </div>


      {/* Save All Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={handleSaveAll}
          variant="link"
          disabled={updateSettingsMutation.isPending}
        >
          {updateSettingsMutation.isPending
            ? "جاري الحفظ..."
            : "حفظ سياسات الخصوصية"}
        </Button>
      </div>
    </div>
  );
}