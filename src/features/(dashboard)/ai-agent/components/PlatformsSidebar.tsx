// src/features/(dashboard)/ai-agent/components/PlatformsSidebar.tsx
"use client";

import { cn } from "@/src/lib/utils";
import { usePathname } from "next/navigation";

interface PlatformsSidebarProps {
  activePlatform: string;
  onSelect: (platform: string) => void;
}

export function PlatformsSidebar({ activePlatform, onSelect }: PlatformsSidebarProps) {
  const pathname = usePathname();
  const isMessagesRoute = pathname === "/admin/mosa3edy/messages";
  const standardPlatforms = [
    {
      id: "whatsapp",
      label: "واتساب",
      iconPath: "/icons/dashboard/whatsapp4.svg"
    },
    {
      id: "instagram",
      label: "انستجرام",
      iconPath: "/icons/dashboard/insta.svg"
    },
    {
      id: "website",
      label: "الموقع",
      iconPath: "/icons/dashboard/website.svg"
    },
    {
      id: "mobile",
      label: "الموبايل",
      iconPath: "/icons/dashboard/mobile.svg"
    }
  ];

  const productPlatforms = [
    {
      id: "api4_whatsapp",
      label: "واتساب",
      iconPath: "/icons/dashboard/whatsapp4.svg"
    }
  ];

  const deletedPlatform = {
    id: "deleted_chats",
    label: "المحادثات المحذوفة",
    iconPath: "/icons/dashboard/trash.svg"
  };

  const allPlatforms = [
    ...standardPlatforms,
    ...(isMessagesRoute ? productPlatforms : []),
    ...(isMessagesRoute ? [deletedPlatform] : [])
  ];

  const renderButton = (platform: typeof deletedPlatform, isMobile: boolean) => {
    const isActive = activePlatform === platform.id;
    const isDeleted = platform.id === "deleted_chats";
    return (
      <button
        key={platform.id}
        onClick={() => onSelect(platform.id)}
        className={cn(
          "group flex items-center font-medium transition-all duration-200 cursor-pointer",
          isMobile
            ? "gap-2 px-4 py-2.5 rounded-lg text-sm whitespace-nowrap"
            : "w-full gap-3 px-4 py-3 rounded-lg text-sm",
          isActive
            ? isDeleted ? "text-red-500 bg-red-50" : "text-blue-4 bg-blue-5"
            : isDeleted
              ? "text-red-500 hover:bg-red-50"
              : "text-gray-2 hover:bg-gray-50"
        )}
      >
        <div
          className={cn(
            "transition-colors duration-200",
            isMobile ? "w-4 h-4" : "w-5 h-5",
            isActive
              ? isDeleted ? "bg-red-500" : "bg-blue-4"
              : isDeleted ? "bg-red-500" : isMobile ? "bg-gray-500" : "bg-black-1"
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
  };

  return (
    <>
      {/* Mobile: Horizontal scrollable tabs */}
      <div className="lg:hidden w-full bg-white rounded-xl border border-gray-200 p-2 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {allPlatforms.map((platform) => renderButton(platform, true))}
        </div>
      </div>

      {/* Desktop: Vertical sidebar */}
      <div className="hidden lg:flex bg-white rounded-xl border border-gray-200 h-[calc(100vh-124px)] p-4 py-6 w-[220px] flex-col shrink-0 overflow-y-auto custom-scrollbar">
        <h3 className="text-lg font-bold mb-2 border-b border-gray-100 pb-4">
          منصات التواصل
        </h3>

        <div className="space-y-2 mt-4 border-b border-gray-100 pb-4">
          {standardPlatforms.map((platform) => renderButton(platform, false))}
        </div>

        {isMessagesRoute && (
          <>
            <h3 className="font-bold mt-6">
              محادثات المنتجات والخدمات
            </h3>
            <div className="space-y-2 mt-4">
              {productPlatforms.map((platform) => renderButton(platform, false))}
            </div>

            <div className="border-t border-gray-100 mt-6 pt-6">
              <div className="space-y-2">
                {renderButton(deletedPlatform, false)}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}