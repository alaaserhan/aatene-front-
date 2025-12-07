"use client";

import { cn } from "@/src/lib/utils";
import { LayoutDashboard, Phone, Facebook, Instagram } from "lucide-react";

interface PlatformsSidebarProps {
  activePlatform: string;
  onSelect: (platform: string) => void;
}

export function PlatformsSidebar({ activePlatform, onSelect }: PlatformsSidebarProps) {
  const platforms = [
    { id: "website", label: "الموقع الالكتروني", icon: LayoutDashboard },
    { id: "whatsapp", label: "وتساب", icon: Phone }, // Using Phone as generic or custom SVG if available
    { id: "messenger", label: "ماسنجر", icon: Facebook },
    { id: "instagram", label: "انستجرام", icon: Instagram },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200  h-[calc(100vh-124px)] p-4 py-6 w-[220px] flex flex-col">
      <h3 className="text-lg font-bold  mb-2 border-b border-gray-100 pb-4 ">
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
                "w-full flex items-center  gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                isActive 
                  ? "text-[#D97706] " // Active Orange/Gold style
                  : "text-gray-600 hover:bg-gray-50 "
              )}
            >
              <platform.icon 
                className={cn(
                  "w-5 h-5",
                  isActive ? "text-[#D97706]" : "text-gray-500"
                )} 
                strokeWidth={1.5} 
              />
              <span>{platform.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}