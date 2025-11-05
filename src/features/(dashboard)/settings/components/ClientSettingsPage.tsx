// src/features/(dashboard)/settings/components/ClientSettingsPage.tsx
"use client";

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

const settingsItems = [
  {
    id: "basic-info",
    title: "البيانات الأساسية",
    isCompleted: true,
    Content: BasicInfoSection,
  },
  {
    id: "social-media",
    title: "بيانات السوشيل ميديا",
    isCompleted: true,
    Content: SocialMediaSection,
  },
  {
    id: "privacy-policy",
    title: "سياسات الخصوصية",
    isCompleted: true,
    Content: PrivacyPolicySection,
  },
  {
    id: "terms-of-use",
    title: "شروط الاستخدام",
    isCompleted: true,
    Content: TermsSection,
  },
];

export function ClientSettingsPage() {
  return (
    <div>
      <div className="container mx-auto my-8">
        <Accordion
          type="single"
          collapsible
          className="space-y-3"
        >
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
                  <h1 className="font-semibold text-lg">
                    {item.title}
                  </h1>
                </div>
                
                {/* أيقونة السهم من shadcn/ui ستظهر هنا تلقائياً 
                  لقد أضفتُ 
                  [&[data-state=open]>div>svg]:rotate-180 
                  للـ Trigger 
                  لأن أيقونة shadcn الافتراضية قد لا تكون ChevronUp
                  لكن هذا يضمن أنها "تدور" عند الفتح
                */}

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