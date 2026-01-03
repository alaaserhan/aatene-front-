// src/app/(admin)/analytics/overview/page.tsx
"use client";

import { AnalyticsHeader } from "./AnalyticsHeader";
import { CustomersAnalytics } from "./CustomersAnalytics";
import { PlatformAnalytics } from "./PlatformAnalytics";
import { StoresAnalytics } from "./StoresAnalytics";
import { CustomerLocationAnalytics } from "./CustomerLocationAnalytics";
import { ProductsAnalytics } from "./ProductsAnalytics";

export default function AnalyticsOverviewPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FC]">
      <AnalyticsHeader />

      <main className="flex-1 p-6">
        <div className="grid grid-cols-12 gap-6">
          
          {/* --- Row 1 --- */}

          {/* Left Column (in RTL): Customers & Stores */}
          {/* Order logic: In LTR, this is order-1 (Left). In RTL, visual order swaps so it becomes Left. */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
            <CustomersAnalytics />
            <StoresAnalytics />
          </div>

          {/* Right Column (in RTL): Platform Analytics */}
          {/* Order logic: In LTR, this is order-2 (Right). In RTL, visual order swaps so it becomes Right. */}
          <div className="col-span-12 lg:col-span-8 order-1 lg:order-2">
            <PlatformAnalytics />
          </div>


          {/* --- Row 2 --- */}

          {/* Left Column (in RTL): Customer Location (Wide) */}
          {/* In LTR code: comes first (order-3) -> Left. In RTL Visual: Left. */}
          <div className="col-span-12 lg:col-span-8 order-4 lg:order-3">
             <CustomerLocationAnalytics />
          </div>

          {/* Right Column (in RTL): Products (Narrow) */}
          {/* In LTR code: comes second (order-4) -> Right. In RTL Visual: Right. */}
          <div className="col-span-12 lg:col-span-4 order-3 lg:order-4">
             <ProductsAnalytics />
          </div>

        </div>
      </main>
    </div>
  );
}