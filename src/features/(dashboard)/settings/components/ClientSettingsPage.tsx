// src/features/(dashboard)/settings/components/ClientSettingsPage.tsx
"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { Button } from "@/src/components/ui/button";

import { BasicInfoSection } from "./BasicInfoSection";
import { TermsSection } from "./TermsSection";
import { PrivacyPolicySection } from "./PrivacyPolicySection";
import { SocialMediaSection } from "./SocialMediaSection";
import { useGetSettings, useUpdateSettings } from "../hooks";
import { toast } from "sonner";
import type { PolicyItemPayload } from "../api";

// Types for form data
interface BasicInfoData {
  siteName: string;
  logo: File | null;
  logoPreview: string | null;
  email: string;
  address: string;
  phone: string;
  whatsapp: string;
  mainColor: string;
}

interface SocialMediaData {
  facebook: string;
  instagram: string;
  youtube: string;
  twitter: string;
  tiktok: string;
  snapchat: string;
}

interface PolicyParagraph {
  id: string;
  titleAr: string;
  titleEn: string;
  image: File | null;
  imageUrl: string | null;
  contentAr: string;
  contentEn: string;
}

interface SettingsFormData {
  basicInfo: BasicInfoData;
  socialMedia: SocialMediaData;
  languages: string[];
  privacyPolicies: PolicyParagraph[];
  terms: PolicyParagraph[];
}

// --- (1) قمنا بتعريف مصفوفة الأقسام هنا (بدون الكومبوننت) ---
const settingsItems = [
  {
    id: "basic-info",
    title: "البيانات الأساسية",
    isCompleted: true,
  },
  {
    id: "social-media",
    title: "بيانات السوشيل ميديا",
    isCompleted: true,
  },
  {
    id: "privacy-policy",
    title: "سياسات الخصوصية",
    isCompleted: true,
  },
  {
    id: "terms-of-use",
    title: "شروط الاستخدام",
    isCompleted: true,
  },
];
// --- (نهاية التعديل الأول) ---

export function ClientSettingsPage() {
  const { data: settingsData, isLoading, error } = useGetSettings();
  const updateSettingsMutation = useUpdateSettings();

  const [formData, setFormData] = useState<SettingsFormData>({
    basicInfo: {
      siteName: "",
      logo: null,
      logoPreview: null,
      email: "",
      address: "",
      phone: "",
      whatsapp: "",
      mainColor: "#000000",
    },
    socialMedia: {
      facebook: "",
      instagram: "",
      youtube: "",
      twitter: "",
      tiktok: "",
      snapchat: "",
    },
    languages: ["ar", "en"],
    privacyPolicies: [],
    terms: [],
  });

  // تحميل البيانات الأولية
  useEffect(() => {
    if (settingsData?.settings) {
      const settings = settingsData.settings;
      
      setFormData({
        basicInfo: {
          siteName: settings.name || "",
          logo: null,
          logoPreview: settings.logo_url || null,
          email: settings.email || "",
          address: settings.address || "",
          phone: settings.phone || "",
          whatsapp: settings.whatsapp || "",
          mainColor: settings.main_color || "#000000",
        },
        socialMedia: {
          facebook: settings.facebook || "",
          instagram: settings.instagram || "",
          youtube: settings.youtube || "",
          twitter: settings.x || "",
          tiktok: settings.tiktok || "",
          snapchat: settings.snapchat || "",
        },
        languages: settings.languages || ["ar", "en"],
        privacyPolicies: settings.policies?.map((policy, index: number) => ({
          id: `policy-${index}`,
          titleAr: policy.title?.ar || "",
          titleEn: policy.title?.en || "",
          image: null,
          imageUrl: policy.logo_url || null,
          contentAr: policy.content?.ar || "",
          contentEn: policy.content?.en || "",
        })) || [],
        terms: settings.terms?.map((term, index: number) => ({
          id: `term-${index}`,
          titleAr: term.title?.ar || "",
          titleEn: term.title?.en || "",
          image: null,
          imageUrl: term.logo_url || null,
          contentAr: term.content?.ar || "",
          contentEn: term.content?.en || "",
        })) || [],
      });
    }
  }, [settingsData]);

  // Handler functions
  const handleBasicInfoChange = (data: Partial<BasicInfoData>) => {
    setFormData((prev) => ({
      ...prev,
      basicInfo: { ...prev.basicInfo, ...data },
    }));
  };

  const handleSocialMediaChange = (data: Partial<SocialMediaData>) => {
    setFormData((prev) => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, ...data },
    }));
  };

  const handleLanguagesChange = (languages: string[]) => {
    setFormData((prev) => ({ ...prev, languages }));
  };

  const handlePrivacyPoliciesChange = (paragraphs: PolicyParagraph[]) => {
    setFormData((prev) => ({
      ...prev,
      privacyPolicies: paragraphs,
    }));
  };

  const handleTermsChange = (paragraphs: PolicyParagraph[]) => {
    setFormData((prev) => ({
      ...prev,
      terms: paragraphs,
    }));
  };

  // Save all settings
  const handleSaveAll = async () => {
    try {
      const policiesPayload: PolicyItemPayload[] = formData.privacyPolicies.map(
        (p) => ({
          title: { en: p.titleEn, ar: p.titleAr },
          content: { en: p.contentEn, ar: p.contentAr },
          logo: p.image,
        })
      );

      const termsPayload: PolicyItemPayload[] = formData.terms.map((p) => ({
        title: { en: p.titleEn, ar: p.titleAr },
        content: { en: p.contentEn, ar: p.contentAr },
        logo: p.image,
      }));

      await updateSettingsMutation.mutateAsync({
        name: formData.basicInfo.siteName,
        logo: formData.basicInfo.logo,
        main_color: formData.basicInfo.mainColor,
        email: formData.basicInfo.email,
        address: formData.basicInfo.address,
        whatsapp: formData.basicInfo.whatsapp,
        phone: formData.basicInfo.phone,
        languages: formData.languages,
        facebook: formData.socialMedia.facebook,
        instagram: formData.socialMedia.instagram,
        snapchat: formData.socialMedia.snapchat,
        tiktok: formData.socialMedia.tiktok,
        x: formData.socialMedia.twitter,
        youtube: formData.socialMedia.youtube,
        policies: policiesPayload,
        terms: termsPayload,
      });

      toast.success("تم حفظ جميع الإعدادات بنجاح");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("حدث خطأ أثناء حفظ الإعدادات");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-4 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الإعدادات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">حدث خطأ في تحميل الإعدادات</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-4 text-white rounded-lg hover:bg-blue-3"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto my-8">
        <Accordion type="single" collapsible className="space-y-3">
          {settingsItems.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <AccordionTrigger className="w-full flex items-center justify-between p-6 hover:no-underline hover:bg-gray-50 transition-colors [&[data-state=open]>div>svg]:rotate-180">
                <div className="flex items-center gap-3">
                  {item.isCompleted && (
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                  <h1 className="font-semibold text-lg">{item.title}</h1>
                </div>
              </AccordionTrigger>
              <AccordionContent 
                forceMount // (للحفاظ على الحالة عند الإغلاق)
                className="border-t border-gray-200 p-6 bg-gray-50/50 data-[state=closed]:hidden"
              >
                {/* --- (2) هذا هو التعديل الأهم --- */}
                {/* نقوم بعرض الكومبوننت الصحيح بناءً على الـ ID */}
                
                {item.id === 'basic-info' && (
                  <BasicInfoSection
                    data={formData.basicInfo}
                    languages={formData.languages}
                    onChange={handleBasicInfoChange}
                    onLanguagesChange={handleLanguagesChange}
                  />
                )}
                
                {item.id === 'social-media' && (
                  <SocialMediaSection
                    data={formData.socialMedia}
                    onChange={handleSocialMediaChange}
                  />
                )}
                
                {item.id === 'privacy-policy' && (
                  <PrivacyPolicySection
                    selectedLanguages={formData.languages}
                    paragraphs={formData.privacyPolicies}
                    onChange={handlePrivacyPoliciesChange}
                  />
                )}
                
                {item.id === 'terms-of-use' && (
                  <TermsSection
                    selectedLanguages={formData.languages}
                    paragraphs={formData.terms}
                    onChange={handleTermsChange}
                  />
                )}
                {/* --- (نهاية التعديل الثاني) --- */}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* زر الحفظ الرئيسي */}
        <div className="flex justify-center mt-8">
          <Button
            onClick={handleSaveAll}
            disabled={updateSettingsMutation.isPending}
            className="px-12 py-3 bg-blue-4 text-white rounded-lg hover:bg-blue-3 font-medium text-base transition-colors"
          >
            {updateSettingsMutation.isPending ? "جاري الحفظ..." : "حفظ جميع الإعدادات"}
          </Button>
        </div>
      </div>
    </div>
  );
}