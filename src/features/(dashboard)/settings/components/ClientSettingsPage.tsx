"use client";

import { SettingsAccordion } from "./SettingsAccordion";
import { BasicInfoSection } from "./BasicInfoSection";
import { TermsSection } from "./TermsSection";
import { PrivacyPolicySection } from "./PrivacyPolicySection";
import { SocialMediaSection } from "./SocialMediaSection";

export function ClientSettingsPage() {
  return (
    <div>
      <div className="container mx-auto my-8">
        <div className="space-y-3">
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