import type { Metadata } from "next";
import MerchantLandingPage from "@/src/features/(web)/merchant-landing/components/MerchantLandingPage";
import { MaintenanceGuard } from "@/src/components/providers/MaintenanceGuard";

export const metadata: Metadata = {
    title: "افتح متجرك مجانًا | أعطيني",
    description:
        "افتح متجرك الإلكتروني مجانًا على أعطيني، واعرض منتجاتك وخدماتك بالصور والأسعار والتفاصيل، بدون رسوم تسجيل أو عمولة على المبيعات.",
};

export default function OpenStorePage() {
    return (
        <MaintenanceGuard>
            <MerchantLandingPage />
        </MaintenanceGuard>
    );
}
