// src/features/(dashboard)/stores/components/StorePhoneField.tsx
"use client";

import { useState } from "react";
import { PhoneNumberInput } from "@/src/components/ui/PhoneNumberInput";
import { cn } from "@/src/lib/utils";

interface StorePhoneFieldProps {
  phone: string;
  hidePhone: boolean;
  error?: string;
  onPhoneChange: (phone: string) => void;
  onHidePhoneChange: (hidePhone: boolean) => void;
}

/** Store phone + "hide on profile" toggle, shared by the wizard and settings. */
export function StorePhoneField({
  phone,
  hidePhone,
  error,
  onPhoneChange,
  onHidePhoneChange,
}: StorePhoneFieldProps) {
  const [countryCode, setCountryCode] = useState("+972");

  return (
    <div className="space-y-2">
      <PhoneNumberInput
        label="رقم الهاتف"
        placeholder="ادخل رقم رقم الهاتف"
        countryCode={countryCode}
        onCountryCodeChange={setCountryCode}
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value.replace(/\D/g, ""))}
        error={error}
      />

      <div className="flex items-center gap-2 pt-2">
        <button
          type="button"
          onClick={() => onHidePhoneChange(!hidePhone)}
          className={cn(
            "w-4 h-4 rounded-xs border transition-colors flex items-center justify-center shrink-0 cursor-pointer",
            hidePhone
              ? "bg-blue-5 border-blue-4"
              : "bg-white border-gray-300 hover:border-gray-2"
          )}
          aria-checked={hidePhone}
          role="checkbox"
        >
          {hidePhone && (
            <svg
              className="w-4 h-4 text-blue-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>

        <label
          onClick={() => onHidePhoneChange(!hidePhone)}
          className="text-sm text-gray-2 cursor-pointer font-normal select-none"
        >
          إخفاء رقم الهاتف على الملف الشخصي
        </label>
      </div>
    </div>
  );
}
