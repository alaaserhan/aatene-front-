// src/features/(dashboard)/settings/components/BasicInfoSection.tsx
"use client";

import { useState } from "react";
import { MapPin, Mail, Upload } from "lucide-react";
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


interface BasicInfoData {
  siteName: string;
  logo: File | null;
  email: string;
  address: string;
  phone: string;
  whatsapp: string;
}

export function BasicInfoSection() {
  const [formData, setFormData] = useState<BasicInfoData>({
    siteName: "اعطني",
    logo: null,
    email: "bestshop@info.com",
    address: "شارع الخالق، مصر الجديدة، محافظة القاهرة، مصر",
    phone: "1289022985",
    whatsapp: "1289022985",
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, logo: file });
      setLogoPreview(URL.createObjectURL(file));
      e.target.value = "";
    }
  };

  const handleSave = () => {
    console.log("Saving basic info:", formData);
  };

  return (
    <div className="space-y-8">
      <div >
        <div className=" space-y-6">
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

                {/* Logo */}
      <div className="space-y-2">
        <Label htmlFor="logo" className="text-right">
          شعار الموقع <span className="text-red-500">*</span>
        </Label>
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="logo-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">اضغط للرفع</span> أو اسحب وأفلت
              </p>
              <p className="text-xs text-gray-500">SVG, PNG, JPG (MAX. 800x400px)</p>
            </div>
            <Input id="logo-upload" type="file" className="hidden" />
          </label>
        </div>
      </div>


          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-start">
              البريد الإلكتروني
            </Label>
            <div className="flex items-center gap-3 px-3 border border-gray-300 rounded-lg focus-within:border-brand-blue-2">
              <img src="/icons/dashboard/email.svg" className="w-5 h-5" alt="" />
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
              <img src="/icons/dashboard/mark.svg" alt="" className="w-5 h-5"/>
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
              <div
                className="flex items-center border border-gray-300 rounded-lg focus-within:border-brand-blue-2"
              >
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
              <div
                className="flex items-center border border-gray-300 rounded-lg focus-within:border-brand-blue-2"
              >
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
        >
          حفظ الإعدادات
        </Button>
      </div>
    </div>
  );
}