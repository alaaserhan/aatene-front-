// src/features/(dashboard)/ai-agent/components/PlatformsSidebar.tsx
"use client";

import { cn } from "@/src/lib/utils";

interface PlatformsSidebarProps {
  activePlatform: string;
  onSelect: (platform: string) => void;
}

export function PlatformsSidebar({ activePlatform, onSelect }: PlatformsSidebarProps) {
  const platforms = [
    {
      id: "whatsapp",
      label: "واتساب",
      iconPath: "/icons/dashboard/whatsapp4.svg"
    },
    {
      id: "messenger",
      label: "ماسنجر",
      iconPath: "/icons/dashboard/facebook.svg"
    },
    {
      id: "instagram",
      label: "انستجرام",
      iconPath: "/icons/dashboard/insta.svg"
    },
  ];

  return (
    <>
      {/* Mobile: Horizontal scrollable tabs */}
      <div className="lg:hidden w-full bg-white rounded-xl border border-gray-200 p-2 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {platforms.map((platform) => {
            const isActive = activePlatform === platform.id;
            return (
              <button
                key={platform.id}
                onClick={() => onSelect(platform.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap",
                  isActive
                    ? "text-blue-4 bg-blue-5"
                    : "text-gray-2 hover:bg-gray-50"
                )}
              >
                <div
                  className={cn(
                    "w-4 h-4 transition-colors duration-200",
                    isActive ? "bg-blue-4" : "bg-gray-500"
                  )}
                  style={{
                    maskImage: `url(${platform.iconPath})`,
                    maskRepeat: "no-repeat",
                    maskPosition: "center",
                    maskSize: "contain",
                    WebkitMaskImage: `url(${platform.iconPath})`,
                    WebkitMaskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    WebkitMaskSize: "contain",
                  }}
                />
                <span>{platform.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop: Vertical sidebar */}
      <div className="hidden lg:flex bg-white rounded-xl border border-gray-200 h-[calc(100vh-124px)] p-4 py-6 w-[220px] flex-col shrink-0">
        <h3 className="text-lg font-bold mb-2 border-b border-gray-100 pb-4">
          منصات التواصل
        </h3>

        <div className="space-y-2 mt-4">
          {platforms.map((platform) => {
            const isActive = activePlatform === platform.id;
            return (
              <button
                key={platform.id}
                onClick={() => onSelect(platform.id)}
                className={cn(
                  "group w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                  isActive
                    ? "text-blue-4 bg-blue-5"
                    : "text-gray-2 hover:bg-gray-50"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 transition-colors duration-200",
                    isActive ? "bg-blue-4" : "bg-black-1"
                  )}
                  style={{
                    maskImage: `url(${platform.iconPath})`,
                    maskRepeat: "no-repeat",
                    maskPosition: "center",
                    maskSize: "contain",
                    WebkitMaskImage: `url(${platform.iconPath})`,
                    WebkitMaskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    WebkitMaskSize: "contain",
                  }}
                />

                <span>{platform.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}