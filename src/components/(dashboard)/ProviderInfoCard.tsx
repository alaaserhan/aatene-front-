// src/components/(dashboard)/ProviderInfoCard.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { MapPin, Flag, Plus, Star, ShieldCheck, ShoppingCart, AlarmClock } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Store } from "@/src/features/(dashboard)/stores/api";

// src/components/(dashboard)/ProviderInfoCard.tsx
export interface ProviderData {
    id?: number;
    name: string;
    avatar: string;
    location: string;
    memberSince: string;
    rating: string;
    ordersCount: number | string;
    isVerified?: boolean;
    isFollowing?: boolean;
}

interface ProviderInfoCardProps {
    store?: Store;
    provider?: ProviderData;
    className?: string;
    onReport?: () => void;
    onFollow?: () => void;
    isFollowing?: boolean;
}

import { ReportAbuse } from "@/src/features/(web)/reports/components/ReportAbuse";

export function ProviderInfoCard({ store, provider, className, onReport, onFollow, isFollowing }: ProviderInfoCardProps) {
    // If store is provided, map it to ProviderData
    const data: ProviderData | null = store ? {
        id: store.id,
        name: `${store.owner?.first_name} ${store.owner?.last_name}`,
        avatar: store.owner?.avatar_url || "",
        location: store.serviceCities?.[0]?.name || "فلسطين، الخليل",
        memberSince: store.owner?.created_at
            ? new Date(store.owner.created_at).toLocaleDateString('en-GB')
            : "N/A",
        rating: store.review_rate || "5.0",
        ordersCount: store.conversations_count || 0,
        isVerified: true, // Assuming dashboard stores are verified or we default to true/false
        isFollowing: isFollowing !== undefined ? isFollowing : store.am_i_following
    } : provider ? {
        ...provider,
        isFollowing: isFollowing !== undefined ? isFollowing : provider.isFollowing
    } : null;

    if (!data) return null;

    return (
        <div className={cn("bg-white rounded-2xl p-4 border border-gray-100", className)}>
            {/* الجزء العلوي */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex items-center gap-4  w-full md:w-auto ">
                    <Avatar className="w-14 h-14 border-2 border-white shadow-sm">
                        <AvatarImage src={data.avatar} />
                        <AvatarFallback>{data.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="">
                        <h3 className=" font-medium  mb-1">
                            {data.name}
                        </h3>
                        <div className="flex items-center  gap-1 text-gray-2 text-sm">
                            <MapPin className="w-4 h-4 text-blue-4" />
                            <span>{data.location}</span>
                        </div>
                    </div>

                </div>

                <div className="flex gap-2  w-full md:w-auto">
                    <Button
                        onClick={onFollow}
                        className={cn(
                            "font-medium h-8 px-8 gap-2 rounded-full flex-1 md:flex-none transition-colors",
                            data.isFollowing
                                ? "bg-gray-100 hover:bg-gray-200 text-gray-800 "
                                : "bg-blue-3 text-white"
                        )}
                    >
                        {data.isFollowing ? (
                            <>
                                <span>الغاء المتابعة</span>
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4" />
                                <span>تابع</span>
                            </>
                        )}
                    </Button>

                    {data.id ? (
                        <ReportAbuse type="store" id={data.id}>
                            <Button
                                variant="destructive"
                                className="bg-[#D00416] hover:bg-[#d93838] cursor-pointer text-white font-medium h-8 px-8 gap-2 rounded-full flex-1 md:flex-none"
                            >
                                <Flag className="w-4 h-4" />
                                <span>بلغ عن إساءة</span>
                            </Button>
                        </ReportAbuse>
                    ) : (
                        <Button
                            variant="destructive"
                            onClick={onReport}
                            className="bg-[#D00416] hover:bg-[#d93838] cursor-pointer text-white font-medium h-8 px-8 gap-2 rounded-full flex-1 md:flex-none"
                        >
                            <Flag className="w-4 h-4" />
                            <span>بلغ عن إساءة</span>
                        </Button>
                    )}
                </div>

            </div>

            {/* الفاصل */}
            <div className="border-t border-gray-100 mb-6"></div>

            {/* شريط الإحصائيات السفلي */}
            <div className="flex flex-wrap items-center  gap-8 text-sm text-gray-2">

                <div className="flex items-center gap-2">
                    <AlarmClock className="w-4 h-4 text-black" />
                    <span>عضو منذ {data.memberSince}</span>
                </div>

                {data.isVerified !== false && (
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-black" />
                        <span>بائع معتمد</span>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-black" />
                    <span>تقييم البائع {data.rating}</span>
                </div>

                <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-black" />
                    <span>عدد مرات التواصل للطلب {data.ordersCount}</span>
                </div>

            </div>
        </div>
    );
}