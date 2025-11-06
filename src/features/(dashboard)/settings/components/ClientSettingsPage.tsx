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

import { BasicInfoSection } from "./BasicInfoSection";
import { TermsSection } from "./TermsSection";
import { PrivacyPolicySection } from "./PrivacyPolicySection";
import { SocialMediaSection } from "./SocialMediaSection";
import { useGetSettings } from "../hooks";

export function ClientSettingsPage() {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  
  const { data: settingsData, isLoading, error } = useGetSettings();

  useEffect(() => {
    if (settingsData?.settings?.languages) {
      setSelectedLanguages(settingsData.settings.languages);
    }
  }, [settingsData]);

  const handleLanguagesChange = (languages: string[]) => {
    setSelectedLanguages(languages);
  };

  const settingsItems = [
    {
      id: "basic-info",
      title: "البيانات الأساسية",
      isCompleted: true,
      Content: () => (
        <BasicInfoSection
          onLanguagesChange={handleLanguagesChange}
          initialData={settingsData?.settings}
          selectedLanguages={selectedLanguages} // <-- (1) تم إضافة هذا السطر
        />
      ),
    },
    // ... (باقي الأقسام كما هي)
    {
      id: "social-media",
      title: "بيانات السوشيل ميديا",
      isCompleted: true,
      Content: () => (
        <SocialMediaSection initialData={settingsData?.settings} />
      ),
    },
    {
      id: "privacy-policy",
      title: "سياسات الخصوصية",
      isCompleted: true,
      Content: () => (
        <PrivacyPolicySection
          selectedLanguages={selectedLanguages}
          initialData={settingsData?.settings}
        />
      ),
    },
    {
      id: "terms-of-use",
      title: "شروط الاستخدام",
      isCompleted: true,
      Content: () => (
        <TermsSection
          selectedLanguages={selectedLanguages}
          initialData={settingsData?.settings}
        />
      ),
    },
  ];

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
              <AccordionContent className="border-t border-gray-200 p-6 bg-gray-50/50">
                <item.Content />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}