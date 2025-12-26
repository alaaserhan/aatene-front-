// src/components/(dashboard)/ProviderInfoCard.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { MapPin, Flag, Plus, Star, ShieldCheck, ShoppingCart, Clock, AlertCircle, AlarmClock } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Store } from "@/src/features/(dashboard)/stores/api";

interface ProviderInfoCardProps {
    store: Store; // يفضل استخدام النوع الصحيح Store Interface بدلاً من any
    className?: string;
}

export function ProviderInfoCard({ store, className }: ProviderInfoCardProps) {
    if (!store) return null;

    // تنسيق التاريخ (عضو منذ)
    const formattedDate = store.owner?.created_at
        ? new Date(store.owner.created_at).toLocaleDateString('en-GB') // 19-03-2025
        : "N/A";

    return (
        <div className={cn("bg-white rounded-2xl p-4 border border-gray-100", className)}>
            {/* الجزء العلوي */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex items-center gap-4  w-full md:w-auto ">
                    <Avatar className="w-14 h-14 border-2 border-white shadow-sm">
                        <AvatarImage src={store.owner?.avatar_url || ""} />
                        <AvatarFallback>{store.owner?.first_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="">
                        <h3 className=" font-medium  mb-1">
                            {store.owner?.first_name} {store.owner?.last_name}
                        </h3>
                        <div className="flex items-center  gap-1 text-gray-500 text-sm">
                            <MapPin className="w-4 h-4 text-blue-4" />
                            <span>{store.serviceCities?.[0]?.name || "فلسطين، الخليل"}</span>
                        </div>
                    </div>

                </div>

                <div className="flex gap-2  w-full md:w-auto">
                    <Button className="bg-[#0F2942] hover:bg-[#1A2D42] text-white font-bold h-8 px-8 gap-2 rounded-md flex-1 md:flex-none">
                        <Plus className="w-4 h-4" />
                        <span>تابع</span>
                    </Button>
                    <Button variant="destructive" className="bg-[#EF4444] hover:bg-[#d93838] text-white font-bold h-8 px-6 gap-2 rounded-md flex-1 md:flex-none">
                        <Flag className="w-4 h-4" />
                        <span>بلغ عن إساءة</span>
                    </Button>
                </div>

            </div>

            {/* الفاصل */}
            <div className="border-t border-gray-100 mb-6"></div>

            {/* شريط الإحصائيات السفلي */}
            <div className="flex flex-wrap items-center  gap-8 text-sm text-gray-600">

                <div className="flex items-center gap-2">
                    <AlarmClock className="w-4 h-4 text-black" />
                    <span>عضو منذ {formattedDate}</span>
                </div>

                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-black" />
                    <span>بائع معتمد</span>
                </div>

                <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-black" />
                    <span>تقييم البائع {store.review_rate || "5.0"}</span>
                </div>

                <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-black" />
                    <span>عدد مرات التواصل للطلب {store.conversations_count}</span>
                </div>

            </div>
        </div>
    );
}