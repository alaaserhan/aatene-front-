// src/features/(dashboard)/ai-agent/components/PlatformsSidebar.tsx
"use client";

import { cn } from "@/src/lib/utils";
import { usePathname } from "next/navigation";
import { useGetWebConversations } from "../hooks";

interface PlatformsSidebarProps {
  activePlatform: string;
  onSelect: (platform: string) => void;
  showToggle?: boolean;
}

function PlatformItem({
  label,
  iconPath,
  isActive,
  count,
  isRed,
  showToggle,
  onClick,
}: {
  label: string;
  iconPath: string;
  isActive: boolean;
  count?: number;
  isRed?: boolean;
  showToggle: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer group",
        isActive
          ? isRed ? "bg-red-50" : "bg-blue-5"
          : "hover:bg-gray-50"
      )}
    >
      {/* Right side: icon + label */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-5 h-5 shrink-0 transition-colors duration-200",
            isActive
              ? isRed ? "bg-red-500" : "bg-blue-4"
              : isRed ? "bg-red-400" : "bg-gray-400 group-hover:bg-gray-600"
          )}
          style={{
            maskImage: `url(${iconPath})`,
            maskRepeat: "no-repeat",
            maskPosition: "center",
            maskSize: "contain",
            WebkitMaskImage: `url(${iconPath})`,
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            WebkitMaskSize: "contain",
          }}
        />
        <span
          className={cn(
            "text-sm font-medium transition-colors duration-200",
            isActive
              ? isRed ? "text-red-600" : "text-blue-4"
              : isRed ? "text-red-500" : "text-gray-600 group-hover:text-gray-800"
          )}
        >
          {label}
        </span>
      </div>

      {/* Left side: count badge + toggle */}
      <div className="flex items-center gap-2">
        {count !== undefined && count > 0 && (
          <span className="text-xs font-bold bg-orange-100 text-orange-600 min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center">
            {count}
          </span>
        )}
        {showToggle && (
          <div
            className={cn(
              "w-9 h-5 rounded-full relative transition-all duration-300 shrink-0",
              isActive
                ? isRed ? "bg-red-500" : "bg-[#1DC355]"
                : "bg-gray-200"
            )}
          >
            <div
              className={cn(
                "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300",
                isActive ? "left-[18px]" : "left-0.5"
              )}
            />
          </div>
        )}
      </div>
    </button>
  );
}

export function PlatformsSidebar({ activePlatform, onSelect, showToggle = true }: PlatformsSidebarProps) {
  const pathname = usePathname();
  const isMessagesRoute = pathname.includes("messages");

  // Only count active/open conversations (not resolved)
  const { data: activeData } = useGetWebConversations({ state: "active" });
  const { data: waitingData } = useGetWebConversations({ state: "waiting" });
  const { data: withAgentData } = useGetWebConversations({ state: "with_agent" });
  const webCount = (activeData?.total || 0) + (waitingData?.total || 0) + (withAgentData?.total || 0);

  const standardPlatforms = [
    { id: "whatsapp", label: "واتساب", iconPath: "/icons/dashboard/whatsapp4.svg" },
    { id: "instagram", label: "انستجرام", iconPath: "/icons/dashboard/insta.svg" },
    { id: "website", label: "الموقع ", iconPath: "/icons/dashboard/website.svg", count: webCount },
    { id: "mobile", label: "التطبيق", iconPath: "/icons/dashboard/mobile.svg" },
  ];

  const productPlatforms = [
    { id: "api4_whatsapp", label: "واتساب", iconPath: "/icons/dashboard/whatsapp4.svg" },
    { id: "p_instagram", label: "انستجرام", iconPath: "/icons/dashboard/insta.svg" },
    { id: "p_website", label: "الموقع الالكتروني", iconPath: "/icons/dashboard/website.svg" },
    { id: "p_mobile", label: "التطبيق", iconPath: "/icons/dashboard/mobile.svg" },
  ];

  const deletedPlatform = {
    id: "deleted_chats",
    label: "المحادثات المحذوفة",
    iconPath: "/icons/dashboard/trash.svg",
  };

  return (
    <>
      {/* Mobile: Horizontal scrollable tabs */}
      <div className="lg:hidden w-full bg-white rounded-xl border border-gray-200 p-2 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {standardPlatforms.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                activePlatform === p.id ? "bg-blue-5 text-blue-4" : "text-gray-2 hover:bg-gray-50"
              )}
            >
              <div
                className={cn("w-4 h-4", activePlatform === p.id ? "bg-blue-4" : "bg-gray-500")}
                style={{
                  maskImage: `url(${p.iconPath})`,
                  maskRepeat: "no-repeat",
                  maskPosition: "center",
                  maskSize: "contain",
                  WebkitMaskImage: `url(${p.iconPath})`,
                  WebkitMaskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  WebkitMaskSize: "contain",
                }}
              />
              <span>{p.label}</span>
            </button>
          ))}
          {isMessagesRoute && (
            <button
              onClick={() => onSelect(deletedPlatform.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                activePlatform === deletedPlatform.id ? "bg-red-50 text-red-600" : "text-red-500 hover:bg-red-50"
              )}
            >
              {deletedPlatform.label}
            </button>
          )}
        </div>
      </div>

      {/* Desktop: Vertical sidebar */}
      <div className="hidden lg:flex bg-white rounded-xl border border-gray-200 h-[calc(100vh-124px)] p-4 py-5 w-[220px] flex-col shrink-0 overflow-y-auto custom-scrollbar">

        <h3 className="text-base font-bold mb-3 pb-3 border-b border-gray-100">
          منصات التواصل
        </h3>
        <div className="space-y-1">
          {standardPlatforms.map((p) => (
            <PlatformItem
              key={p.id}
              label={p.label}
              iconPath={p.iconPath}
              isActive={activePlatform === p.id}
              count={p.count}
              showToggle={showToggle}
              onClick={() => onSelect(p.id)}
            />
          ))}
        </div>

        {isMessagesRoute && (
          <>
            <h3 className="text-base font-bold mt-5 mb-3 pb-3 border-b border-gray-100">
              محادثات المنتجات والخدمات
            </h3>
            <div className="space-y-1">
              {productPlatforms.map((p) => (
                <PlatformItem
                  key={p.id}
                  label={p.label}
                  iconPath={p.iconPath}
                  isActive={false}
                  showToggle={false}
                  onClick={() => {}}
                />
              ))}
            </div>

            <div className="border-t border-gray-100 mt-5 pt-4">
              <PlatformItem
                label={deletedPlatform.label}
                iconPath={deletedPlatform.iconPath}
                isActive={activePlatform === deletedPlatform.id}
                isRed
                showToggle={showToggle}
                onClick={() => onSelect(deletedPlatform.id)}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}