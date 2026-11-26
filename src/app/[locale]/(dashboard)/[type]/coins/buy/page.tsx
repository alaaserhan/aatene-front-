import { Metadata } from "next";
import { notFound } from "next/navigation";
import { BuyPointsPageContent } from "@/src/features/(dashboard)/coins/components/BuyPointsPageContent";
import { generatePageMetadata } from "@/src/lib/seo.config";
import { isCoinsEnabled } from "@/src/config/features";

export const metadata: Metadata = generatePageMetadata("dashboardCoins");

export default function Page() {
    if (!isCoinsEnabled()) notFound();
    return <BuyPointsPageContent />;
}
