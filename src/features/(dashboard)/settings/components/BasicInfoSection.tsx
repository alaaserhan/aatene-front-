// src/features/(dashboard)/settings/components/BasicInfoSection.tsx
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { MapModal } from "./MapModal";
import { MediaSelectButton } from "../../mediaCenter/components/MediaSelectButton";

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

const AVAILABLE_LANGUAGES = [
  { id: "ar", label: "العربية" },
  { id: "en", label: "الإنجليزية" },
  { id: "he", label: "العبرية" },
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

  const handleToggleLanguage = (langId: string) => {
    const isSelected = languages.includes(langId);
    let newLanguages = isSelected
      ? languages.filter((id) => id !== langId)
      : [...languages, langId];

    if (newLanguages.length === 0) {
      newLanguages = [langId];
    }

    onLanguagesChange(newLanguages);
  };

  const handleSelectAddressFromMap = (
    address: string,
    lat: number,
    lng: number
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
              <p className="text-xs text-gray-500 text-end">
                {data.siteName.length}/50
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-start">
                لغة الموقع <span className="text-red-500">*</span>
              </Label>
              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex gap-3">
                  {AVAILABLE_LANGUAGES.map((lang) => {
                    const isSelected = languages.includes(lang.id);
                    return (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => handleToggleLanguage(lang.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer rounded-full border transition-colors  ${
                          isSelected
                            ? "bg-blue-5 border-blue-4 text-blue-4"
                            : "bg-gray-100 border-gray-300 text-gray-600"
                        }`}
                      >
                        <span className="text-sm font-normal">
                          {lang.label}
                        </span>
                        {isSelected && (
                          <X className="w-4 h-4 text-blue-4" strokeWidth={2} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
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
                accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                primaryText="SVG, PNG, JPG (MAX. 800x400px)"
                infoText={[
                  "الأفضل أن تكون الصورة بعرض 300 بكسل وطول 150 بكسل.",
                  "الحجم يجب أن لا يتعدى 2 ميغابايت.",
                ]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-start">
                البريد الإلكتروني
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
                  className="w-full h-10 border-none shadow-none px-0 focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-start">
                العنوان
              </Label>
              <div className="flex items-center gap-3 ps-3 border border-gray-300 rounded-lg focus-within:border-brand-blue-2">
                <img
                  src="/icons/dashboard/mark.svg"
                  alt=""
                  className="w-5 h-5"
                />
                <Input
                  id="address"
                  type="text"
                  value={data.address}
                  onChange={(e) => onChange({ address: e.target.value })}
                  className="h-10 border-none shadow-none px-0 focus-visible:ring-0 "
                />
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setIsMapModalOpen(true)}
                  className="p-0 px-3 py-0 mx-0.5  text-xs"
                >
                  تحديد من الخريطة
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-start">
                  الهاتف المحمول
                </Label>
                <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-brand-blue-2">
                  <Select defaultValue="+20">
                    <SelectTrigger className="w-[90px] border-none shadow-none focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+20">+20</SelectItem>
                      <SelectItem value="+1">+1</SelectItem>
                      <SelectItem value="+44">+44</SelectItem>
                      <SelectItem value="+971">+971</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    type="tel"
                    value={data.phone}
                    onChange={(e) => onChange({ phone: e.target.value })}
                    className="flex-1 h-10 border-none shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-start">
                  الواتساب
                </Label>
                <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-brand-blue-2">
                  <Select defaultValue="+20">
                    <SelectTrigger className="w-[90px] border-none shadow-none focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+20">+20</SelectItem>
                      <SelectItem value="+1">+1</SelectItem>
                      <SelectItem value="+44">+44</SelectItem>
                      <SelectItem value="+971">+971</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="whatsapp"
                    type="tel"
                    value={data.whatsapp}
                    onChange={(e) => onChange({ whatsapp: e.target.value })}
                    className="flex-1 h-10 border-none shadow-none  focus-visible:ring-0"
                  />
                </div>
              </div>
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