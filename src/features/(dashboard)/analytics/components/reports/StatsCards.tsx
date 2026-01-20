// src/components/(admin)/analytics/reports/StatsCards.tsx
import { cn } from "@/src/lib/utils";
import React from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: any;
  colorTheme: string;
}

export function StatsCards({ cards }: { cards: StatCardProps[] }) {
  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case "green": return { bg: "bg-[#ECFDF5]", text: "text-[#10B981]" };
      case "red": return { bg: "bg-[#FEF2F2]", text: "text-[#EF4444]" };
      case "yellow": return { bg: "bg-[#FFFBEB]", text: "text-[#F59E0B]" };
      case "blue": return { bg: "bg-[#F0F9FF]", text: "text-[#0284C7]" };
      case "gray": return { bg: "bg-[#F3F4F6]", text: "text-[#3A5779]" };
      default: return { bg: "", text: "" };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      {cards.map((card, index) => {
        const isHex = card.colorTheme.startsWith("#") || card.colorTheme.startsWith("rgb");
        let textColorClass = "";
        let inlineStyle = {};

        if (isHex) {
            inlineStyle = { color: card.colorTheme };
        } else {
            const theme = getThemeClasses(card.colorTheme);
            textColorClass = theme.text;
        }

        const isComponent = typeof card.icon === 'function';
        const Icon = card.icon;

        return (
          <div key={index} className="bg-white rounded-lg p-6  flex flex-col items-center justify-center gap-3 border border-transparent hover:border-gray-100 transition-all">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-1")}>
              {isComponent ? (
                <Icon className={cn("w-11 h-11", textColorClass)} style={inlineStyle} />
              ) : (
                <div className="w-11 h-11 flex items-center justify-center">
                  {card.icon}
                </div>
              )}
            </div>
            <span className=" text-sm">{card.title}</span>
            <span className={cn("text-3xl font-bold", textColorClass)} style={inlineStyle}>{card.value}</span>
          </div>
        );
      })}
    </div>
  );
}