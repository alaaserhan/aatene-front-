// src/features/(dashboard)/ai-agent/components/PlatformsSidebar.tsx
"use client";

import { cn } from "@/src/lib/utils";

interface PlatformsSidebarProps {
  activePlatform: string;
  onSelect: (platform: string) => void;
}

export function PlatformsSidebar({ activePlatform, onSelect }: PlatformsSidebarProps) {
  // قمنا بتغيير الهيكلية لنحتفظ بمسار الصورة فقط كنص، بدلاً من عنصر JSX
  // هذا يسمح لنا بالتحكم في التنسيق برمجياً
  const platforms = [
    { 
      id: "whatsapp", 
      label: "واتساب", 
      iconPath: "/icons/dashboard/whatsapp4.svg" 
    },
    { 
      id: "messenger", 
      label: "فيسبوك", 
      iconPath: "/icons/dashboard/facebook.svg" 
    },
    { 
      id: "instagram", 
      label: "انستجرام", 
      iconPath: "/icons/dashboard/insta.svg" 
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 h-[calc(100vh-124px)] p-4 py-6 w-[220px] flex flex-col shrink-0">
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
                  ? "text-[#D97706] bg-orange-50/50" // إضافة خلفية خفيفة جداً عند النشاط لجمالية أكثر
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              {/* هنا السحر: نستخدم div بدلاً من img 
                ونقوم بتلوين الخلفية (bg) بناءً على الحالة
                ونستخدم الصورة كـ Mask
              */}
              <div 
                className={cn(
                  "w-5 h-5 transition-colors duration-200",
                  isActive ? "bg-[#D97706]" : "bg-black-1"
                )}
                style={{
                  maskImage: `url(${platform.iconPath})`,
                  maskRepeat: "no-repeat",
                  maskPosition: "center",
                  maskSize: "contain",
                  WebkitMaskImage: `url(${platform.iconPath})`, // لدعم متصفحات Chrome/Safari القديمة
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
  );
}