// src/features/(dashboard)/settings/components/BasicInfoSection.tsx
"use client";

import { useState } from "react";
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
// استيراد المكون الجديد
import { MultiSelectDropdown } from "@/src/components/ui/MultiSelectDropdown";
import { toast } from "sonner";

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

  const handleLanguagesUpdate = (newLanguages: string[]) => {
    if (newLanguages.length === 0) {
      toast.warning("يجب اختيار لغة واحدة على الأقل للموقع");
      return;
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

            {/* قسم اختيار اللغة باستخدام المكون الجديد */}
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
                allowedMediaTypes={["gallery", "image"]}
              />
            </div>

            {/* بقية الحقول كما هي ... */}
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
                  className="w-5 h-5"
                  alt="mark"
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
                  className="p-0 px-3 py-0 mx-0.5 text-xs"
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
                  <Input
                    id="phone"
                    type="number"
                    value={data.phone}
                    onChange={(e) => onChange({ phone: e.target.value })}
                    className="flex-1 h-10 border-none shadow-none focus-visible:ring-0"
                  />
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
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-start">
                  الواتساب
                </Label>
                <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-brand-blue-2">
                  <Input
                    id="whatsapp"
                    type="number"
                    value={data.whatsapp}
                    onChange={(e) => onChange({ whatsapp: e.target.value })}
                    className="flex-1 h-10 border-none shadow-none focus-visible:ring-0"
                  />
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