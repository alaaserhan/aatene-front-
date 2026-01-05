// src/components/(merchant)/analytics/MerchantPointsCard.tsx
"use client";

import { Info, Coins } from "lucide-react";

export function MerchantPointsCard() {
    // Static data for now
    const points = 0;

    return (
        <div className="relative overflow-hidden rounded-lg h-full min-h-[280px]">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#F9A825] via-[#FFB74D] to-[#FFC107]" />
            
            {/* Decorative Circles */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full" />
            
            {/* Coins Decoration */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center justify-center">
                <div className="relative">
                    {/* Main Coin */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFD54F] to-[#FF8F00] shadow-lg flex items-center justify-center border-4 border-[#FFE082]">
                        <span className="text-white text-2xl font-bold">$</span>
                    </div>
                    {/* Side Coins */}
                    <div className="absolute -left-6 top-2 w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD54F] to-[#FF8F00] shadow-md flex items-center justify-center border-2 border-[#FFE082] -rotate-12">
                        <span className="text-white text-sm font-bold">$</span>
                    </div>
                    <div className="absolute -right-6 top-2 w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD54F] to-[#FF8F00] shadow-md flex items-center justify-center border-2 border-[#FFE082] rotate-12">
                        <span className="text-white text-sm font-bold">$</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 pt-24">
                {/* Label with Info Icon */}
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-white/80 text-sm font-medium">نقاطك الحالية</span>
                    <Info className="w-4 h-4 text-white/60" />
                </div>

                {/* Points Value */}
                <div className="text-white text-4xl font-bold mb-6">
                    {points} نقطة
                </div>

                {/* Buy Points Button */}
                <button className="flex items-center gap-2 bg-[#E65100] hover:bg-[#BF360C] text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-lg">
                    <Coins className="w-5 h-5" />
                    <span>شراء النقط</span>
                </button>
            </div>
        </div>
    );
}