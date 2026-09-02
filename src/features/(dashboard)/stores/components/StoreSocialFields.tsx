// src/features/(dashboard)/stores/components/StoreSocialFields.tsx
"use client";

import { ChangeEvent, ReactNode } from "react";
import { cn } from "@/src/lib/utils";
import { StoreContactValues } from "../types";

type SocialField = "tiktok" | "facebook" | "instagram" | "youtube";

const SOCIAL_FIELDS: {
  field: SocialField;
  label: string;
  placeholder: string;
  icon: string;
}[] = [
  {
    field: "tiktok",
    label: "تيك توك",
    placeholder: "أدخل رابط تيك توك",
    icon: "/icons/dashboard/ticTok.svg",
  },
  {
    field: "facebook",
    label: "فيسبوك",
    placeholder: "ادخل رابط فيسبوك",
    icon: "/icons/dashboard/facebook.svg",
  },
  {
    field: "instagram",
    label: "إنستجرام",
    placeholder: "ادخل رابط انستجرام",
    icon: "/icons/dashboard/insta.svg",
  },
  {
    field: "youtube",
    label: "يوتيوب",
    placeholder: "أدخل رابط يوتيوب",
    icon: "/icons/dashboard/youtube.svg",
  },
];

interface StoreSocialFieldsProps {
  values: Pick<StoreContactValues, SocialField>;
  errors: Record<string, string>;
  onChange: (field: SocialField, value: string) => void;
}

/** The four social links shared by the create wizard and store settings. */
export function StoreSocialFields({
  values,
  errors,
  onChange,
}: StoreSocialFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {SOCIAL_FIELDS.map(({ field, label, placeholder, icon }) => (
        <SocialMediaInput
          key={field}
          label={label}
          placeholder={placeholder}
          icon={<img src={icon} alt={field} className="w-5 h-5" />}
          value={values[field]}
          onChange={(e) => onChange(field, e.target.value)}
          error={errors[field]}
        />
      ))}
    </div>
  );
}

interface SocialMediaInputProps {
  label: string;
  icon: ReactNode;
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

export function SocialMediaInput({
  label,
  icon,
  placeholder,
  value,
  onChange,
  error,
}: SocialMediaInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="relative">
        <input
          type="url"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={cn(
            "w-full pl-12 pr-4 py-3 border rounded-lg text-sm transition-all duration-200 focus:outline-none",
            error
              ? "border-red-500 focus:ring-1 focus:ring-red-500"
              : "border-gray-200"
          )}
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2">{icon}</div>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
