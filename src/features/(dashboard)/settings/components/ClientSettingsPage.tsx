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
import type { PolicyItemPayload, TranslatableString } from "../api";

interface BasicInfoData {
  siteName: string;
  logo: string | null;
  logo_url: string | null;
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
  titleHe: string;
  logo: string | null;
  logo_url: string | null;
  contentAr: string;
  contentEn: string;
  contentHe: string;
}

interface SettingsFormData {
  basicInfo: BasicInfoData;
  socialMedia: SocialMediaData;
  languages: string[];
  privacyPolicies: PolicyParagraph[];
  terms: PolicyParagraph[];
}

const settingsItems = [
  {
    id: "basic-info",
    title: "البيانات الأساسية",
    isCompleted: true,
  },
  {
    id: "social-media",
    title: "بيانات السوشيال ميديا",
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

const createTranslatablePayload = (
  base: { Ar: string; En: string; He: string },
  languages: string[]
): TranslatableString => {
  const payload: TranslatableString = {};

  if (languages.includes("ar")) {
    payload.ar = base.Ar;
  }
  if (languages.includes("en")) {
    payload.en = base.En;
  }
  if (languages.includes("he")) {
    payload.he = base.He;
  }
  return payload;
};

export function ClientSettingsPage() {
  const { data: settingsData, isLoading, error } = useGetSettings();
  const updateSettingsMutation = useUpdateSettings();

  const [formData, setFormData] = useState<SettingsFormData>({
    basicInfo: {
      siteName: "",
      logo: null,
      logo_url: null,
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

  useEffect(() => {
    if (settingsData?.settings) {
      const settings = settingsData.settings;

      setFormData({
        basicInfo: {
          siteName: settings.name || "",
          logo: settings.logo || null,
          logo_url: settings.logo_url || null,
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
        privacyPolicies:
          settings.policies?.map((policy, index: number) => ({
            id: `policy-${index}`,
            titleAr: policy.title?.ar || "",
            titleEn: policy.title?.en || "",
            titleHe: policy.title?.he || "",
            logo: policy.logo || null,
            logo_url: policy.logo_url || null,
            contentAr: policy.content?.ar || "",
            contentEn: policy.content?.en || "",
            contentHe: policy.content?.he || "",
          })) || [],
        terms:
          settings.terms?.map((term, index: number) => ({
            id: `term-${index}`,
            titleAr: term.title?.ar || "",
            titleEn: term.title?.en || "",
            titleHe: term.title?.he || "",
            logo: term.logo || null,
            logo_url: term.logo_url || null,
            contentAr: term.content?.ar || "",
            contentEn: term.content?.en || "",
            contentHe: term.content?.he || "",
          })) || [],
      });
    }
  }, [settingsData]);

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

const handleSaveAll = async () => {
    try {
      const selectedLangs = formData.languages;

      const policiesPayload: PolicyItemPayload[] = formData.privacyPolicies.map(
        (p) => ({
          title: createTranslatablePayload(
            { Ar: p.titleAr, En: p.titleEn, He: p.titleHe },
            selectedLangs
          ),
          content: createTranslatablePayload(
            { Ar: p.contentAr, En: p.contentEn, He: p.contentHe },
            selectedLangs
          ),
          logo: p.logo,
        })
      );

      const termsPayload: PolicyItemPayload[] = formData.terms.map((p) => ({
        title: createTranslatablePayload(
          { Ar: p.titleAr, En: p.titleEn, He: p.titleHe },
          selectedLangs
        ),
        content: createTranslatablePayload(
          { Ar: p.contentAr, En: p.contentEn, He: p.contentHe },
          selectedLangs
        ),
        logo: p.logo,
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
    } catch (error) {
      
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
        <Accordion
          type="single"
          collapsible
          className="space-y-3"
          defaultValue="basic-info"
        >
          {settingsItems.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <AccordionTrigger iconStyle="plus-minus" className="w-full flex items-center justify-between p-6 hover:no-underline hover:bg-gray-50 transition-colors [&[data-state=open]>div>svg]:rotate-180">
                <div className="flex items-center gap-3">
                  {item.isCompleted && (
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1FC16B]">
                      <img src="/icons/dashboard/correct2.svg" className="w-3" alt="" />
                    </div>
                  )}
                  <h1 className="font-bold text-lg">{item.title}</h1>
                </div>
              </AccordionTrigger>
              <AccordionContent className="border-t border-gray-200 p-6 bg-gray-50/50">
                {item.id === "basic-info" && (
                  <BasicInfoSection
                    data={formData.basicInfo}
                    languages={formData.languages}
                    onChange={handleBasicInfoChange}
                    onLanguagesChange={handleLanguagesChange}
                  />
                )}

                {item.id === "social-media" && (
                  <SocialMediaSection
                    data={formData.socialMedia}
                    onChange={handleSocialMediaChange}
                  />
                )}

                {item.id === "privacy-policy" && (
                  <PrivacyPolicySection
                    selectedLanguages={formData.languages}
                    paragraphs={formData.privacyPolicies}
                    onChange={handlePrivacyPoliciesChange}
                  />
                )}

                {item.id === "terms-of-use" && (
                  <TermsSection
                    selectedLanguages={formData.languages}
                    paragraphs={formData.terms}
                    onChange={handleTermsChange}
                  />
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="flex justify-center mt-8">
          <Button
            onClick={handleSaveAll}
            disabled={updateSettingsMutation.isPending}
            className="px-8 py-2 bg-blue-3 text-white rounded-md hover:bg-blue-3 font-medium text-sm transition-colors"
          >
            {updateSettingsMutation.isPending
              ? "جاري الحفظ..."
              : "حفظ الإعدادات"}
          </Button>
        </div>
      </div>
    </div>
  );
}