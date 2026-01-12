// src/app/(admin)/analytics/overview/page.tsx
"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Loader2 } from "lucide-react";

import { AnalyticsHeader } from "./AnalyticsHeader";
import { CustomersAnalytics } from "./CustomersAnalytics";
import { PlatformAnalytics } from "./PlatformAnalytics";
import { StoresAnalytics } from "./StoresAnalytics";
import { CustomerLocationAnalytics } from "./CustomerLocationAnalytics";
import { ProductsAnalytics } from "./ProductsAnalytics";
import { LatestsProducts } from "./LatestsProducts";
import { HightRatedStores } from "./HightRatedStores";
import { RecentReports } from "./RecentReports";
import { useAuthStore } from "@/src/stores/auth-store";
import MerchantAnalyticsPage from "./merchants/MerchantOverView";

export default function AnalyticsOverviewPage() {
    const [loading, setLoading] = useState(true);
    const [userType, setUserType] = useState<string>("");
    useEffect(() => {
        // Fetch user_type from cookies to determine dashboard view
        const type = Cookies.get("user_type") || "admin";
        setUserType(type);
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F8F9FC]">
                <Loader2 className="w-10 h-10 animate-spin text-[#3A5779]" />
            </div>
        );
    }
    console.log(userType, "userType")
    // --- Merchant View ---
    if (userType === "merchant") {
        return (
            <MerchantAnalyticsPage />
        );
    }

    // --- Admin View ---
    return (
        <div className="flex flex-col">
            <AnalyticsHeader />

            <main className="flex-1 sm:p-6 p-2">
                <div className="grid grid-cols-12 gap-6">

                    {/* --- Row 1 --- */}

                    {/* Left Column (RTL): Customers & Stores */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 order-2 ">
                        <CustomersAnalytics />
                        <StoresAnalytics />
                    </div>

                    {/* Right Column (RTL): Platform Analytics */}
                    <div className="col-span-12 lg:col-span-8 order-1 ">
                        <PlatformAnalytics />
                    </div>


                    {/* --- Row 2 --- */}

                    {/* Left Column (RTL): Customer Location */}
                    <div className="col-span-12 lg:col-span-8 order-4 lg:order-3">
                        <CustomerLocationAnalytics />
                    </div>

                    {/* Right Column (RTL): Products */}
                    <div className="col-span-12 lg:col-span-4 order-3 lg:order-4">
                        <ProductsAnalytics />
                    </div>


                    {/* --- Row 3 --- */}

                    {/* Right Column (RTL): Highest Rated Stores (Narrow) */}
                    <div className="col-span-12 lg:col-span-4 order-5">
                        <HightRatedStores />
                    </div>

                    {/* Left Column (RTL): Latests Products (Wide) */}
                    <div className="col-span-12 lg:col-span-8 order-6 ">
                        <LatestsProducts />
                    </div>

                    {/* --- Row 4 --- */}
                    <div className="col-span-12 order-7">
                        <RecentReports />
                    </div>

                </div>
            </main>
        </div>
    );
}