"use client";

import { useState } from "react";
import { MapPin, Mail } from "lucide-react";
import { MultiSelect } from "./MultiSelect";
import { ImageUpload } from "./ImageUpload";
import { ColorPicker } from "./ColorPicker";

interface BasicInfoData {
  siteName: string;
  languages: string[];
  logo: File | null;
  primaryColor: string;
  email: string;
  address: string;
  phone: string;
  whatsapp: string;
}

export function BasicInfoSection() {
  const [formData, setFormData] = useState<BasicInfoData>({
    siteName: "",
    languages: ["العربية"],
    logo: null,
    primaryColor: "#2D496A",
    email: "bestshop@info.com",
    address: "شارع الخالق، مصر الجديدة، محافظة القاهرة، مصر",
    phone: "1289022985",
    whatsapp: "1289022985",
  });

  const languageOptions = [
    { value: "العربية", label: "العربية" },
    { value: "الصينية", label: "الصينية" },
    { value: "الإنجليزية", label: "الإنجليزية" },
  ];

  const handleSave = () => {
    console.log("Saving basic info:", formData);
    // API call here
  };

  return (
    <div className="space-y-6">
      {/* Site Name */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-brand-black-1 text-right">
          اسم الموقع <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.siteName}
          onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
          placeholder="اختر"
          maxLength={50}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-blue-2 text-right"
          dir="rtl"
        />
        <p className="text-xs text-gray-500 text-right">
          {formData.siteName.length}/50
        </p>
      </div>

      {/* Languages */}
      <MultiSelect
        label="لغة الموقع"
        options={languageOptions}
        value={formData.languages}
        onChange={(languages) => setFormData({ ...formData, languages })}
        placeholder="اختر"
      />

      {/* Logo */}
      <ImageUpload
        label="شعار الموقع"
        value={formData.logo}
        onChange={(logo) => setFormData({ ...formData, logo })}
      />

      {/* Primary Color */}
      <ColorPicker
        label="اللون الأساسي للموقع"
        value={formData.primaryColor}
        onChange={(primaryColor) => setFormData({ ...formData, primaryColor })}
      />

      {/* Email */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-brand-black-1 text-right">
          البريد الإلكتروني
        </label>
        <div className="relative">
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-blue-2 text-right"
            dir="ltr"
          />
          <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-brand-black-1 text-right">
          العنوان
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-blue-2 text-right"
            dir="rtl"
          />
          <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <button
          type="button"
          className="px-4 py-2 bg-brand-blue-2 text-white rounded-lg text-sm hover:bg-brand-blue-3 transition-colors"
        >
          تحديد من الخريطة
        </button>
      </div>

      {/* Phone Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* WhatsApp */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-brand-black-1 text-right">
            الواتساب
          </label>
          <div className="flex gap-2">
            <input
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-blue-2"
              dir="ltr"
            />
            <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-blue-2">
              <option>+20</option>
              <option>+1</option>
              <option>+44</option>
              <option>+971</option>
            </select>
          </div>
        </div>

        {/* Mobile */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-brand-black-1 text-right">
            الهاتف المحمول
          </label>
          <div className="flex gap-2">
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-blue-2"
              dir="ltr"
            />
            <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-blue-2">
              <option>+20</option>
              <option>+1</option>
              <option>+44</option>
              <option>+971</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          className="px-8 py-3 bg-brand-blue-3 text-white rounded-lg font-medium hover:bg-brand-blue-2 transition-colors"
        >
          حفظ الإعدادات
        </button>
      </div>
    </div>
  );
}