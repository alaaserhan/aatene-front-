"use client";

import { cn } from "@/src/lib/utils";
import { ImageIcon, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";

interface ServicePreviewSidebarProps {
  data: {
    title: string;
    price: number;
    coverImage: string;
  };
  storeInfo?: {
    name: string;
    avatar: string;
    address?: string;
  };
}

export function ServicePreviewSidebar({ data, storeInfo }: ServicePreviewSidebarProps) {

  const getFormattedPrice = (price?: number) => {
    if (!price || price === 0) return "-";

    const number = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
    }).format(price);

    return `${number} ₪`;
  };

  const formattedPrice = getFormattedPrice(data.price);

  return (
    <div className="sticky top-6">
      <div className="mx-auto w-full bg-white rounded-xl overflow-hidden border border-gray-200 relative">

        {/* Header */}
        <h3 className="font-bold text-center text-lg py-6">
          بطاقة الخدمة
        </h3>

        {/* Content Area */}
        <div className="bg-[#F9FAFB] p-4 flex flex-col items-center min-h-[400px]">

          {/* Card Container */}
          <div className="bg-white w-full rounded-2xl overflow-hidden border border-gray-100 pb-4">

            {/* 1. Image Placeholder/Display */}
            <div className="relative w-full aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
              {data.coverImage ? (
                <img
                  src={data.coverImage}
                  alt="Service Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mb-2">
                    <ImageIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
              )}
            </div>

            {/* 2. Service Info */}
            <div className="p-4 space-y-2">
              <h2 className="text-base font-bold  leading-tight">
                {data.title || "عنوان الخدمة يظهر هنا"}
              </h2>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">سعر الخدمة</span>
                {/* تم استخدام المتغير الجديد formattedPrice */}
                <span className="font-medium text-lg text-blue-3">
                  {formattedPrice}
                </span>
              </div>
            </div>

            <div className="px-4">
              <div className="h-[1px] w-full bg-gray-100 my-2"></div>
            </div>

            {/* 3. Provider Info */}
            <div className="px-4 py-2 flex items-center gap-3">
              <Avatar className="w-10 h-10 border border-gray-100">
                <AvatarImage src={storeInfo?.avatar} />
                <AvatarFallback>{storeInfo?.name?.[0] || "S"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-bold ">
                  {storeInfo?.name || "اسم مقدم الخدمة"}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span>{storeInfo?.address || "فلسطين، الخليل"}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}