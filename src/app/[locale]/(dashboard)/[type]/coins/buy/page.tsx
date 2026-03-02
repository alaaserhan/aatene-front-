import { Metadata } from "next";
import { BuyPointsPageContent } from "@/src/features/(dashboard)/coins/components/BuyPointsPageContent";
import { generatePageMetadata } from "@/src/lib/seo.config";

export const metadata: Metadata = generatePageMetadata("dashboardCoins");

export default function Page() {
    return <BuyPointsPageContent />;
}
