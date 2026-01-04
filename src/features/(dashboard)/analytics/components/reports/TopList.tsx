// src/components/(admin)/analytics/reports/TopList.tsx
import { cn } from "@/src/lib/utils";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { ChevronLeft, Flag } from "lucide-react";

export interface TopListItem {
    id: number | string;
    title: string;
    subtitle?: string;
    image?: string | null;
    rank?: number;
    badgeText?: string;
    badgeColor?: string;
}

interface TopListProps {
    title: string;
    subtitle: string;
    items: TopListItem[];
    className?: string;
    icon?: any;
}

export function TopList({ title, subtitle, items, className, icon: Icon }: TopListProps) {
    return (
        <div className={cn("bg-white rounded-lg p-4 flex flex-col", className)}>
            <div className="mb-4 shrink-0 flex items-center justify-between ">
                {Icon && <Icon className="w-5 h-5 text-red-500 me-2" />}

                <div className="flex flex-col  flex-1">
                    <h3 className="text-lg font-bold  flex items-center gap-2">
                        {title}
                    </h3>
                    <p className="text-xs text-gray-2 ">{subtitle}</p>
                </div>
            </div>

            <ScrollArea className="flex-1 pl-3 mt-2" dir="rtl">
                <div className="flex flex-col gap-3">
                    {items.length > 0 ? (
                        items.map((item, index) => (
                            <div key={item.id} className="flex items-center justify-between group p-2  rounded-lg transition-colors border border-transparent ">
                                {item.rank && (
                                    <div className="w-8 flex justify-center">
                                        <span className={cn(
                                            "font-bold text-lg",
                                            index === 0 ? "text-[#10B981]" :
                                                index === 1 ? "text-gray-700" :
                                                    index === 2 ? "text-[#F59E0B]" : "text-gray-2"
                                        )}>
                                            {item.rank}
                                        </span>
                                    </div>
                                )}


                                {/* Center: Details */}
                                <div className="flex  gap-4 flex-1 ">
                                    {/* Image/Avatar */}
                                    <div className="w-12 h-12 rounded-sm bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                        {item.image ? (
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xs font-bold text-gray-2">{item.title.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div className="flex flex-col  gap-1">
                                        <span className="text-sm font-medium  line-clamp-1">{item.title || "-"}</span>
                                        <div className="flex items-center gap-2 flex-wrap ">
                                            {item.subtitle && <span className="text-[11px] text-gray-2 font-medium">{item.subtitle}</span>}
                                            {item.badgeText && (
                                                <span className={cn("text-[10px] px-2.5 py-0.5 rounded-full font-bold", item.badgeColor || "bg-gray-100 text-gray-600")}>
                                                    {item.badgeText}
                                                </span>
                                            )}
                                        </div>
                                    </div>


                                </div>

                                {/* <button className="text-gray-300 hover:text-[#3A5779] transition-colors p-1">
                                    <ChevronLeft className="w-5 h-5" />
                                </button> */}

                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 text-gray-400 text-sm flex flex-col items-center gap-2">
                            <span>لا توجد بيانات متاحة</span>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}