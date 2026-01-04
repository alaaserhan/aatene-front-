// src/components/(admin)/analytics/reports/StatsCards.tsx
import { cn } from "@/src/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  colorTheme: "blue" | "green" | "red" | "yellow" | "gray";
}

export function StatsCards({ cards }: { cards: StatCardProps[] }) {
  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case "green": return { bg: "bg-[#ECFDF5]", text: "text-[#10B981]" }; 
      case "red": return { bg: "bg-[#FEF2F2]", text: "text-[#EF4444]" };   
      case "yellow": return { bg: "bg-[#FFFBEB]", text: "text-[#F59E0B]" }; 
      case "blue": return { bg: "bg-[#F0F9FF]", text: "text-[#0284C7]" };   
      default: return { bg: "bg-[#F3F4F6]", text: "text-[#3A5779]" };       
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      {cards.map((card, index) => {
        const theme = getThemeClasses(card.colorTheme);
        const Icon = card.icon;
        
        return (
          <div key={index} className="bg-white rounded-lg p-6  flex flex-col items-center justify-center gap-3 border border-transparent hover:border-gray-100 transition-all">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-1", theme.bg)}>
              <Icon className={cn("w-7 h-7", theme.text)} />
            </div>
            <span className="text-gray-2 text-sm font-medium">{card.title}</span>
            <span className={cn("text-3xl font-bold", theme.text)}>{card.value}</span>
          </div>
        );
      })}
    </div>
  );
}