// src/app/(merchant)/analytics/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";


import { useAuthStore } from "@/src/stores/auth-store";
import { AnalyticsHeader } from "../AnalyticsHeader";
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
        // Small delay to ensure data is ready
        const timer = setTimeout(() => setLoading(false), 100);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center ">
                <Loader2 className="w-10 h-10 animate-spin text-[#3A5779]" />
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <main className="flex-1 p-6">
                <div className="grid grid-cols-12 gap-6">

                    {/* --- Row 1 --- */}
                    
                    {/* Left Column (RTL): Points Card */}
                    <div className="col-span-12 lg:col-span-4 order-2">
                        <MerchantPointsCard />
                    </div>

                    {/* Right Column (RTL): Content Analytics */}
                    <div className="col-span-12 lg:col-span-8 order-1">
                        <MerchantContentAnalytics />
                    </div>


                    {/* --- Row 2 --- */}

                    {/* Profile Views */}
                    <div className="col-span-12 lg:col-span-4 order-3">
                        <MerchantProfileViews />
                    </div>

                    {/* Customer Location */}
                    <div className="col-span-12 lg:col-span-8 order-4">
                        <MerchantCustomerLocation />
                    </div>


                    {/* --- Row 3 --- */}

                    {/* Followers Analytics */}
                    <div className="col-span-12 lg:col-span-6 order-5">
                        <MerchantFollowersAnalytics />
                    </div>

                    {/* Most Viewed */}
                    <div className="col-span-12 lg:col-span-6 order-6">
                        <MerchantMostViewed />
                    </div>

                </div>
            </main>
        </div>
    );
}