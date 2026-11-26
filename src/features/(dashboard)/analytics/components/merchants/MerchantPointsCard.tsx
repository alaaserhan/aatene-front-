"use client";

import Image from "next/image";
import Link from "next/link";
import { Coins, Loader2 } from "lucide-react";
import { useLanguage } from "@/src/hooks/use-language";
import { isCoinsEnabled } from "@/src/config/features";
import { useGetStoreBalance } from "../../../coins/hooks";

export function MerchantPointsCard() {
    if (!isCoinsEnabled()) return null;
    return <PointsCard />;
}

function PointsCard() {
    const lang = useLanguage();
    const { data, isLoading } = useGetStoreBalance();
    const points = Number(data?.balance ?? 0) || 0;

    return (
        <div className="relative overflow-hidden rounded-xl h-full min-h-[240px]">
            <Image src="/icons/dashboard/bg-coins.svg" alt="" fill className="object-cover z-0" />
            <div className="relative flex flex-col items-center justify-center h-full p-4">
                <Image src="/icons/dashboard/coins.svg" alt="" width={112} height={112} className="drop-shadow-orange-200 drop-shadow-2xl w-28 h-auto" />
                <div className="text-3xl font-bold mb-4">
                    {isLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : `${points} نقطة`}
                </div>
                <Link href={`/${lang}/admin/coins/buy`} className="flex items-center gap-2 bg-c2-gold-500 text-white w-3/4 justify-center cursor-pointer py-2.5 rounded-sm font-medium transition-colors shadow-lg">
                    <Coins className="w-5 h-5" />
                    <span>شراء النقاط</span>
                </Link>
            </div>
        </div>
    );
}
