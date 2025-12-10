// src/features/(dashboard)/settings/components/SocialMediaSection.tsx
"use client";

import { useState } from "react";
import { Label } from "@/src/components/ui/label";
import { cn } from "@/src/lib/utils";

interface SocialMediaData {
  facebook: string;
  instagram: string;
  youtube: string;
  twitter: string;
  tiktok: string;
  snapchat: string;
}

type SocialKey = keyof SocialMediaData;

const socialInputs: {
  key: SocialKey;
  label: string;
  Icon: string;
  placeholder: string;
}[] = [
  {
    key: "facebook",
    label: "فيسبوك",
    Icon: "facebook",
    placeholder: "https://facebook.example.com/your-page",
  },
  {
    key: "instagram",
    label: "إنستغرام",
    Icon: "insta",
    placeholder: "https://instagram.example.com/your-page",
  },
  {
    key: "tiktok",
    label: "تيك توك",
    Icon: "ticTok",
    placeholder: "https://tiktok.example.com/your-page",
  },
  {
    key: "snapchat",
    label: "سناب شات",
    Icon: "snap",
    placeholder: "https://snapchat.com/add/username",
  },
  {
    key: "youtube",
    label: "يوتيوب",
    Icon: "youtube",
    placeholder: "https://youtube.com/channel/...",
  },
  {
    key: "twitter",
    label: "تويتر (X)",
    Icon: "twitter",
    placeholder: "https://x.com/your-handle",
  },
];

// دالة التحقق من صحة الرابط
const isValidUrl = (urlString: string) => {
  const urlPattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$", // fragment locator
    "i"
  );
  return !!urlPattern.test(urlString);
};

interface SocialMediaSectionProps {
  data: SocialMediaData;
  onChange: (data: Partial<SocialMediaData>) => void;
}

export function SocialMediaSection({ data, onChange }: SocialMediaSectionProps) {
  // حالة لتخزين الأخطاء لكل حقل
  const [errors, setErrors] = useState<Partial<Record<SocialKey, string>>>({});

  const handleChange = (key: SocialKey, value: string) => {
    onChange({ [key]: value });
    
    // إخفاء الخطأ بمجرد أن يبدأ المستخدم في التعديل
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleBlur = (key: SocialKey, value: string) => {
    // إذا كان الحقل فارغاً، لا نظهر خطأ (إلا إذا كان الحقل إجبارياً، وهنا افترضنا أنه اختياري)
    if (!value) return;

    if (!isValidUrl(value)) {
      setErrors((prev) => ({ ...prev, [key]: "يرجى إدخال رابط صحيح (URL)" }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {socialInputs.map((input) => {
          const IconName = input.Icon;
          const hasError = !!errors[input.key];

          return (
            <div key={input.key} className="space-y-2">
              <Label htmlFor={input.key} className="text-start font-medium text-sm">
                {input.label}
              </Label>

              <div className="flex flex-col gap-1">
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 border rounded-lg transition-all h-[42px] bg-white",
                    hasError
                      ? "border-red-500 focus-within:ring-1 focus-within:ring-red-200"
                      : "border-gray-200 focus-within:border-blue-3 focus-within:ring-1 focus-within:ring-blue-3"
                  )}
                >
                  <span className="flex-shrink-0 flex items-center justify-center">
                    <img
                      src={`/icons/dashboard/${IconName}.svg`}
                      alt={IconName}
                      className="w-5 h-5 opacity-80"
                    />
                  </span>

                  <input
                    id={input.key}
                    type="url" // يساعد المتصفح في إظهار كيبورد مناسب
                    value={data[input.key]}
                    onChange={(e) => handleChange(input.key, e.target.value)}
                    onBlur={(e) => handleBlur(input.key, e.target.value)}
                    placeholder={input.placeholder}
                    className="w-full h-full border-none outline-none bg-transparent text-sm placeholder:text-gray-400 text-left ltr"
                    dir="ltr"
                  />
                </div>
                
                {/* رسالة الخطأ */}
                {hasError && (
                  <p className="text-xs text-red-500 text-start">
                    {errors[input.key]}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SocialMediaSection;