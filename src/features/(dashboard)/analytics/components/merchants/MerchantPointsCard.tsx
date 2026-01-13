// src/components/(merchant)/analytics/MerchantPointsCard.tsx
"use client";

import { Info, Coins, Loader2 } from "lucide-react";
import { useGetStoreBalance } from "../../../coins/hooks";
import Link from "next/link";

export function MerchantPointsCard() {
    // Fetch balance using the hook
    const { data, isLoading } = useGetStoreBalance();

    // Get balance or default to 0
    const points = data?.balance || 0;

    return (
        <div className="relative overflow-hidden rounded-xl h-full min-h-[240px] ">
            {/* Background Image */}
            <img
                src="/icons/dashboard/bg-coins.svg"
                alt="Points Background"
                className="absolute inset-0 w-full h-full object-cover z-0"
            />



            {/* Content */}
            <div className=" flex flex-col items-center justify-center h-full p-4">
                {/* Coins Decoration */}
                <div className=" flex items-center justify-center">
                    <img src="/icons/dashboard/coins.svg" alt="" className="drop-shadow-orange-200 drop-shadow-2xl w-28" />
                </div>
                {/* Label with Info Icon */}
                {/* <div className="flex text-gray-2 items-center gap-2 mb-2">
                    <span className=" text-sm font-medium">نقاطك الحالية</span>
                    <Info className="w-4 h-4 " />
                </div> */}

                {/* Points Value */}
                <div className=" text-3xl font-bold mb-4">
                    {isLoading ? (
                        <Loader2 className="w-8 h-8 animate-spin " />
                    ) : (
                        `${points} نقطة`
                    )}
                </div>

                {/* Buy Points Button */}
                <Link href={"/admin/coins/buy"} className="z-40 flex items-center gap-2 bg-[#FFA600] text-white w-3/4 justify-center cursor-pointer py-2.5 rounded-sm font-medium transition-colors shadow-lg">
                    <Coins className="w-5 h-5" />
                    <span>شراء النقط</span>
                </Link>
            </div>
        </div>
    );
}