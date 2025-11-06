// src/features/(dashboard)/settings/components/BasicInfoSection.tsx
"use client";

import { useState, useEffect } from "react";
import { Upload, X } from "lucide-react";
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
import { useUpdateSettings } from "../hooks";
import { toast } from "sonner";
import { MapModal } from "./MapModal";

interface BasicInfoData {
  siteName: string;
  logo: File | null;
  logoPreview: string | null;
  email: string;
  address: string;
  phone: string;
  whatsapp: string;
  selectedLanguages: string[];
}

const AVAILABLE_LANGUAGES = [
  { id: "ar", label: "العربية" },
  { id: "en", label: "الإنجليزية" },
  { id: "he", label: "العبرية" },
];

interface BasicInfoSectionProps {
  onLanguagesChange?: (languages: string[]) => void;
  initialData?: any;
}

export function BasicInfoSection({
  onLanguagesChange,
  initialData,
}: BasicInfoSectionProps) {
  const [formData, setFormData] = useState<BasicInfoData>({
    siteName: "",
    logo: null,
    logoPreview: null,
    email: "",
    address: "",
    phone: "",
    whatsapp: "",
    selectedLanguages: ["ar", "en", "he"],
  });

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const updateSettingsMutation = useUpdateSettings();

  // تحميل البيانات الأولية
  useEffect(() => {
    if (initialData) {
      setFormData({
        siteName: initialData.name || "",
        logo: null,
        logoPreview: initialData.logo_url || null,
        email: initialData.email || "",
        address: initialData.address || "",
        phone: initialData.phone || "",
        whatsapp: initialData.whatsapp || "",
        selectedLanguages: ["ar", "en", "he"], // يمكن تحديثها لاحقاً من API
      });
    }
  }, [initialData]);

  // (((( تم حذف الـ useEffect المسبب للـ Loop من هنا ))))

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setFormData({ ...formData, logo: file, logoPreview: preview });
    }
  };

  const handleRemoveLogo = () => {
    if (formData.logoPreview && formData.logoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(formData.logoPreview);
    }
    setFormData({ ...formData, logo: null, logoPreview: null });
  };

  const handleToggleLanguage = (langId: string) => {
    let newLanguages: string[] = [];
    
    setFormData((prev) => {
      const isSelected = prev.selectedLanguages.includes(langId);
      newLanguages = isSelected
        ? prev.selectedLanguages.filter((id) => id !== langId)
        : [...prev.selectedLanguages, langId];

      if (newLanguages.length === 0) {
        newLanguages = [langId];
      }

      return {
        ...prev,
        selectedLanguages: newLanguages,
      };
    });

    // (((( هذا هو التعديل الثاني: ننادي الدالة يدوياً هنا ))))
    if (onLanguagesChange) {
      onLanguagesChange(newLanguages);
    }
  };

  const handleSelectAddressFromMap = (
    address: string,
    lat: number,
    lng: number
  ) => {
    setFormData({ ...formData, address });
  };

  const handleSave = async () => {
    try {
      await updateSettingsMutation.mutateAsync({
        name: formData.siteName,
        logo: formData.logo,
        main_color: initialData?.main_color || "#000000",
        email: formData.email,
        address: formData.address,
        whatsapp: formData.whatsapp,
        phone: formData.phone,
        facebook: initialData?.facebook || "",
        instagram: initialData?.instagram || "",
        snapchat: initialData?.snapchat || "",
        tiktok: initialData?.tiktok || "",
        x: initialData?.x || "",
        youtube: initialData?.youtube || "",
        added_privacy_policies: initialData?.added_policies || [],
        policies: initialData?.policies || [],
        added_terms: initialData?.added_terms || [],
        terms: initialData?.terms || [],
      });
      toast.success("تم حفظ البيانات الأساسية بنجاح");
    } catch (error) {
      console.error("Error saving basic info:", error);
    }
  };

  return (
    <>
      <div className="space-y-8">
        <div>
          <div className="space-y-6">
            {/* Site Name */}
            <div className="space-y-2">
              <Label htmlFor="siteName" className="text-start">
                اسم الموقع <span className="text-red-500">*</span>
              </Label>
              <Input
                id="siteName"
                type="text"
                value={formData.siteName}
                onChange={(e) =>
                  setFormData({ ...formData, siteName: e.target.value })
                }
                maxLength={50}
                className="w-full text-start"
              />
              <p className="text-xs text-gray-500 text-end">
                {formData.siteName.length}/50
              </p>
            </div>

            {/* Site Languages */}
            <div className="space-y-2">
              <Label className="text-start">
                لغة الموقع <span className="text-red-500">*</span>
              </Label>
              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex gap-3">
                  {AVAILABLE_LANGUAGES.map((lang) => {
                    const isSelected = formData.selectedLanguages.includes(
                      lang.id
                    );
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

            {/* Logo */}
            <div className="space-y-2">
              <Label htmlFor="logo" className="text-start">
                شعار الموقع <span className="text-red-500">*</span>
              </Label>
              {!formData.logoPreview ? (
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="logo-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">اضغط للرفع</span> أو اسحب
                        وأفلت
                      </p>
                      <p className="text-xs text-gray-500">
                        SVG, PNG, JPG (MAX. 800x400px)
                      </p>
                    </div>
                    <Input
                      id="logo-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                  </label>
                </div>
              ) : (
                <div className="relative border-1 border-gray-300 rounded-lg bg-gray-50 p-4">
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute cursor-pointer top-2 left-2 p-2 bg-red-100 rounded-sm hover:bg-red-200 transition-colors"
                  >
                    <img
                      src="/icons/dashboard/trash.svg"
                      alt="حذف"
                      className="w-5 h-5"
                    />
                  </button>
                  <div className="flex items-center justify-center">
                    <img
                      src={formData.logoPreview}
                      alt="Logo Preview"
                      className="max-h-32 object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Email */}
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
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full h-10 border-none shadow-none px-0 focus-visible:ring-0"
                />
              </div>
            </div>

            {/* Address */}
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
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
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

            {/* Phone Numbers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mobile */}
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
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="flex-1 h-10 border-none shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>

              {/* WhatsApp */}
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
                    value={formData.whatsapp}
                    onChange={(e) =>
                      setFormData({ ...formData, whatsapp: e.target.value })
                    }
                    className="flex-1 h-10 border-none shadow-none  focus-visible:ring-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center pt-2">
          <Button
            onClick={handleSave}
            variant="link"
            disabled={updateSettingsMutation.isPending}
          >
            {updateSettingsMutation.isPending ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </Button>
        </div>
      </div>

      {/* Map Modal */}
      <MapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onSelectAddress={handleSelectAddressFromMap}
        initialAddress={formData.address}
      />
    </>
  );
}