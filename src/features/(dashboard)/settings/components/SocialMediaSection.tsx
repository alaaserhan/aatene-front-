"use client";

import { useState } from "react";
import { Facebook, Instagram, Youtube, Twitter } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface SocialMediaData {
  facebook: string;
  snapchat: string;
  tiktok: string;
  twitter: string;
  instagram: string;
  youtube: string;
}

export function SocialMediaSection() {
  const [formData, setFormData] = useState<SocialMediaData>({
    facebook: "https://facebook.atene124.com",
    snapchat: "bestshop@info.com",
    tiktok: "https://tiktok.atene124.com",
    twitter: "أدخل رابط تويتر",
    instagram: "https://instagram.atene124.com",
    youtube: "https://youtube.atene124.com",
  });

  const handleSave = () => {
    console.log("Saving social media:", formData);
    // API call here
  };

  const socialInputs = [
    {
      key: "facebook",
      label: "فيسبوك",
      icon: Facebook,
      placeholder: "https://facebook.atene124.com",
    },
    {
      key: "snapchat",
      label: "سناب شات",
      icon: null,
      placeholder: "bestshop@info.com",
      customIcon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838 0 .179-.045.359-.12.509-.12.238-.345.449-.674.659.12.135.24.27.345.42.27.359.54.748.54 1.123 0 .195-.045.375-.149.54-.21.359-.629.599-1.123.599-.3 0-.659-.074-1.078-.239-.18-.074-.359-.134-.509-.18l-.076-.022c-.479-.134-.718-.179-1.123-.179-.3 0-.539.031-.748.12-.06.03-.12.045-.149.045-.09 0-.15-.045-.209-.104-.09-.09-.15-.194-.15-.314 0-.12.045-.254.119-.359.15-.209.359-.359.629-.494.045-.029.105-.074.164-.119.66-.479 1.438-1.078 1.438-1.931 0-.494-.179-.854-.509-1.093-.3-.18-.689-.239-1.063-.254-.15-.015-.285-.015-.42-.015-.135 0-.27 0-.42.015-.254.015-.524.074-.764.164-.105.045-.21.09-.3.135-.105.06-.21.104-.3.15-.359.194-.644.359-1.003.359-.18 0-.359-.045-.509-.15-.239-.164-.359-.419-.359-.703 0-.254.09-.479.269-.659.15-.15.344-.225.539-.225.12 0 .254.03.389.074.164.06.344.134.539.21.165.059.33.118.494.163.45.119.884.179 1.273.179.494 0 .914-.09 1.243-.239.164-.074.284-.179.374-.314.045-.074.074-.164.074-.254 0-.119-.045-.239-.119-.344-.239-.314-.629-.494-1.093-.494-.18 0-.359.015-.539.045-.135.015-.27.045-.405.074l-.014.003c-.38.074-.779.164-1.123.164-.3 0-.584-.045-.854-.164-.404-.179-.689-.479-.854-.868-.074-.18-.119-.374-.119-.584 0-.494.239-.914.629-1.183.3-.21.674-.314 1.063-.314.12 0 .239.015.359.03.539.074 1.078.239 1.662.539.404.209.854.419 1.348.629.509.209 1.048.419 1.617.629.584.209 1.183.374 1.797.479.164.029.329.044.509.044.42 0 .824-.074 1.213-.224.584-.225 1.093-.599 1.513-1.108.299-.374.539-.794.704-1.243.12-.329.18-.674.18-1.033 0-.659-.15-1.288-.449-1.871-.629-1.288-1.677-2.221-3.026-2.7-.584-.21-1.213-.314-1.871-.314z"/>
        </svg>
      ),
    },
    {
      key: "tiktok",
      label: "تيك توك",
      icon: null,
      placeholder: "https://tiktok.atene124.com",
      customIcon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      ),
    },
    {
      key: "twitter",
      label: "تويتر",
      icon: Twitter,
      placeholder: "أدخل رابط تويتر",
    },
    {
      key: "instagram",
      label: "إنستغرام",
      icon: Instagram,
      placeholder: "https://instagram.atene124.com",
    },
    {
      key: "youtube",
      label: "يوتيوب",
      icon: Youtube,
      placeholder: "https://youtube.atene124.com",
    },
  ];

  return (
    <div className="space-y-6">
      {socialInputs.map((input) => {
        const Icon = input.icon;
        
        return (
          <div key={input.key} className="space-y-2">
            <label className="block text-sm font-medium text-brand-black-1 text-right">
              {input.label}
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData[input.key as keyof SocialMediaData]}
                onChange={(e) =>
                  setFormData({ ...formData, [input.key]: e.target.value })
                }
                placeholder={input.placeholder}
                className={cn(
                  "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-blue-2 text-right",
                  "pr-12"
                )}
                dir="ltr"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                {Icon ? (
                  <Icon className="w-6 h-6" />
                ) : (
                  input.customIcon
                )}
              </div>
            </div>
          </div>
        );
      })}

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