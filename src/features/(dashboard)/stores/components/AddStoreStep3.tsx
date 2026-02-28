// src/features/(dashboard)/stores/components/AddStoreStep3.tsx
"use client";

import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { PhoneNumberInput } from "@/src/components/ui/PhoneNumberInput";
import { StepperProgress } from "./StepperProgress";
import { StorePreviewSidebar } from "./StorePreviewSidebar";
import { StoreType } from "../api";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { Step2FormData, Step3FormData } from "../types";
import { cn } from "@/src/lib/utils";

interface AddStoreStep3Props {
  storeType: StoreType;
  previousData: Step2FormData;
  initialData?: Step3FormData;
  onNext: (data: Step3FormData) => void;
  onBack: () => void;
  barSteps: { number: number; label: string; completed: boolean }[];
}

interface LocalStep3Data extends Omit<Step3FormData, "hide_phone"> {
  hide_phone: "1" | "0";
}

const isValidUrl = (url: string) => {
  if (!url) return true;
  try {
    const hasProtocol = /^https?:\/\//i.test(url);
    const urlToCheck = hasProtocol ? url : `https://${url}`;

    const parsed = new URL(urlToCheck);
    return parsed.hostname.includes(".");
  } catch {
    return false;
  }
};

export function AddStoreStep3({
  storeType,
  previousData,
  initialData,
  onNext,
  onBack,
  barSteps,
}: AddStoreStep3Props) {
  const router = useRouter();
  const [phoneCountryCode, setPhoneCountryCode] = useState("+972");
  const [whatsappCountryCode, setWhatsappCountryCode] = useState("+972");

  const [formData, setFormData] = useState<LocalStep3Data>({
    phone: initialData?.phone || "",
    hide_phone: initialData?.hide_phone === "1" ? "1" : "0",
    whats_app: initialData?.whats_app || "",
    tiktok: initialData?.tiktok || "",
    facebook: initialData?.facebook || "",
    instagram: initialData?.instagram || "",
    twitter: initialData?.twitter || "",
    youtube: initialData?.youtube || "",
    linkedin: initialData?.linkedin || "",
    pinterest: initialData?.pinterest || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = barSteps;
  const breadcrumbItems = [
    { label: "الرئيسية", href: "/admin" },
    { label: "المتاجر", href: "/admin/stores" },
    { label: "إضافة متجر" },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    const urlFields: (keyof LocalStep3Data)[] = [
      "tiktok",
      "facebook",
      "instagram",
      "youtube",
    ];

    const platformDomains: Record<string, string[]> = {
      tiktok: ["tiktok.com"],
      facebook: ["facebook.com", "fb.com", "fb.me"],
      instagram: ["instagram.com"],
      youtube: ["youtube.com", "youtu.be"],
    };

    urlFields.forEach((field) => {
      const value = formData[field];
      if (value) {
        if (!isValidUrl(value)) {
          newErrors[field] = "يرجى ادخال رابط صحيح";
          isValid = false;
        } else {
          const allowedDomains = platformDomains[field as string];
          if (allowedDomains && !allowedDomains.some(d => value.toLowerCase().includes(d))) {
            newErrors[field] = `يجب أن يكون الرابط صحيح لمنصة ${field}`;
            isValid = false;
          }
        }
      }
    });

    const validatePhone = (phone: string, field: string) => {
      if (!phone) return true;
      if (phone.length < 9 || phone.length > 12) {
        newErrors[field] = "يجب أن يكون رقم الهاتف بين 9 و 12 رقم";
        return false;
      }
      return true;
    };

    if (!validatePhone(formData.phone, "phone")) isValid = false;
    if (!validatePhone(formData.whats_app, "whats_app")) isValid = false;

    setErrors(newErrors);


    return isValid;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext(formData as unknown as Step3FormData);
    }
  };

  const handleCancel = () => {
    router.push("/admin/stores");
  };

  const toggleHidePhone = () => {
    setFormData({
      ...formData,
      hide_phone: formData.hide_phone === "1" ? "0" : "1",
    });
  };

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto pb-0 px-4">
        <Breadcrumb items={breadcrumbItems} className="mb-4" />

        <StepperProgress currentStep={2} steps={steps} />

        <div className="grid grid-cols-12 gap-6 mt-8">
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-8">الاتصال والسوشيال</h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <PhoneNumberInput
                      label="الهاتف المحمول"
                      placeholder="ادخل رقم الهاتف المحمول"
                      countryCode={phoneCountryCode}
                      onCountryCodeChange={setPhoneCountryCode}
                      value={formData.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setFormData({ ...formData, phone: val });
                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                      }}
                      error={errors.phone}
                    />

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={toggleHidePhone}
                        className={cn(
                          "w-4 h-4 rounded-xs border transition-colors flex items-center justify-center shrink-0 cursor-pointer",
                          formData.hide_phone === "1"
                            ? "bg-blue-5 border-blue-4"
                            : "bg-white border-gray-300 group-hover:border-gray-2"
                        )}
                        aria-checked={formData.hide_phone === "1"}
                        role="checkbox"
                      >
                        {formData.hide_phone === "1" && (
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
                        onClick={toggleHidePhone}
                        className="text-sm text-gray-2 cursor-pointer font-normal select-none"
                      >
                        إخفاء رقم الهاتف على الملف الشخصي
                      </label>
                    </div>
                  </div>

                  <PhoneNumberInput
                    label="الواتساب"
                    placeholder="ادخل رقم الواتساب"
                    countryCode={whatsappCountryCode}
                    onCountryCodeChange={setWhatsappCountryCode}
                    value={formData.whats_app}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setFormData({ ...formData, whats_app: val });
                      if (errors.whats_app) setErrors((prev) => ({ ...prev, whats_app: "" }));
                    }}
                    error={errors.whats_app}
                  />

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SocialMediaInput
                    label="تيك توك"
                    icon={
                      <img
                        src="/icons/dashboard/ticTok.svg"
                        alt="tiktok"
                        className="w-5 h-5"
                      />
                    }
                    placeholder="أدخل رابط تيك توك"
                    value={formData.tiktok}
                    onChange={(e) => {
                      setFormData({ ...formData, tiktok: e.target.value });
                      if (errors.tiktok) setErrors((prev) => ({ ...prev, tiktok: "" }));
                    }}
                    error={errors.tiktok}
                  />

                  <SocialMediaInput
                    label="فيسبوك"
                    icon={
                      <img
                        src="/icons/dashboard/facebook.svg"
                        alt="facebook"
                        className="w-5 h-5"
                      />
                    }
                    placeholder="ادخل رابط فيسبوك"
                    value={formData.facebook}
                    onChange={(e) => {
                      setFormData({ ...formData, facebook: e.target.value });
                      if (errors.facebook) setErrors((prev) => ({ ...prev, facebook: "" }));
                    }}
                    error={errors.facebook}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SocialMediaInput
                    label="إنستجرام"
                    icon={
                      <img
                        src="/icons/dashboard/insta.svg"
                        alt="instagram"
                        className="w-5 h-5"
                      />
                    }
                    placeholder="ادخل رابط انستجرام"
                    value={formData.instagram}
                    onChange={(e) => {
                      setFormData({ ...formData, instagram: e.target.value });
                      if (errors.instagram) setErrors((prev) => ({ ...prev, instagram: "" }));
                    }}
                    error={errors.instagram}
                  />

                  <SocialMediaInput
                    label="يوتيوب"
                    icon={
                      <img
                        src="/icons/dashboard/youtube.svg"
                        alt="youtube"
                        className="w-5 h-5"
                      />
                    }
                    placeholder="أدخل رابط يوتيوب"
                    value={formData.youtube}
                    onChange={(e) => {
                      setFormData({ ...formData, youtube: e.target.value });
                      if (errors.youtube) setErrors((prev) => ({ ...prev, youtube: "" }));
                    }}
                    error={errors.youtube}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4">
            <StorePreviewSidebar
              data={{
                logo: previousData.logo_preview,
                name: previousData.name,
                description: previousData.description,
                coverImages: previousData.cover_previews,
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex gap-4 justify-between mt-6 bg-white shadow-2xl p-6">
        <Button
          onClick={handleNext}
          className="px-12 py-5 cursor-pointer rounded-sm"
          style={{ backgroundColor: "var(--blue-3)" }}
        >
          حفظ والتالي
        </Button>
        <Button
          onClick={onBack}
          variant="outline"
          className="px-12 py-5 bg-gray-4 border-none cursor-pointer rounded-sm"
        >
          رجوع
        </Button>
      </div>
    </div>
  );
}

interface SocialMediaInputProps {
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

function SocialMediaInput({
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
              : "border-gray-200 "
          )}
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2">{icon}</div>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}