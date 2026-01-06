// src/app/(merchant)/analytics/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { useAuthStore } from "@/src/stores/auth-store";
import { MerchantPointsCard } from "./MerchantPointsCard";
import { MerchantContentAnalytics } from "./MerchantContentAnalytics";
import { MerchantProfileViews } from "./MerchantProfileViews";
import { MerchantCustomerLocation } from "./MerchantCustomerLocation";
import { MerchantFollowersAnalytics } from "./MerchantFollowersAnalytics";
import { MerchantMostViewed } from "./MerchantMostViewed";

export default function MerchantAnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 100);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F8F9FC]">
                <Loader2 className="w-10 h-10 animate-spin text-[#3A5779]" />
            </div>
        );
    }

    return (
        <div className="flex flex-col ">
            <main className="flex-1 p-6">
                <div className="grid grid-cols-12 gap-6">

                    {/* --- Row 1 --- */}
                    
                    {/* Column 1 (Right in RTL): Content Analytics - Large Content */}
                    <div className="col-span-12 lg:col-span-8 order-1">
                        <MerchantContentAnalytics />
                    </div>

                    {/* Column 2 (Left in RTL): Stacked Column (Points + Profile Views) */}
                    <div className="col-span-12 lg:col-span-4 order-2 flex flex-col gap-6">
                        {/* Part 1: Points */}
                        <MerchantPointsCard />
                        
                        {/* Part 2: Profile Views */}
                        <MerchantProfileViews />
                    </div>


                    {/* --- Row 2 --- */}

                    {/* Column 1 (Right in RTL): Customer Location */}
                    <div className="col-span-12  order-3">
                        <MerchantCustomerLocation />
                    </div>

                    {/* Column 2 (Left in RTL): Followers Analytics */}
                    <div className="col-span-12 lg:col-span-6 order-4">
                        <MerchantFollowersAnalytics />
                    </div>


                    {/* --- Row 3 --- */}

                    {/* Full Width: Most Viewed */}
                    <div className="col-span-12 lg:col-span-6 order-5">
                        <MerchantMostViewed />
                    </div>

                </div>
            </main>
        </div>
    );
}