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
      <h3 className=" font-medium text-blue-4 mb-6 text-center">
        معاينة صفحة المتجر
      </h3>

      {/* Browser Mockup */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Browser Header */}
        <div className="bg-[#FFE5E5] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF5F5F]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
          </div>
          <div className="flex-1 mx-4 bg-white rounded px-3 py-1">
            <div className="w-2 h-2 bg-gray-300 rounded" />
          </div>
        </div>

        {/* Browser Content */}
        <div className="p-6 bg-gray-50 min-h-[400px]">
          {/* Store Logo & Info */}
          <div className="flex items-start gap-4 mb-4">
            {/* Placeholder boxes */}
            <div className="space-y-2">
              <div className="w-16 h-3 bg-gray-200 rounded" />
              <div className="w-12 h-3 bg-gray-200 rounded" />
              <div className="w-14 h-3 bg-gray-200 rounded" />
            </div>

            {/* Empty image placeholder on left side */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-gray-200 rounded" />
            </div>

            {/* Logo with yellow ring */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-full border-4 border-yellow-400 bg-white flex items-center justify-center overflow-hidden">
                {data.logo ? (
                  <img
                    src={data.logo}
                    alt="Store Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-2">
                    <svg
                      className="w-12 h-12 text-gray-300 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              {/* Yellow edit button */}
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Store Name */}
          <div className="text-right mb-3">
            {data.name ? (
              <h2 className="text-xl font-bold text-gray-900">{data.name}</h2>
            ) : (
              <div className="text-lg text-gray-400">متجر الأفضل</div>
            )}
          </div>

          {/* Description Box */}
          <div className="rounded border border-gray-300 p-4 min-h-[150px]">
            {data.description ? (
              <p className="text-sm ">
                {data.description}
              </p>
            ) : (
              <p className="text-sm ">
                هنا مثال لوصف المتجر
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}