// src/app/(admin)/analytics/overview/page.tsx
"use client";

import { AnalyticsHeader } from "./AnalyticsHeader";
import { CustomersAnalytics } from "./CustomersAnalytics";
import { PlatformAnalytics } from "./PlatformAnalytics";
import { StoresAnalytics } from "./StoresAnalytics";
import { CustomerLocationAnalytics } from "./CustomerLocationAnalytics";
import { ProductsAnalytics } from "./ProductsAnalytics";
import { LatestsProducts } from "./LatestsProducts";
import { HightRatedStores } from "./HightRatedStores";
import { RecentReports } from "./RecentReports";

export default function AnalyticsOverviewPage() {
    return (
        <div className="flex flex-col">
            <AnalyticsHeader />

            <main className="flex-1 p-6">
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
                    <div className="col-span-12 order-7">
                        <RecentReports />
                    </div>

                </div>
            </main>
        </div>
    );
}