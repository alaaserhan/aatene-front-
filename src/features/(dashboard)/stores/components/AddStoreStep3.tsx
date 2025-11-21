// src/features/(dashboard)/stores/components/AddStoreStep3.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { FormInput } from "@/src/components/ui/FormInput";
import { PhoneNumberInput } from "@/src/components/ui/PhoneNumberInput";
import { StepperProgress } from "./StepperProgress";
import { StorePreviewSidebar } from "./StorePreviewSidebar";
import { StoreType } from "../api";
import { Breadcrumb } from "@/src/components/ui/Breadcrumb";
import { cn } from "@/src/lib/utils";

interface AddStoreStep3Props {
  storeType: StoreType;
  previousData: any;
  initialData?: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

export function AddStoreStep3({
  storeType,
  previousData,
  initialData,
  onNext,
  onBack,
}: AddStoreStep3Props) {
  const router = useRouter();
  const [phoneCountryCode, setPhoneCountryCode] = useState("+20");
  const [whatsappCountryCode, setWhatsappCountryCode] = useState("+20");

  const [formData, setFormData] = useState({
    phone: initialData?.phone || "",
    hide_phone: initialData?.hide_phone || false,
    whats_app: initialData?.whats_app || "",
    tiktok: initialData?.tiktok || "",
    facebook: initialData?.facebook || "",
    instagram: initialData?.instagram || "",
    youtube: initialData?.youtube || "",
  });

  const steps = [
    { number: 1, label: "البيانات الأساسية", completed: true },
    { number: 2, label: "الاتصال والسوشيال مديا", completed: false },
    { number: 3, label: "موظفين المتجر", completed: false },
    { number: 4, label: "أوقات العمل و العطلات", completed: false },
    { number: 5, label: "طريقة الشحن", completed: false },
    { number: 6, label: "الكلمات المفتاحية", completed: false },
  ];

  const breadcrumbItems = [
    { label: "الرئيسية", href: "/admin" },
    { label: "المتاجر", href: "/admin/stores" },
    { label: "إضافة متجر" },
  ];

  const handleNext = () => {
    onNext(formData);
  };

  const handleCancel = () => {
    router.push("/admin/stores");
  };

  return (
    <div className=" bg-gray-50">
      <div className="container mx-auto pb-0 px-4">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} className="mb-4" />

        {/* Stepper */}
        <StepperProgress currentStep={2} steps={steps} />

        {/* Main Content */}
        <div className="grid grid-cols-12 gap-6 mt-8">


          {/* Right Side - Form */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold  mb-8">
                الاتصال والسوشيال
              </h2>

              <div className="space-y-6">
                {/* Phone and WhatsApp Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div className="space-y-2">
                    <PhoneNumberInput
                      label="الهاتف المحمول"
                      placeholder="01289022985"
                      countryCode={phoneCountryCode}
                      onCountryCodeChange={setPhoneCountryCode}
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                    {/* Hide Phone Checkbox */}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="hide_phone"
                        checked={formData.hide_phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hide_phone: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-blue-3 rounded cursor-pointer"
                      />
                      <label
                        htmlFor="hide_phone"
                        className="text-sm text-gray-600 cursor-pointer"
                      >
                        إخفاء رقم الهاتف على الملف الشخصي
                      </label>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <PhoneNumberInput
                    label="الواتساب"
                    placeholder="01289022985"
                    countryCode={whatsappCountryCode}
                    onCountryCodeChange={setWhatsappCountryCode}
                    value={formData.whats_app}
                    onChange={(e) =>
                      setFormData({ ...formData, whats_app: e.target.value })
                    }
                  />
                </div>

                {/* TikTok and Facebook Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* TikTok */}
                  <SocialMediaInput
                    label="تيك توك"
                    icon={
                      <img
                        src="/icons/dashboard/tictok.svg"
                        alt="tiktok"
                        className="w-5 h-5"
                      />
                    }
                    placeholder="أدخل رابط تيك توك"
                    value={formData.tiktok}
                    onChange={(e) =>
                      setFormData({ ...formData, tiktok: e.target.value })
                    }
                  />

                  {/* Facebook */}
                  <SocialMediaInput
                    label="فيسبوك"
                    icon={
                      <img
                        src="/icons/dashboard/facebook.svg"
                        alt="facebook"
                        className="w-5 h-5"
                      />
                    }
                    placeholder="https://www.facebook.com/aateneofficial"
                    value={formData.facebook}
                    onChange={(e) =>
                      setFormData({ ...formData, facebook: e.target.value })
                    }
                  />
                </div>

                {/* Instagram and YouTube Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Instagram */}
                  <SocialMediaInput
                    label="إنستجرام"
                    icon={
                      <img
                        src="/icons/dashboard/insta.svg"
                        alt="instagram"
                        className="w-5 h-5"
                      />
                    }
                    placeholder="https://www.instagram.com/aatene_official/"
                    value={formData.instagram}
                    onChange={(e) =>
                      setFormData({ ...formData, instagram: e.target.value })
                    }
                  />

                  {/* YouTube */}
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
                    onChange={(e) =>
                      setFormData({ ...formData, youtube: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Left Sidebar - Preview */}
          <div className="col-span-12 lg:col-span-4">
            <StorePreviewSidebar
              data={{
                logo: previousData.logo_preview,
                name: previousData.name,
                description: previousData.description,
                coverImages: previousData.cover,
              }}
            />
          </div>
        </div>


      </div>
      {/* Action Buttons */}
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
          className="px-12 py-5 bg-gray-4 border-none  cursor-pointer rounded-sm"
        >
          رجوع
        </Button>

      </div>
    </div>
  );
}

// Social Media Input Component
interface SocialMediaInputProps {
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function SocialMediaInput({
  label,
  icon,
  placeholder,
  value,
  onChange,
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
          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 text-sm focus:ring-blue-3"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          {icon}
        </div>
      </div>
    </div>
  );
}