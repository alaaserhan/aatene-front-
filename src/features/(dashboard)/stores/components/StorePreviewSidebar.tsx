// src/features/(dashboard)/stores/components/StorePreviewSidebar.tsx
"use client";

import { cn } from "@/src/lib/utils";

interface StorePreviewData {
  logo?: string | null;
  name?: string;
  description?: string;
  coverImages?: string[];
}

interface StorePreviewSidebarProps {
  data: StorePreviewData;
}

export function StorePreviewSidebar({ data }: StorePreviewSidebarProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
      <h3 className="font-medium text-blue-4 mb-6 text-center text-lg">
        معاينة صفحة المتجر
      </h3>

      {/* Browser Mockup Container */}
      <div className="bg-white rounded-lg overflow-hidden ">
        {/* Browser Header */}
        <div className="bg-[#FFE5E5] px-4 h-8 flex items-center justify-between direction-rtl">
          {/* Dots (Right Side) */}
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#FF5F5F]" />
            <div className="w-2 h-2 rounded-full bg-[#FFBD2E]" />
            <div className="w-2 h-2 rounded-full bg-[#27C93F]" />
          </div>
          {/* Fake Address Bar (Left Side) */}
          <div className="w-24 h-3 bg-white/90 rounded-xs" />
        </div>

        {/* Browser Content */}
        <div className="bg-[#FAFAFA] min-h-[450px] pb-8">
          {/* Cover Area (Twitter Style) */}
          <div className="h-20 bg-[#F9FAFC] w-full flex items-center justify-center relative mb-2">
            {/* Cover Placeholder Icon */}
            <svg
              className="w-10 h-10 text-gray-200"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>

          {/* Profile Info Bar (Overlapping Cover) */}
          <div className="px-6 relative">
            <div className="flex justify-between items-end -mt-12 mb-6">
              {/* Right Side: Logo & Name */}
              <div className="flex items-end gap-2">
                {/* Logo Container */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-[2px] border-[#DFB400] bg-gray-200 shadow-sm flex items-center justify-center overflow-hidden">
                    {data.logo ? (
                      <img
                        src={data.logo}
                        alt="Store Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-3xl font-bold text-gray-800">
                        {data.name ? data.name.charAt(0).toUpperCase() : "S"}
                      </div>
                    )}
                  </div>
                  {/* Verification Badge */}
                  <div className="absolute bottom-0 left-0 w-6 h-6 bg-[#F4B740] rounded-full flex items-center justify-center border-2 border-white text-white">
                    <img src="/icons/dashboard/correct.svg" className="w-4 h-4 mt-[1px] me-[1px]" alt="" />
                  </div>
                </div>

                {/* Store Name */}
                <div className="mb-3">
                  {data.name ? (
                    <h2 className=" font-medium text-sm leading-tight">
                      {data.name}
                    </h2>
                  ) : (
                    <h2 className=" font-medium leading-tight">
                      متجر الأفضل
                    </h2>
                  )}
                </div>
              </div>

              {/* Left Side: Social Placeholders */}
              <div className="flex flex-col gap-1 mb-3">
                <div className="flex gap-2">
                  <div className="w-6 h-6 bg-gray-200 rounded-xs" />
                  <div className="w-6 h-6 bg-gray-200 rounded-xs" />
                  <div className="w-6 h-6 bg-gray-200 rounded-xs" />
                </div>
                <div className="w-8 h-1 bg-gray-200 rounded-full" />
                <div className="w-11 h-1 bg-gray-200 rounded-full" />
              </div>
            </div>

            {/* Description Box */}
            <div className="border border-gray-200 rounded p-2 min-h-[140px]">
              {data.description ? (
                <p className="text-sm leading-relaxed">
                  {data.description}
                </p>
              ) : (
                <p className="text-sm text-gray-2">هنا مثال لوصف المتجر</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}