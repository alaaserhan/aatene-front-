// src/features/(dashboard)/settings/components/BasicInfoSection.tsx
"use client";

import { useState } from "react";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { MapModal } from "./MapModal";
import { MediaSelectButton } from "../../mediaCenter/components/MediaSelectButton";
import { MultiSelectDropdown } from "@/src/components/ui/MultiSelectDropdown";
import { toast } from "sonner";
// استيراد مكون الهاتف المحدث
import { PhoneNumberInput } from "@/src/components/ui/PhoneNumberInput";

interface BasicInfoData {
  siteName: string;
  about_website: string;
  logo: string | null;
  logo_url: string | null;
  email: string;
  address: string;
  phone: string;
  whatsapp: string;
  mainColor: string;
}

const AVAILABLE_LANGUAGES = [
  { value: "ar", label: "العربية" },
  { value: "en", label: "الإنجليزية" },
  { value: "he", label: "العبرية" },
];

interface BasicInfoSectionProps {
  data: BasicInfoData;
  languages: string[];
  onChange: (data: Partial<BasicInfoData>) => void;
  onLanguagesChange: (languages: string[]) => void;
}

export function BasicInfoSection({
  data,
  languages,
  onChange,
  onLanguagesChange,
}: BasicInfoSectionProps) {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // إضافة حالة لإدارة كود الدولة للهاتف والواتساب بشكل منفصل
  const [phoneCountryCode, setPhoneCountryCode] = useState("+972");
  const [whatsappCountryCode, setWhatsappCountryCode] = useState("+972");

  const handleLanguagesUpdate = (newLanguages: string[]) => {
    if (newLanguages.length === 0) {
      toast.warning("يجب اختيار لغة واحدة على الأقل للموقع");
      return;
    }
    onLanguagesChange(newLanguages);
  };

  const handleSelectAddressFromMap = (
    address: string
  ) => {
    onChange({ address });
  };

  return (
    <>
      <div className="space-y-8">
        <div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="siteName" className="text-start">
                اسم الموقع <span className="text-red-500">*</span>
              </Label>
              <Input
                id="siteName"
                type="text"
                value={data.siteName}
                onChange={(e) => onChange({ siteName: e.target.value })}
                maxLength={50}
                className="w-full text-start"
              />
              <p className="text-xs text-gray-2 text-end">
                {data.siteName.length}/50
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-start block">
                لغة الموقع <span className="text-red-500">*</span>
              </Label>

              <MultiSelectDropdown
                options={AVAILABLE_LANGUAGES}
                selectedValues={languages}
                onChange={handleLanguagesUpdate}
                placeholder="اختر لغات الموقع..."
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="about_website" className="text-start">
                عن الموقع <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="about_website"
                value={data.about_website}
                onChange={(e) => onChange({ about_website: e.target.value })}
                required
                className="flex min-h-[100px] w-full rounded-sm border border-gray-200 bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="اكتب نبذة عن الموقع..."
              />
            </div>

            <div className="space-y-2">
              <MediaSelectButton
                label="شعار الموقع"
                width={300}
                height={150}
                value={data.logo}
                previewUrl={data.logo_url}
                onChange={(fileName, src) =>
                  onChange({ logo: fileName, logo_url: src })
                }
                accept="image/svg+xml"
                primaryText="SVG"
                secondaryText=""
                infoText={[
                  "الأفضل أن تكون الصورة بعرض 300 بكسل وطول 150 بكسل.",
                  "الحجم يجب أن لا يتعدى 2 ميغابايت.",
                ]}
                allowedMediaTypes={["image"]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-start">
                البريد الإلكتروني <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-3 px-3 border border-gray-300 rounded-lg focus-within:border-brand-blue-2">
                <img
                  src="/icons/dashboard/email.svg"
                  className="w-5 h-5"
                  alt=""
                />
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => onChange({ email: e.target.value })}
                  required
                  className="w-full h-10 border-none shadow-none px-0 focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-start">
                العنوان <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-3 ps-3 border border-gray-300 rounded-lg focus-within:border-brand-blue-2">
                <img
                  src="/icons/dashboard/mark.svg"
                  className="w-5 h-5"
                  alt="mark"
                />
                <Input
                  id="address"
                  type="text"
                  value={data.address}
                  onChange={(e) => onChange({ address: e.target.value })}
                  required
                  className="text-[12px] border-none shadow-none px-0 py-2.5 focus-visible:ring-0"
                />
                {/* <Button
                  type="button"
                  variant="link"
                  onClick={() => setIsMapModalOpen(true)}
                  className="p-0 px-3 py-0 mx-0.5 text-xs"
                >
                  تحديد من الخريطة
                </Button> */}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* استبدال حقل الهاتف اليدوي بالمكون الموحد */}
              <PhoneNumberInput
                label="رقم الهاتف"
                value={data.phone}
                onChange={(e) => onChange({ phone: e.target.value })}
                required={true}
                countryCode={phoneCountryCode}
                onCountryCodeChange={setPhoneCountryCode}
                placeholder="0000000000"
              />

              {/* استبدال حقل الواتساب اليدوي بالمكون الموحد */}
              <PhoneNumberInput
                label="الواتساب"
                value={data.whatsapp}
                onChange={(e) => onChange({ whatsapp: e.target.value })}
                required={true}
                countryCode={whatsappCountryCode}
                onCountryCodeChange={setWhatsappCountryCode}
                placeholder="0000000000"
              />
            </div>
          </div>
        </div>
      </div>

      <MapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onSelectAddress={handleSelectAddressFromMap}
        initialAddress={data.address}
      />
    </>
  );
}