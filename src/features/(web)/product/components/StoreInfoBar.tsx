"use client";

import { Star, ShoppingCart, CheckCircle, Clock, UserPlus, AlertTriangle } from "lucide-react";
import { Store } from "../api";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface StoreInfoBarProps {
    store: Store;
}

export default function StoreInfoBar({ store }: StoreInfoBarProps) {
    const memberSince = store.created_at
        ? format(new Date(store.created_at), "dd-MM-yyyy", { locale: ar })
        : "";

    return (
        <div className="mt-10 border-t border-gray-200 pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Right Side: Store Info */}
                <div className="flex items-center gap-4">
                    {/* Store Avatar */}
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 shrink-0">
                        {store.logo ? (
                            <img
                                src={store.logo}
                                alt={store.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = "/placeholder.png";
                                    e.currentTarget.onerror = null;
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-xl">
                                {store.name?.[0] || "S"}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <h3 className="font-bold text-gray-900 text-lg">{store.name}</h3>
                        {store.address && (
                            <span className="text-sm text-gray-500">فلسطين, {store.address}</span>
                        )}
                    </div>
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    {memberSince && (
                        <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>عضو منذ {memberSince}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>تاجر معتمد</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-[#FB923C] text-[#FB923C]" />
                        <span>تقييم التاجر {store.review_rate || "0"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>عدد الطلبات المباعة {store.view_count || 0}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-green-500 text-green-600 text-sm font-medium hover:bg-green-50 transition-colors">
                        <UserPlus className="w-4 h-4" />
                        <span>+ تابع</span>
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">
                        <AlertTriangle className="w-4 h-4" />
                        <span>بلغ عن اساءة</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
