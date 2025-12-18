// src/components/(dashboard)/ProviderInfoCard.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { MapPin, Flag, Plus, Star, ShieldCheck, ShoppingCart, Clock } from "lucide-react";
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
        <div className={cn("bg-white rounded-2xl p-6 shadow-sm border border-gray-100", className)}>
            {/* الجزء العلوي */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                
                {/* الإجراءات (يسار في التصميم العربي) */}
                <div className="flex gap-3 order-2 md:order-1 w-full md:w-auto">
                    <Button variant="destructive" className="bg-[#EF4444] hover:bg-[#d93838] text-white font-bold h-10 px-4 gap-2 rounded-lg flex-1 md:flex-none">
                        <Flag className="w-4 h-4" />
                        <span>بلغ عن إساءة</span>
                    </Button>
                    <Button className="bg-[#0F2942] hover:bg-[#1A2D42] text-white font-bold h-10 px-6 gap-2 rounded-lg flex-1 md:flex-none">
                        <Plus className="w-4 h-4" />
                        <span>تابع</span>
                    </Button>
                </div>

                {/* بيانات المستخدم (يمين في التصميم العربي) */}
                <div className="flex items-center gap-4 order-1 md:order-2 w-full md:w-auto justify-end">
                    <div className="text-right">
                        <h3 className="text-lg font-bold text-[#1A2D42] mb-1">
                            {store.owner?.first_name} {store.owner?.last_name}
                        </h3>
                        <div className="flex items-center justify-end gap-1 text-gray-500 text-sm">
                            <span>{store.serviceCities?.[0]?.name || "فلسطين، الخليل"}</span>
                            <MapPin className="w-4 h-4 text-[#3A5779]" />
                        </div>
                    </div>
                    <Avatar className="w-14 h-14 border-2 border-white shadow-sm">
                        <AvatarImage src={store.owner?.avatar_url || ""} />
                        <AvatarFallback>{store.owner?.first_name?.[0]}</AvatarFallback>
                    </Avatar>
                </div>
            </div>

            {/* الفاصل */}
            <div className="border-t border-gray-100 mb-6"></div>

            {/* شريط الإحصائيات السفلي */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600">
                
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>عضو منذ {formattedDate}</span>
                </div>

                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-gray-400" />
                    <span>بائع معتمد</span>
                </div>

                <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-gray-400" />
                    <span>تقييم البائع {store.review_rate || "5.0"}</span>
                </div>

                <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-gray-400" />
                    <span>عدد مرات التواصل للطلب {store.orders_count || "27"}</span>
                </div>

            </div>
        </div>
    );
}