import type { Metadata } from "next";
import MerchantLandingPage from "@/src/features/(web)/merchant-landing/components/MerchantLandingPage";
import { MaintenanceGuard } from "@/src/components/providers/MaintenanceGuard";
import { generateDynamicMetadata, SITE_URL } from "@/src/lib/seo.config";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;

    return generateDynamicMetadata({
        title: "افتح متجرك الإلكتروني مجانًا",
        description:
            "افتح متجرك الإلكتروني مجانًا على أعطيني، واعرض منتجاتك وخدماتك بالصور والأسعار والتفاصيل، بدون رسوم تسجيل أو عمولة على المبيعات.",
        url: `${SITE_URL}/${locale}/open-store`,
    });
}

export default function OpenStorePage() {
    return (
        <MaintenanceGuard>
            <MerchantLandingPage />
        </MaintenanceGuard>
    );
}
