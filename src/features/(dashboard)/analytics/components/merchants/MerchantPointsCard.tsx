// src/components/(merchant)/analytics/MerchantPointsCard.tsx
// ⚠️ COINS_DISABLED: هذا المكوّن معطّل مؤقتاً لأن نظام العملات الذهبية (coins) معطّل
// لإعادة تفعيله: أعد تفعيل coins/hooks.ts واحذف كتلة التعليق أدناه

/* COINS_DISABLED_START

"use client";

import { Info, Coins, Loader2 } from "lucide-react";
import { useGetStoreBalance } from "../../../coins/hooks";
import Link from "next/link";

export function MerchantPointsCard() {
    const { data, isLoading } = useGetStoreBalance();
    const points = data?.balance || 0;

    return (
        <div className="relative overflow-hidden rounded-xl h-full min-h-[240px] ">
            <img
                src="/icons/dashboard/bg-coins.svg"
                alt="Points Background"
                className="absolute inset-0 w-full h-full object-cover z-0"
            />
            <div className=" flex flex-col items-center justify-center h-full p-4">
                <div className=" flex items-center justify-center">
                    <img src="/icons/dashboard/coins.svg" alt="" className="drop-shadow-orange-200 drop-shadow-2xl w-28" />
                </div>
                <div className=" text-3xl font-bold mb-4">
                    {isLoading ? (
                        <Loader2 className="w-8 h-8 animate-spin " />
                    ) : (
                        `${points} نقطة`
                    )}
                </div>
                <Link href={"/admin/coins/buy"} className="z-40 flex items-center gap-2 bg-[#FFA600] text-white w-3/4 justify-center cursor-pointer py-2.5 rounded-sm font-medium transition-colors shadow-lg">
                    <Coins className="w-5 h-5" />
                    <span>شراء النقط</span>
                </Link>
            </div>
        </div>
    );
}

COINS_DISABLED_END */

// مكوّن فارغ مؤقت
export function MerchantPointsCard() {
    return null;
}
