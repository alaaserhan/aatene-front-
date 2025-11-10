// src/features/(dashboard)/settings/components/SocialMediaSection.tsx
"use client";

import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";

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
    placeholder: "bestshop@info.com أو اسم المستخدم",
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

interface SocialMediaSectionProps {
  data: SocialMediaData;
  onChange: (data: Partial<SocialMediaData>) => void;
}

export function SocialMediaSection({ data, onChange }: SocialMediaSectionProps) {
  const handleChange = (key: SocialKey, value: string) => {
    onChange({ [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {socialInputs.map((input) => {
          const Icon = input.Icon;
          return (
            <div key={input.key} className="space-y-2">
              <Label htmlFor={input.key} className="text-start">
                {input.label}
              </Label>

              <div className="flex items-center gap-1 px-3 border border-gray-300 rounded-lg focus-within:border-brand-blue-2">
                <span aria-hidden className="flex items-center">
                  <img
                    src={`/icons/dashboard/${Icon}.svg`}
                    alt={Icon}
                    className="w-5 h-5 text-gray-700"
                  />
                </span>

                <Input
                  id={input.key}
                  type="text"
                  value={data[input.key]}
                  onChange={(e) => handleChange(input.key, e.target.value)}
                  placeholder={input.placeholder}
                  className="flex-1 h-10 border-none shadow-none focus-visible:ring-0"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SocialMediaSection;