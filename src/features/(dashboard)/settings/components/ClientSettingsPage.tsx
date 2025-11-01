"use client";

import { SettingsAccordion } from "./SettingsAccordion";
import { BasicInfoSection } from "./BasicInfoSection";
import { TermsSection } from "./TermsSection";
import { PrivacyPolicySection } from "./PrivacyPolicySection";
import { SocialMediaSection } from "./SocialMediaSection";

export function ClientSettingsPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f9fa" }} dir="rtl">
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-6">
          {/* Basic Info Section */}
          <SettingsAccordion
            title="البيانات الأساسية"
            isCompleted={true}
            defaultOpen={false}
          >
            <BasicInfoSection />
          </SettingsAccordion>

          {/* Social Media Section */}
          <SettingsAccordion
            title="بيانات السوشيل ميديا"
            isCompleted={true}
            defaultOpen={false}
          >
            <SocialMediaSection />
          </SettingsAccordion>

          {/* Privacy Policy Section */}
          <SettingsAccordion
            title="سياسات الخصوصية"
            isCompleted={true}
            defaultOpen={false}
          >
            <PrivacyPolicySection />
          </SettingsAccordion>

          {/* Terms of Use Section */}
          <SettingsAccordion
            title="شروط الاستخدام"
            isCompleted={true}
            defaultOpen={false}
          >
            <TermsSection  />
          </SettingsAccordion>
        </div>
      </div>
    </div>
  );
}